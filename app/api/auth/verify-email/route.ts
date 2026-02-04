import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createHash } from "node:crypto";

function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") ?? "";
  if (!token) return NextResponse.json({ error: "MISSING_TOKEN" }, { status: 400 });

  const tokenHash = sha256Hex(token);
  const row = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, expiresAt: true },
  });
  if (!row) return NextResponse.json({ error: "INVALID_TOKEN" }, { status: 400 });

  if (row.expiresAt.getTime() <= Date.now()) {
    await prisma.emailVerificationToken.deleteMany({ where: { tokenHash } });
    return NextResponse.json({ error: "EXPIRED_TOKEN" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: row.userId },
    data: { emailVerifiedAt: new Date() },
  });
  await prisma.emailVerificationToken.deleteMany({ where: { userId: row.userId } });

  // UX: redirect to account
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${appUrl}/account`);
}

