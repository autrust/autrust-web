import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";

const ToggleFavoriteSchema = z.object({
  listingId: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await requireUser();
  const json = await req.json().catch(() => null);
  const parsed = ToggleFavoriteSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const { listingId } = parsed.data;

  // Vérifier que l'annonce existe
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });
  if (!listing) {
    return NextResponse.json({ error: "LISTING_NOT_FOUND" }, { status: 404 });
  }

  // Vérifier si déjà favori
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_listingId: {
        userId: user.id,
        listingId,
      },
    },
  });

  if (existing) {
    // Retirer des favoris
    await prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId,
        },
      },
    });
    return NextResponse.json({ favorited: false });
  } else {
    // Ajouter aux favoris
    await prisma.favorite.create({
      data: {
        userId: user.id,
        listingId,
      },
    });
    return NextResponse.json({ favorited: true });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ favorites: [] });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { listingId: true },
  });

  return NextResponse.json({
    favorites: favorites.map((f) => f.listingId),
  });
}
