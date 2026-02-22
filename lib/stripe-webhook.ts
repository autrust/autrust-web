import Stripe from "stripe";
import { prisma } from "@/lib/db";

export function handleStripeWebhookEvent(event: Stripe.Event): Promise<void> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      id: string;
      amount_total?: number | null;
      currency?: string | null;
      payment_intent?: string | null;
      customer_details?: { email?: string | null } | null;
      metadata?: Record<string, string> | null;
    };
    const reportId = session.metadata?.reportId;
    const listingId = session.metadata?.listingId;
    const sponsorType = session.metadata?.type;
    const amountCents = session.amount_total ?? 1500;

    const run = async () => {
      if (reportId) {
        await prisma.listingReport.update({
          where: { id: reportId },
          data: { status: "PAID_AWAITING_UPLOAD" },
        });
      } else if (!sponsorType && !session.metadata?.type) {
        const updated = await prisma.listingReport.updateMany({
          where: { stripeSessionId: session.id },
          data: { status: "PAID_AWAITING_UPLOAD" },
        });
        if (updated.count === 0) {
          const email = session.customer_details?.email ?? session.metadata?.email ?? null;
          await prisma.reportOrder.upsert({
            where: { stripeSessionId: session.id },
            create: {
              stripeSessionId: session.id,
              stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
              status: "paid",
              amountCents,
              currency: session.currency ?? "eur",
              email,
              phone: session.metadata?.phone ?? null,
              vin: session.metadata?.vin ?? null,
              make: session.metadata?.make ?? null,
              model: session.metadata?.model ?? null,
              provider: "carvertical",
            },
            update: {
              status: "paid",
              amountCents,
              email: email ?? undefined,
              phone: session.metadata?.phone ?? undefined,
              vin: session.metadata?.vin ?? undefined,
              make: session.metadata?.make ?? undefined,
              model: session.metadata?.model ?? undefined,
            },
          });
        }
      }

      if (sponsorType === "sponsor" && listingId) {
        const duration = session.metadata?.duration ?? "7";
        const durationDays = duration === "7" ? 7 : duration === "30" ? 30 : duration === "48h" ? 2 : 7;
        const sponsoredUntil = new Date();
        sponsoredUntil.setDate(sponsoredUntil.getDate() + durationDays);
        await prisma.listing.update({
          where: { id: listingId },
          data: { isSponsored: true, sponsoredUntil },
        });
        await prisma.sponsorPayment.create({
          data: { listingId, amountCents, duration, stripeSessionId: session.id },
        });
      }

      if (session.metadata?.type === "deposit" && listingId && session.metadata?.buyerId && session.metadata?.sellerId) {
        await prisma.depositPayment.create({
          data: {
            listingId,
            buyerId: session.metadata.buyerId,
            sellerId: session.metadata.sellerId,
            amountCents,
            stripeSessionId: session.id,
          },
        });
      }

      if (session.metadata?.type === "plan_change" && session.metadata?.userId && session.metadata?.newPlan) {
        const userId = session.metadata.userId;
        const newPlan = session.metadata.newPlan as "START" | "PRO" | "ELITE" | "ENTERPRISE";
        const maxListings = session.metadata.maxListings ? Number.parseInt(session.metadata.maxListings, 10) : null;
        await prisma.user.update({
          where: { id: userId },
          data: { selectedPlan: newPlan, maxListings: maxListings ?? undefined, pendingPlanChange: null },
        });
      }
    };
    return run();
  }

  if (event.type === "identity.verification_session.verified") {
    const vs = event.data.object as { id: string; metadata?: Record<string, string> | null };
    const userId = vs.metadata?.userId;
    if (userId) {
      return prisma.userKyc.upsert({
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
      }).then(() => undefined);
    }
  }

  if (event.type === "account.updated") {
    const acct = event.data.object as {
      id: string;
      charges_enabled?: boolean;
      payouts_enabled?: boolean;
    };
    return prisma.userStripe.updateMany({
      where: { stripeConnectAccountId: acct.id },
      data: {
        connectChargesEnabled: Boolean(acct.charges_enabled),
        connectPayoutsEnabled: Boolean(acct.payouts_enabled),
      },
    }).then(() => undefined);
  }

  return Promise.resolve();
}
