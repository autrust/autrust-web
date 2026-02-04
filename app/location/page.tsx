import Link from "next/link";
import { ListingCardWithFavorite } from "@/app/_components/ListingCardWithFavorite";
import { BODY_TYPE_OPTIONS, parseListingFilters, type SearchParams } from "@/lib/listings";
import { prisma } from "@/lib/db";
import { dbBodyTypeFromSlug, dbCategoryFromSlug, toListingCardModelFromDb } from "@/lib/listingsDb";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { OptionsSection } from "@/app/listings/OptionsSection";

export const dynamic = "force-dynamic";

export default async function LocationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = parseListingFilters(sp);

  const now = new Date();
  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    mode: "RENT",
    category: { in: ["VOITURE", "UTILITAIRE"] },
    ...(filters.city ? { city: { contains: filters.city } } : {}),
    ...(filters.q
      ? { OR: [{ title: { contains: filters.q } }, { description: { contains: filters.q } }] }
      : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          price: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
    ...(filters.minYear !== undefined || filters.maxYear !== undefined
      ? {
          year: {
            ...(filters.minYear !== undefined ? { gte: filters.minYear } : {}),
            ...(filters.maxYear !== undefined ? { lte: filters.maxYear } : {}),
          },
        }
      : {}),
    ...(filters.maxKm !== undefined ? { km: { lte: filters.maxKm } } : {}),
  };

  if (filters.categorySlug && filters.categorySlug !== "moto") {
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
      gb === "manual"
        ? "MANUAL"
        : gb === "automatic"
          ? "AUTOMATIC"
          : gb === "semi-automatic"
            ? "SEMI_AUTOMATIC"
            : undefined;
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

  const items = await prisma.listing
    .findMany({
      where,
      include: {
        photos: {
          orderBy: { order: "asc" },
          take: 1, // Première photo seulement
        },
      },
      orderBy: [
        { isSponsored: "desc" }, // Annonces sponsorisées en premier
        { sponsoredUntil: "desc" }, // Plus récentes en premier parmi les sponsorisées
        { createdAt: "desc" },
      ],
    })
    .catch(() => null);

  if (!items) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Location</h1>
          <div className="mt-4 rounded-3xl border border-amber-200/70 bg-amber-50/70 p-6 text-slate-800 shadow-sm backdrop-blur">
            <div className="text-sm font-semibold">La page “Location” est prête… mais la base n’est pas à jour.</div>
            <div className="mt-2 text-sm text-slate-700">
              Si tu viens de mettre à jour le projet, lance ces commandes dans le terminal du projet :
            </div>
            <pre className="mt-3 overflow-auto rounded-2xl border border-slate-200 bg-white/80 p-4 text-xs text-slate-800">
              {`npx prisma migrate dev\nnpx prisma generate\nnpx prisma db seed\nnpm run dev`}
            </pre>
            <div className="mt-3 text-sm text-slate-700">
              Ensuite, rafraîchis <span className="font-medium">/location</span>.
            </div>
          </div>
          <div className="mt-6">
            <Link href="/" className="text-sm text-sky-700 underline decoration-sky-300">
              ← Retour à l’accueil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const selectedOptions = filters.options ?? [];
  const optionFilteredItems =
    selectedOptions.length === 0
      ? items
      : items.filter((l) => {
          const raw = l.sellerOptions;
          const opts = Array.isArray(raw)
            ? raw.filter((x): x is string => typeof x === "string")
            : [];
          return selectedOptions.every((wanted) => opts.includes(wanted));
        });

  const results = optionFilteredItems.map(toListingCardModelFromDb);

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

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Location</h1>
            <p className="mt-1 text-slate-600">
              {results.length} résultat{results.length > 1 ? "s" : ""} (Auto & Utilitaire)
            </p>
          </div>
          <Link href="/listings" className="text-sm text-sky-700 underline decoration-sky-300">
            Voir toutes les annonces (vente + location)
          </Link>
        </div>

        <form
          action="/location"
          method="GET"
          className="mt-6 rounded-3xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur"
        >
          <div className="grid gap-3 md:grid-cols-5">
            <input
              name="q"
              defaultValue={filters.q ?? ""}
              placeholder="Mot-clé (marque, modèle...)"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />

            <select
              name="category"
              defaultValue={filters.categorySlug && filters.categorySlug !== "moto" ? filters.categorySlug : ""}
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            >
              <option value="">Auto + Utilitaire</option>
              <option value="auto">Auto</option>
              <option value="utilitaire">Utilitaire</option>
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

          <div className="mt-3 grid gap-3 md:grid-cols-5">
            <input
              name="minPrice"
              defaultValue={filters.minPrice?.toString() ?? ""}
              inputMode="numeric"
              placeholder="Prix / jour min"
              className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
            <input
              name="maxPrice"
              defaultValue={filters.maxPrice?.toString() ?? ""}
              inputMode="numeric"
              placeholder="Prix / jour max"
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
          </div>

          <OptionsSection 
            selectedCount={filters.options?.length ?? 0} 
            filters={filters}
            description="Coche les options voulues pour filtrer les locations."
          />

          <div className="mt-3">
            <Link href="/location" className="text-sm text-sky-700 underline decoration-sky-300">
              Réinitialiser
            </Link>
          </div>
        </form>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {results.map((l) => (
            <ListingCardWithFavorite
              key={l.id}
              listing={l}
              initialFavorited={userFavorites.has(l.id)}
            />
          ))}
        </div>

        {results.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-slate-200/70 bg-white/75 p-6 text-slate-700 shadow-sm backdrop-blur">
            Aucun résultat. Essaie de retirer des filtres ou de changer de mot-clé.
          </div>
        ) : null}
      </div>
    </main>
  );
}

