import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { randomBytes, createHash } from "node:crypto";

function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, emailVerifiedAt: true },
  });
  if (!dbUser) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (dbUser.emailVerifiedAt) return NextResponse.json({ ok: true });

  await prisma.emailVerificationToken.deleteMany({ where: { userId: dbUser.id } });

  const token = randomBytes(32).toString("base64url");
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await prisma.emailVerificationToken.create({
    data: { userId: dbUser.id, tokenHash, expiresAt },
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  console.log(`[email-verify] ${appUrl}/api/auth/verify-email?token=${token}`);

  return NextResponse.json({ ok: true });
}

