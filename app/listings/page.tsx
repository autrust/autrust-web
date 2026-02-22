import Link from "next/link";
import { Suspense } from "react";
import { ListingCardWithFavorite } from "@/app/_components/ListingCardWithFavorite";
import {
  BODY_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  COUNTRY_OPTIONS,
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
import { MakeModelSearchFields } from "@/app/_components/MakeModelSearchFields";
import { ModeFilter } from "@/app/_components/ModeFilter";
import { ActiveFiltersBar } from "@/app/_components/ActiveFiltersBar";
import { SortButton } from "@/app/_components/SortButton";
import { Pagination } from "@/app/_components/Pagination";
import { getTotalVehiclesCount } from "@/app/_components/TotalVehiclesCountNumber";
import { RegistrationFilter } from "./RegistrationFilter";
import {
  recordSearchTerms,
  getPopularMakes,
  getPopularModelsByMake,
} from "@/lib/searchTermCount";

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

  // Enregistrer la recherche (marque/modèle) pour proposer après 4+ fois
  if (filters.make?.trim() || filters.model?.trim()) {
    recordSearchTerms(filters.make ?? null, filters.model ?? null).catch(() => {});
  }

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
    ...(filters.model ? { model: { contains: filters.model } } : {}),
    ...(filters.country ? { country: filters.country } : {}),
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
    ...(filters.minKm !== undefined || filters.maxKm !== undefined
      ? { km: { ...(filters.minKm !== undefined ? { gte: filters.minKm } : {}), ...(filters.maxKm !== undefined ? { lte: filters.maxKm } : {}) } }
      : {}),
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
    const registrationDateFilter: Prisma.DateTimeFilter = { not: null } as unknown as Prisma.DateTimeFilter;
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

  // Termes souvent recherchés (4+ fois) pour les proposer dans "Autre"
  const [popularMakes, popularModelsByMake] = await Promise.all([
    getPopularMakes(),
    getPopularModelsByMake(),
  ]);

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
          className="mt-6"
        >
          {filters.categorySlug && (
            <input type="hidden" name="category" value={filters.categorySlug} />
          )}
          {filters.fuel === "electric" && (
            <input type="hidden" name="electric" value="1" />
          )}
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
          {/* Recherche : marque, modèle, prix max, année min, km max, transmission, pays */}
          <div className="rounded-2xl border-2 border-slate-200/80 bg-white p-4 shadow-lg shadow-sky-500/10 focus-within:border-sky-400 focus-within:shadow-xl focus-within:shadow-sky-500/15 transition-all duration-200">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:col-span-2">
                <MakeModelSearchFields
                  idPrefix="search"
                  defaultMake={filters.make ?? ""}
                  defaultModel={filters.model ?? ""}
                  category={filters.categorySlug ?? ""}
                  additionalMakes={popularMakes}
                  additionalModelsByMake={popularModelsByMake}
                />
              </div>
              <div>
                <details
                  open={!!(filters.minPrice ?? filters.maxPrice)}
                  className="group rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-sky-300/60 focus-within:border-sky-300"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-slate-600 hover:text-slate-900 [&::-webkit-details-marker]:hidden">
                    <span className="text-xs font-medium text-slate-500 group-open:text-slate-700">
                      Prix (€)
                      {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                        <span className="ml-1 font-medium text-slate-800">
                          {filters.minPrice ?? "…"} – {filters.maxPrice ?? "…"}
                        </span>
                      )}
                    </span>
                    <svg className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="border-t border-slate-100 px-4 pb-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="search-minPrice" className="mb-0.5 block text-xs font-medium text-slate-500">De</label>
                        <input
                          id="search-minPrice"
                          name="minPrice"
                          type="number"
                          min={0}
                          defaultValue={filters.minPrice?.toString() ?? ""}
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                        />
                      </div>
                      <div>
                        <label htmlFor="search-maxPrice" className="mb-0.5 block text-xs font-medium text-slate-500">Jusqu'à</label>
                        <input
                          id="search-maxPrice"
                          name="maxPrice"
                          type="number"
                          min={0}
                          defaultValue={filters.maxPrice?.toString() ?? ""}
                          placeholder="50000"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                        />
                      </div>
                    </div>
                  </div>
                </details>
              </div>
              <div>
                <details
                  open={!!(filters.minYear ?? filters.maxYear)}
                  className="group rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-sky-300/60 focus-within:border-sky-300"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-slate-600 hover:text-slate-900 [&::-webkit-details-marker]:hidden">
                    <span className="text-xs font-medium text-slate-500 group-open:text-slate-700">
                      Année
                      {(filters.minYear ?? filters.maxYear) && (
                        <span className="ml-1 font-medium text-slate-800">
                          {filters.minYear ?? "…"} – {filters.maxYear ?? "…"}
                        </span>
                      )}
                    </span>
                    <svg className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="border-t border-slate-100 px-4 pb-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="search-minYear" className="mb-0.5 block text-xs font-medium text-slate-500">De</label>
                        <input
                          id="search-minYear"
                          name="minYear"
                          type="number"
                          min={1900}
                          max={2100}
                          defaultValue={filters.minYear?.toString() ?? ""}
                          placeholder="2015"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                        />
                      </div>
                      <div>
                        <label htmlFor="search-maxYear" className="mb-0.5 block text-xs font-medium text-slate-500">Jusqu'à</label>
                        <input
                          id="search-maxYear"
                          name="maxYear"
                          type="number"
                          min={1900}
                          max={2100}
                          defaultValue={filters.maxYear?.toString() ?? ""}
                          placeholder="2024"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                        />
                      </div>
                    </div>
                  </div>
                </details>
              </div>
              <div>
                <details
                  open={!!(filters.minKm ?? filters.maxKm)}
                  className="group rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-sky-300/60 focus-within:border-sky-300"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-slate-600 hover:text-slate-900 [&::-webkit-details-marker]:hidden">
                    <span className="text-xs font-medium text-slate-500 group-open:text-slate-700">
                      Kilométrage
                      {(filters.minKm !== undefined || filters.maxKm !== undefined) && (
                        <span className="ml-1 font-medium text-slate-800">
                          {filters.minKm != null ? `${(filters.minKm / 1000).toFixed(0)}k` : "…"} – {filters.maxKm != null ? `${(filters.maxKm / 1000).toFixed(0)}k` : "…"} km
                        </span>
                      )}
                    </span>
                    <svg className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="border-t border-slate-100 px-4 pb-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="search-minKm" className="mb-0.5 block text-xs font-medium text-slate-500">De (km)</label>
                        <input
                          id="search-minKm"
                          name="minKm"
                          type="number"
                          min={0}
                          defaultValue={filters.minKm?.toString() ?? ""}
                          placeholder="0"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                        />
                      </div>
                      <div>
                        <label htmlFor="search-maxKm" className="mb-0.5 block text-xs font-medium text-slate-500">Jusqu'à (km)</label>
                        <input
                          id="search-maxKm"
                          name="maxKm"
                          type="number"
                          min={0}
                          defaultValue={filters.maxKm?.toString() ?? ""}
                          placeholder="150000"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                        />
                      </div>
                    </div>
                  </div>
                </details>
              </div>
              <div>
                <details
                  open={!!(filters.minPowerKw ?? filters.maxPowerKw)}
                  className="group rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-sky-300/60 focus-within:border-sky-300"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-slate-600 hover:text-slate-900 [&::-webkit-details-marker]:hidden">
                    <span className="text-xs font-medium text-slate-500 group-open:text-slate-700">
                      Puissance (kW)
                      {(filters.minPowerKw !== undefined || filters.maxPowerKw !== undefined) && (
                        <span className="ml-1 font-medium text-slate-800">
                          {filters.minPowerKw ?? "…"} – {filters.maxPowerKw ?? "…"}
                        </span>
                      )}
                    </span>
                    <svg className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="border-t border-slate-100 px-4 pb-3 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label htmlFor="search-minPowerKw" className="mb-0.5 block text-xs font-medium text-slate-500">De</label>
                        <input
                          id="search-minPowerKw"
                          name="minPowerKw"
                          type="number"
                          min={0}
                          defaultValue={filters.minPowerKw?.toString() ?? ""}
                          placeholder="50"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                        />
                      </div>
                      <div>
                        <label htmlFor="search-maxPowerKw" className="mb-0.5 block text-xs font-medium text-slate-500">Jusqu'à</label>
                        <input
                          id="search-maxPowerKw"
                          name="maxPowerKw"
                          type="number"
                          min={0}
                          defaultValue={filters.maxPowerKw?.toString() ?? ""}
                          placeholder="300"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                        />
                      </div>
                    </div>
                  </div>
                </details>
              </div>
              <div>
                <label htmlFor="search-gearbox" className="mb-1 block text-xs font-medium text-slate-500">Transmission</label>
                <select
                  id="search-gearbox"
                  name="gearbox"
                  defaultValue={filters.gearbox ?? ""}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                >
                  <option value="">Toutes</option>
                  <option value="manual">Manuelle</option>
                  <option value="automatic">Automatique</option>
                  <option value="semi-automatic">Semi-auto</option>
                </select>
              </div>
              <div>
                <label htmlFor="search-country" className="mb-1 block text-xs font-medium text-slate-500">Pays</label>
                <select
                  id="search-country"
                  name="country"
                  defaultValue={filters.country ?? ""}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                >
                  <option value="">Tous</option>
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-sky-300/60">
                  <input
                    type="checkbox"
                    name="electric"
                    value="1"
                    defaultChecked={filters.fuel === "electric"}
                    className="h-4 w-4 accent-amber-500"
                    aria-label="100% électrique uniquement"
                  />
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
                    </svg>
                    100% électrique
                  </span>
                </label>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-500 active:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
                >
                  Rechercher
                </button>
              </div>
            </div>
          </div>

          <details className="mt-4 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
            <summary className="cursor-pointer list-none font-medium text-slate-700 hover:text-slate-900 select-none flex items-center gap-2">
              <span className="text-sky-600">+</span> Filtres avancés
            </summary>
            <div className="mt-4 pt-4 border-t border-slate-200/70 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
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
            </div>
          </details>
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
