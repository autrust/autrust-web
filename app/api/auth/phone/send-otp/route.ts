import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createHash } from "node:crypto";

const Schema = z.object({
  phone: z.string().trim().min(6).max(30),
});

function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const phone = parsed.data.phone;
  const code = generateOtp();
  const codeHash = sha256Hex(code);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 min

  await prisma.phoneOtp.create({
    data: {
      userId: user.id,
      phone,
      codeHash,
      expiresAt,
    },
  });

  // DEV fallback: log code
  console.log(`[sms-otp] phone=${phone} code=${code}`);

  return NextResponse.json({ ok: true });
}

