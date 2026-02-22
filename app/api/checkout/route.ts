import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppUrl, getStripeServer } from "@/lib/stripe";

/** Checkout simple : Rapport CarVertical 15 €. Optionnel : vin, make, model, email, phone (metadata + customer_email). */
const REPORT_PRICE_CENTS = 1500; // 15 €

const BodySchema = z.object({
  vin: z.string().max(50).optional(),
  make: z.string().max(80).optional(),
  model: z.string().max(80).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(30).optional(),
});

export async function POST(req: Request) {
  let body: z.infer<typeof BodySchema> = {};
  try {
    const json = await req.json().catch(() => ({}));
    body = BodySchema.parse(json);
  } catch {
    // body optionnel
  }

  let stripe;
  try {
    stripe = getStripeServer();
  } catch {
    return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 503 });
  }

  const baseUrl = getAppUrl();
  const metadata: Record<string, string> = {};
  if (body.vin?.trim()) metadata.vin = body.vin.trim().slice(0, 50);
  if (body.make?.trim()) metadata.make = body.make.trim().slice(0, 80);
  if (body.model?.trim()) metadata.model = body.model.trim().slice(0, 80);
  if (body.email?.trim()) metadata.email = body.email.trim().slice(0, 255);
  if (body.phone?.trim()) metadata.phone = body.phone.trim().slice(0, 30);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.email?.trim() || undefined,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: "Rapport CarVertical — 15€",
            description: "Rapport fourni par CarVertical (prestataire tiers).",
          },
          unit_amount: REPORT_PRICE_CENTS,
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/paiement-reussi?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/paiement-annule`,
    metadata: Object.keys(metadata).length ? metadata : undefined,
  });

  return NextResponse.json({ url: session.url });
}
