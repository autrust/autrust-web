import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getStripeServer, getAppUrl } from "@/lib/stripe";
import { isProPromoActive } from "@/lib/constants";

const PLAN_PRICE_EUR: Record<string, number> = {
  START: 49,
  PRO: 189,
  ELITE: 289,
  ENTERPRISE: 489,
};

function getPlanOrder(plan: string): number {
  const order: Record<string, number> = {
    START: 1,
    PRO: 2,
    ELITE: 3,
    ENTERPRISE: 4,
  };
  return order[plan] ?? 0;
}

function getPlanLimits(plan: "START" | "PRO" | "ELITE" | "ENTERPRISE") {
  switch (plan) {
    case "START":
      return { min: 1, max: 14 };
    case "PRO":
      return { min: 15, max: 30 };
    case "ELITE":
      return { min: 31, max: 120 };
    case "ENTERPRISE":
      return { min: 120, max: 1000 };
  }
}

const BodySchema = z.object({
  newPlan: z.enum(["START", "PRO", "ELITE", "ENTERPRISE"]),
  maxListings: z.coerce.number().int().positive().optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      profileType: true,
      selectedPlan: true,
      maxListings: true,
    },
  });

  if (!dbUser || dbUser.profileType !== "CONCESSIONNAIRE") {
    return NextResponse.json({ error: "NOT_PROFESSIONAL" }, { status: 400 });
  }

  const { newPlan, maxListings } = parsed.data;

  // Vérifier les limites du plan
  if (maxListings !== undefined && maxListings !== null) {
    const limits = getPlanLimits(newPlan);
    if (maxListings < limits.min || maxListings > limits.max) {
      return NextResponse.json(
        {
          error: "INVALID_LISTINGS_COUNT",
          message: `Le nombre d'annonces doit être entre ${limits.min} et ${limits.max} pour le pack ${newPlan}.`,
        },
        { status: 400 }
      );
    }
  }

  const currentPlan = dbUser.selectedPlan;
  const isUpgrade = currentPlan
    ? getPlanOrder(newPlan) > getPlanOrder(currentPlan)
    : true; // Si pas de plan actuel, considérer comme upgrade

  if (isUpgrade) {
    // Upgrade : pendant la promo (avant 1er juillet 2026) = gratuit ; après = paiement Stripe comme CarVertical
    const promoActive = isProPromoActive();
    const currentPrice = promoActive ? 0 : (currentPlan ? PLAN_PRICE_EUR[currentPlan] : 0);
    const newPrice = promoActive ? 0 : PLAN_PRICE_EUR[newPlan];
    const differenceCents = Math.round((newPrice - currentPrice) * 100);

    if (differenceCents <= 0) {
      // Pas de différence à payer, activer directement
      await prisma.user.update({
        where: { id: user.id },
        data: {
          selectedPlan: newPlan,
          maxListings: maxListings ?? dbUser.maxListings,
          pendingPlanChange: null,
        },
      });
      return NextResponse.json({ ok: true, immediate: true });
    }

    // Créer une session Stripe pour payer la différence
    const stripe = getStripeServer();
    const appUrl = getAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${appUrl}/account?plan_change=success`,
      cancel_url: `${appUrl}/account?plan_change=cancel`,
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        type: "plan_change",
        userId: user.id,
        currentPlan: currentPlan ?? "",
        newPlan,
        maxListings: maxListings?.toString() ?? "",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: differenceCents,
            product_data: {
              name: `Upgrade abonnement → ${newPlan}`,
              description: `Différence entre ${currentPlan ?? "aucun"} et ${newPlan} (${differenceCents / 100} €)`,
            },
          },
        },
      ],
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } else {
    // Downgrade : enregistrer pour le mois prochain
    await prisma.user.update({
      where: { id: user.id },
      data: {
        pendingPlanChange: newPlan,
        maxListings: maxListings ?? dbUser.maxListings, // On peut mettre à jour maxListings même en downgrade
      },
    });
    return NextResponse.json({ ok: true, pending: true });
  }
}
