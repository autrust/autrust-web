import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { toListingCardModelFromDb } from "@/lib/listingsDb";

// CUID ~25 caractères alphanumériques
const ListingIdSchema = z.string().min(20).max(30).regex(/^[a-z0-9]+$/i);
const IdsQuerySchema = z
  .string()
  .max(500)
  .transform((s) => s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 10))
  .pipe(z.array(ListingIdSchema));

export async function GET(req: Request) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json({ items: [] });
  }
  const parsed = IdsQuerySchema.safeParse(idsParam);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_IDS", items: [] }, { status: 400 });
  }
  const ids = parsed.data;
  if (ids.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.listing.findMany({
    where: { id: { in: ids }, status: "ACTIVE" },
    include: {
      photos: { orderBy: { order: "asc" }, take: 1 },
    },
  });

  const orderMap = new Map(ids.map((id, i) => [id, i]));
  const sorted = [...items].sort((a, b) => (orderMap.get(a.id) ?? 99) - (orderMap.get(b.id) ?? 99));
  const results = sorted.map(toListingCardModelFromDb);

  return NextResponse.json({ items: results });
}
