import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripeServer } from "@/lib/stripe";
import { handleStripeWebhookEvent } from "@/lib/stripe-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = (await headers()).get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "MISSING_WEBHOOK_CONFIG" }, { status: 400 });
  }

  const stripe = getStripeServer();
  const payload = await req.text();

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "BAD_SIGNATURE" }, { status: 400 });
  }

  await handleStripeWebhookEvent(event);
  return NextResponse.json({ received: true });
}
