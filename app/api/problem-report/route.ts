import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sanitizeText } from "@/lib/sanitize";
import { verifyTurnstileToken } from "@/lib/turnstile";

const CreateProblemReportSchema = z.object({
  message: z.string().min(1, "Le message est requis").max(2000),
  email: z.string().email().optional().or(z.literal("")),
  pageUrl: z.string().max(500).optional(),
  turnstileToken: z.string().max(2048).optional(),
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

  const { message, email, pageUrl, turnstileToken } = parsed.data;
  const forwarded = req.headers.get("x-forwarded-for");
  const remoteIp = forwarded?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? undefined;
  const turnstile = await verifyTurnstileToken(turnstileToken, remoteIp);
  if (!turnstile.success) {
    return NextResponse.json(
      { error: "TURNSTILE_FAILED", message: "Vérification anti-robot échouée. Réessayez." },
      { status: 400 }
    );
  }

  await prisma.problemReport.create({
    data: {
      message: sanitizeText(message, 2000),
      email: email && email.length > 0 ? email : null,
      pageUrl: pageUrl ? sanitizeText(pageUrl, 500) : null,
    },
  });

  return new NextResponse(null, { status: 204 });
}
