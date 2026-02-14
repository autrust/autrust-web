import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const CreateSiteFeedbackSchema = z.object({
  stars: z.number().int().min(1).max(5),
  message: z.string().min(1, "Le message est requis").max(2000),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CreateSiteFeedbackSchema.safeParse({
    ...json,
    email: json?.email?.trim() || "",
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { details: { fieldErrors } },
      { status: 400 }
    );
  }

  const { stars, message, email } = parsed.data;

  await prisma.siteFeedback.create({
    data: {
      stars,
      message: message.trim(),
      email: email && email.length > 0 ? email : null,
    },
  });

  return new NextResponse(null, { status: 204 });
}
