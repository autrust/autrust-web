import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/turnstile";

const LoginSchema = z.object({
  email: z.string().email().transform((s) => s.trim().toLowerCase()),
  password: z.string().min(1),
  turnstileToken: z.string().max(2048).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const { email, password, turnstileToken } = parsed.data;
  const forwarded = req.headers.get("x-forwarded-for");
  const remoteIp = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? undefined;
  const turnstile = await verifyTurnstileToken(turnstileToken, remoteIp);
  if (!turnstile.success) {
    return NextResponse.json(
      { error: "TURNSTILE_FAILED", message: "Vérification anti-robot échouée. Réessayez." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });
  if (!user) return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}

