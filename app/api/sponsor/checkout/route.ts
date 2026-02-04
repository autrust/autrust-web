import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAppUrl, getStripeServer } from "@/lib/stripe";

const CheckoutSchema = z.object({
  manageToken: z.string().min(10),
  duration: z.enum(["7", "20", "30"]), // Durée en jours
});

// Prix selon la durée
const SPONSOR_PRICES: Record<string, number> = {
  "7": 800,   // 8€ pour 7 jours
  "20": 1500, // 15€ pour 20 jours
  "30": 2000, // 20€ pour 30 jours
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

  const priceCents = SPONSOR_PRICES[duration];
  if (!priceCents) {
    return NextResponse.json({ error: "INVALID_DURATION" }, { status: 400 });
  }

  const stripe = getStripeServer();
  const appUrl = getAppUrl();

  const durationLabel = duration === "7" ? "7 jours" : duration === "20" ? "20 jours" : "30 jours";
  const priceLabel = duration === "7" ? "8€" : duration === "20" ? "15€" : "20€";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: SPONSOR_CURRENCY,
          unit_amount: priceCents,
          product_data: {
            name: `Mise en avant d'annonce - ${durationLabel}`,
            description: `Annonce: ${listing.title} (${durationLabel})`,
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
