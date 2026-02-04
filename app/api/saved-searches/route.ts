import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import type { ListingFilters } from "@/lib/listings";

const MAX_SAVED_SEARCHES = 3;

const CreateSavedSearchSchema = z.object({
  name: z.string().min(1).max(100),
  filters: z.record(z.unknown()),
});

const UpdateSavedSearchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  const json = await req.json().catch(() => null);
  const parsed = CreateSavedSearchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const { name, filters } = parsed.data;

  // Vérifier la limite de 3 recherches sauvegardées
  const count = await prisma.savedSearch.count({
    where: { userId: user.id },
  });

  if (count >= MAX_SAVED_SEARCHES) {
    return NextResponse.json(
      { error: "MAX_SEARCHES_REACHED", message: `Maximum ${MAX_SAVED_SEARCHES} recherches sauvegardées` },
      { status: 400 }
    );
  }

  const savedSearch = await prisma.savedSearch.create({
    data: {
      userId: user.id,
      name,
      filters: filters as ListingFilters,
      lastCheckedAt: new Date(),
      newListingsCount: 0,
    },
  });

  return NextResponse.json({ savedSearch });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ savedSearches: [] });
  }

  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ savedSearches });
}

export async function DELETE(req: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });
  }

  await prisma.savedSearch.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "MISSING_ID" }, { status: 400 });
  }

  const json = await req.json().catch(() => null);
  const parsed = UpdateSavedSearchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const savedSearch = await prisma.savedSearch.updateMany({
    where: {
      id,
      userId: user.id,
    },
    data: parsed.data,
  });

  return NextResponse.json({ savedSearch });
}
