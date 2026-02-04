import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createHash } from "node:crypto";

const Schema = z.object({
  phone: z.string().trim().min(6).max(30),
  code: z.string().trim().min(4).max(10),
});

function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = Schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const { phone, code } = parsed.data;
  const codeHash = sha256Hex(code);

  const row = await prisma.phoneOtp.findFirst({
    where: { userId: user.id, phone, codeHash },
    orderBy: { createdAt: "desc" },
  });

  if (!row) return NextResponse.json({ error: "INVALID_CODE" }, { status: 400 });
  if (row.expiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: "EXPIRED_CODE" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { phone, phoneVerifiedAt: new Date() },
  });
  await prisma.phoneOtp.deleteMany({ where: { userId: user.id, phone } });

  return NextResponse.json({ ok: true });
}

