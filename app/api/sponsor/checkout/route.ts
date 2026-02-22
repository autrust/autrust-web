import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAppUrl, getStripeServer } from "@/lib/stripe";

/** Top annonces (mises en avant) et Boost restent toujours payants ; l'argent passe par Stripe (non concernés par la promo pro). */
const CheckoutSchema = z.object({
  manageToken: z.string().min(10),
  duration: z.enum(["7", "30", "48h"]), // 7j, 30j, ou Boost express 48h
});

// Prix selon la durée (particuliers / options premium) — paiement Stripe
const SPONSOR_PRICES: Record<string, { cents: number; label: string; description: string }> = {
  "7": { cents: 999, label: "Top recherche 7 jours", description: "7 jours" },
  "30": { cents: 1999, label: "Top recherche 30 jours", description: "30 jours" },
  "48h": { cents: 499, label: "Boost express 48 h", description: "48 heures" },
};

const SPONSOR_CURRENCY = "eur";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CheckoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { manageToken, duration } = parsed.data;
  const listing = await prisma.listing.findFirst({
    where: { manageToken },
    select: { id: true, title: true, isSponsored: true, sponsoredUntil: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Vérifier si le sponsoring est encore actif
  const now = new Date();
  const isCurrentlySponsored = listing.isSponsored && 
    listing.sponsoredUntil && 
    new Date(listing.sponsoredUntil) > now;

  if (isCurrentlySponsored) {
    return NextResponse.json({ error: "ALREADY_SPONSORED" }, { status: 400 });
  }

  const priceConfig = SPONSOR_PRICES[duration];
  if (!priceConfig) {
    return NextResponse.json({ error: "INVALID_DURATION" }, { status: 400 });
  }

  const stripe = getStripeServer();
  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: SPONSOR_CURRENCY,
          unit_amount: priceConfig.cents,
          product_data: {
            name: `${priceConfig.label} - Annonce`,
            description: `Annonce: ${listing.title} (${priceConfig.description})`,
          },
        },
      },
    ],
    metadata: {
      listingId: listing.id,
      manageToken: manageToken,
      type: "sponsor",
      duration: duration,
    },
    success_url: `${appUrl}/sell/manage/${encodeURIComponent(
      manageToken
    )}?success=1&sponsored=1`,
    cancel_url: `${appUrl}/sell/manage/${encodeURIComponent(manageToken)}?canceled=1`,
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}
