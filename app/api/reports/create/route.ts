import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const CreateSchema = z.object({
  manageToken: z.string().min(10),
  provider: z.enum(["carvertical", "manual"]),
  country: z.string().optional(),
  vin: z.string().optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { manageToken, provider, country, vin } = parsed.data;

  const listing = await prisma.listing.findFirst({
    where: { manageToken },
    select: { id: true, vin: true },
  });
  if (!listing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const report = await prisma.listingReport.create({
    data: {
      listingId: listing.id,
      provider,
      country,
      vin: vin ?? listing.vin ?? undefined,
      amountCents: 0,
      currency: "eur",
      // Ici, le vendeur paye directement chez le provider (carVertical) puis uploade le PDF.
      status: "PAID_AWAITING_UPLOAD",
    },
  });

  return NextResponse.json({ reportId: report.id, status: report.status });
}

