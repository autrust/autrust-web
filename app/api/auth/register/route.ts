import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, hashPassword, isPasswordStrongEnough } from "@/lib/auth";
import { randomBytes, createHash } from "node:crypto";

const RegisterSchema = z.object({
  email: z.string().email().transform((s) => s.trim().toLowerCase()),
  password: z.string().min(8),
});

function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  if (!isPasswordStrongEnough(password)) {
    return NextResponse.json({ error: "WEAK_PASSWORD" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "EMAIL_ALREADY_USED" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true },
  });

  // Email verification token (dev: log the link)
  const token = randomBytes(32).toString("base64url");
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
  await prisma.emailVerificationToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  console.log(`[email-verify] ${appUrl}/api/auth/verify-email?token=${token}`);

  await createSession(user.id);

  return NextResponse.json({ ok: true });
}

