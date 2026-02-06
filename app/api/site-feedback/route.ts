import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const SiteFeedbackSchema = z.object({
  message: z.string().min(1, "Veuillez décrire ce qu'on pourrait améliorer").max(2000),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = SiteFeedbackSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { message, email } = parsed.data;

  await prisma.siteFeedback.create({
    data: {
      message: message.trim(),
      email: email?.trim() || null,
    },
  });

  return NextResponse.json({ success: true });
}
