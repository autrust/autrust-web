import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { toListingCardModelFromDb } from "@/lib/listingsDb";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const idsParam = url.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json({ items: [] });
  }
  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
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
