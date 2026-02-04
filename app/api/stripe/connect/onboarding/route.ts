import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getAppUrl, getStripeServer } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { stripe: true, kyc: true },
  });
  if (!dbUser) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  if (!dbUser.emailVerifiedAt || !dbUser.phoneVerifiedAt) {
    return NextResponse.json({ error: "MISSING_EMAIL_OR_PHONE_VERIFICATION" }, { status: 403 });
  }
  if (dbUser.kyc?.status !== "VERIFIED") {
    return NextResponse.json({ error: "KYC_REQUIRED" }, { status: 403 });
  }

  let stripe;
  try {
    stripe = getStripeServer();
  } catch {
    return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 400 });
  }

  let connectAccountId = dbUser.stripe?.stripeConnectAccountId ?? null;
  if (!connectAccountId) {
    const acct = await stripe.accounts.create({
      type: "express",
      // MVP: default BE. Later: ask user country (BE/FR/NL/LU).
      country: "BE",
      email: dbUser.email,
      business_type: "individual",
      metadata: { userId: dbUser.id },
    });
    connectAccountId = acct.id;

    await prisma.userStripe.upsert({
      where: { userId: dbUser.id },
      create: { userId: dbUser.id, stripeConnectAccountId: connectAccountId },
      update: { stripeConnectAccountId: connectAccountId },
    });
  }

  const appUrl = getAppUrl();
  const link = await stripe.accountLinks.create({
    account: connectAccountId,
    type: "account_onboarding",
    refresh_url: `${appUrl}/account`,
    return_url: `${appUrl}/account`,
  });

  return NextResponse.json({ url: link.url });
}

