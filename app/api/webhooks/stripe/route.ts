import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripeServer } from "@/lib/stripe";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string; metadata?: Record<string, string> | null };
    const reportId = session.metadata?.reportId;
    const listingId = session.metadata?.listingId;
    const sponsorType = session.metadata?.type;

    // Gestion des rapports
    if (reportId) {
      await prisma.listingReport.update({
        where: { id: reportId },
        data: { status: "PAID_AWAITING_UPLOAD" },
      });
    } else {
      // fallback: match by session id
      await prisma.listingReport.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: "PAID_AWAITING_UPLOAD" },
      });
    }

    // Gestion du sponsoring
    if (sponsorType === "sponsor" && listingId) {
      const duration = session.metadata?.duration;
      const durationDays = duration === "7" ? 7 : duration === "20" ? 20 : duration === "30" ? 30 : 30;
      
      const sponsoredUntil = new Date();
      sponsoredUntil.setDate(sponsoredUntil.getDate() + durationDays);
      
      await prisma.listing.update({
        where: { id: listingId },
        data: { 
          isSponsored: true,
          sponsoredUntil: sponsoredUntil,
        },
      });
    }
  }

  if (event.type === "identity.verification_session.verified") {
    const vs = event.data.object as { id: string; metadata?: Record<string, string> | null };
    const userId = vs.metadata?.userId;
    if (userId) {
      await prisma.userKyc.upsert({
        where: { userId },
        create: {
          userId,
          status: "VERIFIED",
          verifiedAt: new Date(),
          stripeVerificationSessionId: vs.id,
        },
        update: {
          status: "VERIFIED",
          verifiedAt: new Date(),
          stripeVerificationSessionId: vs.id,
        },
      });
    }
  }

  if (event.type === "account.updated") {
    const acct = event.data.object as {
      id: string;
      charges_enabled?: boolean;
      payouts_enabled?: boolean;
    };
    await prisma.userStripe.updateMany({
      where: { stripeConnectAccountId: acct.id },
      data: {
        connectChargesEnabled: Boolean(acct.charges_enabled),
        connectPayoutsEnabled: Boolean(acct.payouts_enabled),
      },
    });
  }

  return NextResponse.json({ received: true });
}

