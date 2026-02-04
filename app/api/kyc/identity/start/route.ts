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
    include: { kyc: true },
  });
  if (!dbUser) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  if (!dbUser.emailVerifiedAt || !dbUser.phoneVerifiedAt) {
    return NextResponse.json({ error: "MISSING_EMAIL_OR_PHONE_VERIFICATION" }, { status: 403 });
  }

  let stripe;
  try {
    stripe = getStripeServer();
  } catch {
    return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 400 });
  }

  const session = await stripe.identity.verificationSessions.create({
    type: "document",
    metadata: { userId: dbUser.id },
    return_url: `${getAppUrl()}/account`,
    options: {
      document: {
        // selfie optionnel => on ne force pas le matching selfie
        require_matching_selfie: false,
      },
    },
  });

  await prisma.userKyc.upsert({
    where: { userId: dbUser.id },
    create: {
      userId: dbUser.id,
      status: "PENDING_REVIEW",
      stripeVerificationSessionId: session.id,
    },
    update: {
      status: "PENDING_REVIEW",
      stripeVerificationSessionId: session.id,
    },
  });

  return NextResponse.json({ url: session.url });
}

