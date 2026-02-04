import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getAppUrl, getStripeServer } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  listingId: z.string().min(1),
  amountCents: z.number().int().min(100).max(5_000_000),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const buyer = await prisma.user.findUnique({
    where: { id: user.id },
    include: { kyc: true },
  });
  if (!buyer) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const buyerOk =
    Boolean(buyer.emailVerifiedAt) &&
    Boolean(buyer.phoneVerifiedAt) &&
    buyer.kyc?.status === "VERIFIED";
  if (!buyerOk) return NextResponse.json({ error: "BUYER_NOT_VERIFIED" }, { status: 403 });

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    include: { seller: { include: { kyc: true, stripe: true } } },
  });
  if (!listing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const seller = listing.seller;
  const sellerOk =
    !!seller &&
    Boolean(seller.emailVerifiedAt) &&
    Boolean(seller.phoneVerifiedAt) &&
    seller.kyc?.status === "VERIFIED" &&
    Boolean(seller.stripe?.stripeConnectAccountId) &&
    Boolean(seller.stripe?.connectPayoutsEnabled);
  if (!sellerOk) return NextResponse.json({ error: "SELLER_NOT_READY" }, { status: 403 });

  let stripe;
  try {
    stripe = getStripeServer();
  } catch {
    return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 400 });
  }

  const appUrl = getAppUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${appUrl}/listings/${listing.id}?deposit=success`,
    cancel_url: `${appUrl}/listings/${listing.id}?deposit=cancel`,
    payment_method_types: ["card", "sepa_debit"],
    customer_email: buyer.email,
    metadata: {
      type: "deposit",
      listingId: listing.id,
      buyerId: buyer.id,
      sellerId: seller.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: parsed.data.amountCents,
          product_data: {
            name: `Acompte • ${listing.title}`,
          },
        },
      },
    ],
    payment_intent_data: {
      transfer_data: {
        destination: seller.stripe!.stripeConnectAccountId!,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}

