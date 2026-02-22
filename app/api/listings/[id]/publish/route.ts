import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/**
 * POST /api/listings/[id]/publish
 * Passe l'annonce de DRAFT à ACTIVE. Réservé au vendeur.
 * Nécessite : email vérifié + téléphone vérifié.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id: listingId } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, status: true, sellerId: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  if (listing.sellerId !== user.id) {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  if (listing.status !== "DRAFT") {
    return NextResponse.json(
      { error: "NOT_DRAFT", message: "L'annonce n'est pas en brouillon." },
      { status: 400 }
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { emailVerifiedAt: true, phoneVerifiedAt: true },
  });

  if (!dbUser?.emailVerifiedAt || !dbUser?.phoneVerifiedAt) {
    return NextResponse.json(
      {
        error: "VERIFICATION_REQUIRED",
        message:
          "Vérifiez votre email et votre téléphone dans Mon compte pour pouvoir publier l'annonce.",
      },
      { status: 400 }
    );
  }

  await prisma.listing.update({
    where: { id: listingId },
    data: { status: "ACTIVE" },
  });

  return NextResponse.json({ ok: true, status: "ACTIVE" });
}
