import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const CreateProblemReportSchema = z.object({
  message: z.string().min(1, "Le message est requis").max(2000),
  email: z.string().email().optional().or(z.literal("")),
  pageUrl: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CreateProblemReportSchema.safeParse({
    ...json,
    email: json?.email?.trim() ?? "",
    pageUrl: json?.pageUrl?.trim() || undefined,
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { details: { fieldErrors } },
      { status: 400 }
    );
  }

  const { message, email, pageUrl } = parsed.data;

  await prisma.problemReport.create({
    data: {
      message: message.trim(),
      email: email && email.length > 0 ? email : null,
      pageUrl: pageUrl || null,
    },
  });

  return new NextResponse(null, { status: 204 });
}
