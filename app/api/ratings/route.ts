import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";

const CreateRatingSchema = z.object({
  toUserId: z.string().min(1),
  stars: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
  listingId: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  const json = await req.json().catch(() => null);
  const parsed = CreateRatingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const { toUserId, stars, comment, listingId } = parsed.data;

  // Ne pas pouvoir se noter soi-même
  if (toUserId === user.id) {
    return NextResponse.json({ error: "CANNOT_RATE_SELF" }, { status: 400 });
  }

  // Vérifier que l'utilisateur cible existe
  const toUser = await prisma.user.findUnique({
    where: { id: toUserId },
    select: { id: true },
  });
  if (!toUser) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  // Vérifier que l'annonce existe si fournie
  if (listingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true },
    });
    if (!listing) {
      return NextResponse.json({ error: "LISTING_NOT_FOUND" }, { status: 404 });
    }
  }

  // Créer ou mettre à jour l'évaluation
  const rating = await prisma.rating.upsert({
    where: {
      fromUserId_toUserId_listingId: {
        fromUserId: user.id,
        toUserId,
        listingId: listingId || null,
      },
    },
    update: {
      stars,
      comment: comment || null,
    },
    create: {
      fromUserId: user.id,
      toUserId,
      stars,
      comment: comment || null,
      listingId: listingId || null,
    },
  });

  return NextResponse.json({ rating });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "MISSING_USER_ID" }, { status: 400 });
  }

  const ratings = await prisma.rating.findMany({
    where: { toUserId: userId },
    include: {
      fromUser: {
        select: {
          id: true,
          email: true,
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculer la moyenne
  const average = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
    : 0;

  return NextResponse.json({
    ratings,
    average: Math.round(average * 10) / 10, // Arrondir à 1 décimale
    count: ratings.length,
  });
}
