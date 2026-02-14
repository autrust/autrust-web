import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const BodySchema = z.object({
  profileType: z.enum(["PARTICULIER", "CONCESSIONNAIRE"]),
});

export async function POST(req: Request) {
  const user = await requireUser();
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { profileType: parsed.data.profileType },
  });

  return NextResponse.json({ ok: true });
}
