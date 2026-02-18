import Link from "next/link";
import { Suspense } from "react";
import { ListingCardWithFavorite } from "@/app/_components/ListingCardWithFavorite";
import {
  BODY_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  parseListingFilters,
  type SearchParams,
} from "@/lib/listings";
import { prisma } from "@/lib/db";
import { dbBodyTypeFromSlug, dbCategoryFromSlug, toListingCardModelFromDb } from "@/lib/listingsDb";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { SaveSearchButton } from "./SaveSearchButton";
import { OptionsSection } from "./OptionsSection";
import { getBrandNameFromSlug } from "@/lib/carBrands";
import { ModeFilter } from "@/app/_components/ModeFilter";
import { ActiveFiltersBar } from "@/app/_components/ActiveFiltersBar";
import { SortButton } from "@/app/_components/SortButton";
import { Pagination } from "@/app/_components/Pagination";
import { getTotalVehiclesCount } from "@/app/_components/TotalVehiclesCountNumber";
import { RegistrationFilter } from "./RegistrationFilter";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Annonces voitures neuves et d'occasion — Achat & location",
  description:
    "Parcourez les annonces de voitures neuves et d'occasion, motos et utilitaires. Filtrez par marque, prix, kilométrage. Achat et location sur AuTrust.",
  openGraph: {
    title: "Annonces voitures — AuTrust",
    description: "Voitures neuves et d'occasion à l'achat et à la location.",
    url: "/listings",
  },
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseListingFilters(sp);

  const now = new Date();
  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    // Si mode n'est pas spécifié, par défaut SALE pour compatibilité
    // Si mode est "ALL", on filtre sur les deux modes (SALE ou RENT)
    // Si mode est spécifié (SALE ou RENT), on filtre sur ce mode
    ...(filters.mode === "ALL" 
      ? { mode: { in: ["SALE", "RENT"] } }
      : filters.mode === "SALE" || filters.mode === "RENT"
        ? { mode: filters.mode }
        : { mode: "SALE" } // Par défaut SALE si non spécifié
    ),
    ...(filters.sellerId ? { sellerId: filters.sellerId } : {}),
    ...(filters.sponsored ? { 
      isSponsored: true,
      sponsoredUntil: { gt: now },
    } : {}),
    ...(filters.make ? { make: { contains: filters.make } } : {}),
    ...(filters.city ? { city: { contains: filters.city } } : {}),
    ...(filters.q
      ? { OR: [{ title: { contains: filters.q } }, { description: { contains: filters.q } }] }
      : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? { price: { ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}), ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}) } }
      : {}),
    ...(filters.minYear !== undefined || filters.maxYear !== undefined
      ? { year: { ...(filters.minYear !== undefined ? { gte: filters.minYear } : {}), ...(filters.maxYear !== undefined ? { lte: filters.maxYear } : {}) } }
      : {}),
    ...(filters.maxKm !== undefined ? { km: { lte: filters.maxKm } } : {}),
  };

  if (filters.categorySlug) {
    where.category = dbCategoryFromSlug(filters.categorySlug);
  }
  if (filters.bodyTypeSlug) {
    where.bodyType = dbBodyTypeFromSlug(filters.bodyTypeSlug);
  }
  if (filters.fuel) {
    const f = filters.fuel;
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
  if (filters.gearbox) {
    const gb = filters.gearbox;
    where.gearbox =
      gb === "manual" ? "MANUAL" : gb === "automatic" ? "AUTOMATIC" : gb === "semi-automatic" ? "SEMI_AUTOMATIC" : undefined;
  }
  if (filters.doors !== undefined) where.doors = filters.doors;
  if (filters.seats !== undefined) where.seats = filters.seats;
  if (filters.hasServiceBook !== undefined) where.hasServiceBook = filters.hasServiceBook;
  if (filters.isNonSmoker !== undefined) where.isNonSmoker = filters.isNonSmoker;
  if (filters.hasWarranty !== undefined) where.hasWarranty = filters.hasWarranty;
  if (filters.isDamaged !== undefined) where.isDamaged = filters.isDamaged;

  if (filters.minPowerKw !== undefined || filters.maxPowerKw !== undefined) {
    where.powerKw = {
      ...(filters.minPowerKw !== undefined ? { gte: filters.minPowerKw } : {}),
      ...(filters.maxPowerKw !== undefined ? { lte: filters.maxPowerKw } : {}),
    };
  }
  if (filters.registered === "yes") {
    const registrationDateFilter: Prisma.DateTimeFilter = { not: null };
    // Filtrer par année de mise en circulation si spécifiée
    if (filters.minRegistrationYear !== undefined) {
      registrationDateFilter.gte = new Date(`${filters.minRegistrationYear}-01-01`);
    }
    if (filters.maxRegistrationYear !== undefined) {
      registrationDateFilter.lte = new Date(`${filters.maxRegistrationYear}-12-31T23:59:59`);
    }
    where.firstRegistrationDate = registrationDateFilter;
  }
  if (filters.registered === "no") {
    where.firstRegistrationDate = null;
  }

  const sort = filters.sort ?? "";
  const orderBy: Prisma.ListingOrderByWithRelationInput[] =
    sort === "price_asc"
      ? [{ price: "asc" }]
      : sort === "price_desc"
        ? [{ price: "desc" }]
        : sort === "km_asc"
          ? [{ km: "asc" }]
          : sort === "km_desc"
            ? [{ km: "desc" }]
            : sort === "year_asc"
              ? [{ year: "asc" }]
              : sort === "year_desc"
                ? [{ year: "desc" }]
                : sort === "date_asc"
                  ? [{ createdAt: "asc" }]
                  : sort === "date_desc"
                    ? [{ createdAt: "desc" }]
                    : sort === "power_asc"
                      ? [{ powerKw: "asc" }]
                      : sort === "power_desc"
                        ? [{ powerKw: "desc" }]
                        : [
                            { isSponsored: "desc" },
                            { sponsoredUntil: "desc" },
                            { createdAt: "desc" },
                          ];

  const items = await prisma.listing.findMany({
    where,
    include: {
      seller: {
        select: {
          id: true,
          email: true,
        },
      },
      photos: {
        orderBy: { order: "asc" },
        take: 1, // On prend seulement la première photo pour les cartes
      },
    },
    orderBy,
  });

  const selectedOptions = filters.options ?? [];
  let optionFilteredItems =
    selectedOptions.length === 0
      ? items
      : items.filter((l) => {
          const raw = l.sellerOptions;
          const opts = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
          return selectedOptions.every((wanted) => opts.includes(wanted));
        });

  // Filtrer par marque (recherche insensible à la casse côté application pour SQLite)
  if (filters.make) {
    const makeLower = filters.make.toLowerCase();
    optionFilteredItems = optionFilteredItems.filter((l) => {
      if (!l.make) return false;
      return l.make.toLowerCase().includes(makeLower);
    });
  }

  const allResults = optionFilteredItems.map(toListingCardModelFromDb);
  const perPage = filters.perPage ?? 12;
  const page = filters.page ?? 1;
  const total = allResults.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const results = allResults.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Récupérer les favoris de l'utilisateur connecté
  const user = await getCurrentUser();
  const userFavorites = user
    ? await prisma.favorite
        .findMany({
          where: { userId: user.id },
          select: { listingId: true },
        })
        .then((favs) => new Set(favs.map((f) => f.listingId)))
    : new Set<string>();

  // Récupérer les infos du vendeur si on filtre par sellerId
  const seller = filters.sellerId
    ? await prisma.user.findUnique({
        where: { id: filters.sellerId },
        select: { id: true, email: true },
      })
    : null;

  // Récupérer le nombre total de véhicules sur la plateforme
  const totalVehiclesOnPlatform = await getTotalVehiclesCount();

  // Titre dynamique selon les filtres
  let pageTitle = "Annonces";
  if (seller) {
    pageTitle = `Annonces de ${seller.email.split("@")[0]}`;
  } else if (filters.make) {
    pageTitle = `Véhicules ${filters.make}`;
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{pageTitle}</h1>
            <p className="mt-1 text-slate-600">
              <span className="font-medium text-slate-900">{total.toLocaleString("fr-BE")}</span>{" "}
              résultat{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
              {totalVehiclesOnPlatform > 0 && total !== totalVehiclesOnPlatform && (
                <>
                  {" "}sur{" "}
                  <span className="font-medium text-slate-700">
                    {totalVehiclesOnPlatform.toLocaleString("fr-BE")} véhicule{totalVehiclesOnPlatform > 1 ? "s" : ""} disponible{totalVehiclesOnPlatform > 1 ? "s" : ""}
                  </span>
                </>
              )}
              {totalPages > 1 ? ` • page ${currentPage}/${totalPages}` : ""}
              {seller && " (Vente & Location)"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Suspense fallback={<div className="h-8 w-32 rounded-lg border border-slate-200 bg-white animate-pulse" />}>
              <ModeFilter />
            </Suspense>
            {user && <SaveSearchButton />}
          </div>
        </div>

        <Suspense fallback={null}>
          <ActiveFiltersBar />
        </Suspense>

        <form
          action="/listings"
          method="GET"
          className="mt-6 rounded-3xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur"
        >
          {filters.mode && (
            <input type="hidden" name="mode" value={filters.mode} />
          )}
          {filters.sort && (
            <input type="hidden" name="sort" value={filters.sort} />
          )}
          {filters.page && filters.page > 1 && (
            <input type="hidden" name="page" value={String(filters.page)} />
          )}
          {filters.radiusKm && (
            <input type="hidden" name="radiusKm" value={String(filters.radiusKm)} />
          )}
          {filters.registered && (
            <input type="hidden" name="registered" value={filters.registered} />
          )}
          {filters.minRegistrationYear && (
            <input type="hidden" name="minRegistrationYear" value={String(filters.minRegistrationYear)} />
          )}
          {filters.maxRegistrationYear && (
            <input type="hidden" name="maxRegistrationYear" value={String(filters.maxRegistrationYear)} />
          )}
          <div className="grid gap-3 md:grid-cols-5">
            <input
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Mot-clé (marque, modèle...)"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />

            <select
              name="category"
              defaultValue={
                filters.categorySlug ?? ""
              }
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            >
              <option value="">Toutes catégories</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              name="bodyType"
              defaultValue={filters.bodyTypeSlug ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            >
              <option value="">Tous types</option>
              {BODY_TYPE_OPTIONS.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.label}
                </option>
              ))}
            </select>

            <input
              name="city"
              defaultValue={filters.city ?? ""}
              placeholder="Ville"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />

            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-5 py-3 font-medium text-white hover:bg-sky-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
            >
              Filtrer
            </button>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-6">
            <input
              name="minPrice"
              defaultValue={filters.minPrice?.toString() ?? ""}
              inputMode="numeric"
              placeholder="Prix min"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
            <input
              name="maxPrice"
              defaultValue={filters.maxPrice?.toString() ?? ""}
              inputMode="numeric"
              placeholder="Prix max"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
            <input
              name="minYear"
              defaultValue={filters.minYear?.toString() ?? ""}
              inputMode="numeric"
              placeholder="Année min"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
            <input
              name="maxYear"
              defaultValue={filters.maxYear?.toString() ?? ""}
              inputMode="numeric"
              placeholder="Année max"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
            <input
              name="maxKm"
              defaultValue={filters.maxKm?.toString() ?? ""}
              inputMode="numeric"
              placeholder="Kilométrage max"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
            <select
              name="radiusKm"
              defaultValue={filters.radiusKm?.toString() ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            >
              <option value="">Rayon (km)</option>
              <option value="10">10 km</option>
              <option value="25">25 km</option>
              <option value="50">50 km</option>
              <option value="100">100 km</option>
            </select>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-5">
            <select
              name="fuel"
              defaultValue={filters.fuel ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            >
              <option value="">Carburant (tout)</option>
              <option value="hybrid">Hybride</option>
              <option value="petrol">Essence</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Électrique</option>
              <option value="hydrogen">Hydrogène</option>
              <option value="lpg">GPL</option>
              <option value="cng">CNG</option>
              <option value="ethanol">Ethanol</option>
              <option value="other">Autres</option>
            </select>

            <select
              name="gearbox"
              defaultValue={filters.gearbox ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            >
              <option value="">Boîte (toutes)</option>
              <option value="manual">Manuelle</option>
              <option value="automatic">Automatique</option>
              <option value="semi-automatic">Semi-auto</option>
            </select>

            <input
              name="minPowerKw"
              defaultValue={filters.minPowerKw?.toString() ?? ""}
              inputMode="numeric"
              placeholder="kW min"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
            <input
              name="maxPowerKw"
              defaultValue={filters.maxPowerKw?.toString() ?? ""}
              inputMode="numeric"
              placeholder="kW max"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
            <input
              name="doors"
              defaultValue={filters.doors?.toString() ?? ""}
              inputMode="numeric"
              placeholder="Portes"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-4">
            <input
              name="seats"
              defaultValue={filters.seats?.toString() ?? ""}
              inputMode="numeric"
              placeholder="Sièges"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input
                type="checkbox"
                name="hasServiceBook"
                defaultChecked={filters.hasServiceBook ?? false}
                className="h-4 w-4 accent-emerald-600"
              />
              Carnet d’entretien
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input
                type="checkbox"
                name="isNonSmoker"
                defaultChecked={filters.isNonSmoker ?? false}
                className="h-4 w-4 accent-emerald-600"
              />
              Non-fumeur
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-800">
              <input
                type="checkbox"
                name="isDamaged"
                defaultChecked={filters.isDamaged ?? false}
                className="h-4 w-4 accent-emerald-600"
              />
              Accidentée
            </label>
          </div>

          <div className="mt-3">
            <RegistrationFilter />
          </div>

          <OptionsSection selectedCount={filters.options?.length ?? 0} filters={filters} />

          <div className="mt-3">
            <Link href="/listings" className="text-sm text-sky-700 underline decoration-sky-300">
              Réinitialiser
            </Link>
          </div>
        </form>

        <div className="mt-6 flex justify-end">
          <Suspense fallback={<div className="h-12 w-[200px] rounded-xl border border-slate-200 bg-white animate-pulse" />}>
            <SortButton />
          </Suspense>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {results.map((l) => (
            <ListingCardWithFavorite
              key={l.id}
              listing={l}
              initialFavorited={userFavorites.has(l.id)}
            />
          ))}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} />

        {results.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-slate-200/70 bg-white/75 p-6 text-slate-700 shadow-sm backdrop-blur">
            Aucun résultat. Essaie de retirer des filtres ou de changer de mot-clé.
          </div>
        ) : null}
      </div>
    </main>
  );
}
