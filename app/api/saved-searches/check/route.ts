import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { parseListingFilters } from "@/lib/listings";
import { dbBodyTypeFromSlug, dbCategoryFromSlug } from "@/lib/listingsDb";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  const user = await requireUser();
  const json = await req.json().catch(() => null);
  const searchId = json?.searchId;

  if (!searchId || typeof searchId !== "string") {
    return NextResponse.json({ error: "MISSING_SEARCH_ID" }, { status: 400 });
  }

  const savedSearch = await prisma.savedSearch.findFirst({
    where: {
      id: searchId,
      userId: user.id,
    },
  });

  if (!savedSearch) {
    return NextResponse.json({ error: "SEARCH_NOT_FOUND" }, { status: 404 });
  }

  // Construire les filtres Prisma à partir des filtres sauvegardés
  const filters = savedSearch.filters as Record<string, unknown>;
  const parsedFilters = parseListingFilters(filters);

  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    createdAt: { gt: savedSearch.lastCheckedAt }, // Seulement les nouvelles annonces
    ...(parsedFilters.city ? { city: { contains: parsedFilters.city } } : {}),
    ...(parsedFilters.q
      ? { OR: [{ title: { contains: parsedFilters.q } }, { description: { contains: parsedFilters.q } }] }
      : {}),
    ...(parsedFilters.minPrice !== undefined || parsedFilters.maxPrice !== undefined
      ? {
          price: {
            ...(parsedFilters.minPrice !== undefined ? { gte: parsedFilters.minPrice } : {}),
            ...(parsedFilters.maxPrice !== undefined ? { lte: parsedFilters.maxPrice } : {}),
          },
        }
      : {}),
    ...(parsedFilters.minYear !== undefined || parsedFilters.maxYear !== undefined
      ? {
          year: {
            ...(parsedFilters.minYear !== undefined ? { gte: parsedFilters.minYear } : {}),
            ...(parsedFilters.maxYear !== undefined ? { lte: parsedFilters.maxYear } : {}),
          },
        }
      : {}),
    ...(parsedFilters.maxKm !== undefined ? { km: { lte: parsedFilters.maxKm } } : {}),
  };

  if (parsedFilters.categorySlug) {
    where.category = dbCategoryFromSlug(parsedFilters.categorySlug);
  }
  if (parsedFilters.bodyTypeSlug) {
    where.bodyType = dbBodyTypeFromSlug(parsedFilters.bodyTypeSlug);
  }
  if (parsedFilters.fuel) {
    const f = parsedFilters.fuel;
    where.fuel =
      f === "hybrid"
        ? "HYBRID"
        : f === "petrol"
          ? "PETROL"
          : f === "diesel"
            ? "DIESEL"
            : f === "electric"
              ? "ELECTRIC"
              : f === "hydrogen"
                ? "HYDROGEN"
                : f === "lpg"
                  ? "LPG"
                  : f === "cng"
                    ? "CNG"
                    : f === "ethanol"
                      ? "ETHANOL"
                      : f === "other"
                        ? "OTHER"
                        : undefined;
  }
  if (parsedFilters.gearbox) {
    const gb = parsedFilters.gearbox;
    where.gearbox =
      gb === "manual" ? "MANUAL" : gb === "automatic" ? "AUTOMATIC" : gb === "semi-automatic" ? "SEMI_AUTOMATIC" : undefined;
  }
  if (parsedFilters.doors !== undefined) where.doors = parsedFilters.doors;
  if (parsedFilters.seats !== undefined) where.seats = parsedFilters.seats;
  if (parsedFilters.hasServiceBook !== undefined) where.hasServiceBook = parsedFilters.hasServiceBook;
  if (parsedFilters.isNonSmoker !== undefined) where.isNonSmoker = parsedFilters.isNonSmoker;
  if (parsedFilters.hasWarranty !== undefined) where.hasWarranty = parsedFilters.hasWarranty;
  if (parsedFilters.isDamaged !== undefined) where.isDamaged = parsedFilters.isDamaged;

  if (parsedFilters.minPowerKw !== undefined || parsedFilters.maxPowerKw !== undefined) {
    where.powerKw = {
      ...(parsedFilters.minPowerKw !== undefined ? { gte: parsedFilters.minPowerKw } : {}),
      ...(parsedFilters.maxPowerKw !== undefined ? { lte: parsedFilters.maxPowerKw } : {}),
    };
  }

  // Filtrer par options si nécessaire
  let items = await prisma.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (parsedFilters.options && parsedFilters.options.length > 0) {
    items = items.filter((l) => {
      const raw = l.sellerOptions;
      const opts = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
      return parsedFilters.options!.every((wanted) => opts.includes(wanted));
    });
  }

  const newCount = items.length;

  // Mettre à jour la recherche sauvegardée
  await prisma.savedSearch.update({
    where: { id: searchId },
    data: {
      lastCheckedAt: new Date(),
      newListingsCount: newCount,
    },
  });

  return NextResponse.json({
    newCount,
    listings: items.map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      year: l.year,
      km: l.km,
      city: l.city,
      createdAt: l.createdAt,
    })),
  });
}
