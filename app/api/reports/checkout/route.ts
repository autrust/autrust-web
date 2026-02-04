import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getAppUrl, getStripeServer } from "@/lib/stripe";

const CheckoutSchema = z.object({
  manageToken: z.string().min(10),
  provider: z.string().min(2), // "carvertical" | "autodna" | "manual" ...
  country: z.string().optional(), // BE/FR/NL/LU
  vin: z.string().optional(),
});

// MVP pricing (à adapter)
const REPORT_PRICE_CENTS = 1990; // 19.90€
const REPORT_CURRENCY = "eur";

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CheckoutSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { manageToken, provider, country, vin } = parsed.data;
  const listing = await prisma.listing.findFirst({
    where: { manageToken },
    select: { id: true, title: true, vin: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const report = await prisma.listingReport.create({
    data: {
      listingId: listing.id,
      provider,
      country,
      vin: vin ?? listing.vin ?? undefined,
      amountCents: REPORT_PRICE_CENTS,
      currency: REPORT_CURRENCY,
      status: "PENDING_PAYMENT",
    },
  });

  const stripe = getStripeServer();
  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: REPORT_CURRENCY,
          unit_amount: REPORT_PRICE_CENTS,
          product_data: {
            name: "Rapport d’historique véhicule",
            description: `Annonce: ${listing.title}`,
          },
        },
      },
    ],
    metadata: {
      reportId: report.id,
      listingId: listing.id,
    },
    success_url: `${appUrl}/sell/manage/${encodeURIComponent(
      manageToken
    )}?success=1&report=${encodeURIComponent(report.id)}`,
    cancel_url: `${appUrl}/sell/manage/${encodeURIComponent(manageToken)}?canceled=1`,
  });

  await prisma.listingReport.update({
    where: { id: report.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url, reportId: report.id });
}

