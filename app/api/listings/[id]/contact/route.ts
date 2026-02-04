import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const BodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listingId } = await params;
  const body = await req.json();
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides" },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId, status: "ACTIVE" },
    select: { id: true, sellerId: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
  }

  await prisma.contactRequest.create({
    data: {
      listingId: listing.id,
      sellerId: listing.sellerId ?? undefined,
      senderName: parsed.data.name,
      senderEmail: parsed.data.email,
      message: parsed.data.message,
    },
  });

  return NextResponse.json({ ok: true });
}
