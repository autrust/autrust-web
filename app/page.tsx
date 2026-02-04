import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { SponsoredCarousel } from "@/app/_components/SponsoredCarousel";
import { ListingCardWithFavorite } from "@/app/_components/ListingCardWithFavorite";
import { RecentlyViewedList } from "@/app/_components/RecentlyViewedList";
import {
  BODY_TYPE_OPTIONS,
  CATEGORY_OPTIONS,
  demoListings,
  toListingCardModel,
} from "@/lib/listings";
import { CAR_BRANDS } from "@/lib/carBrands";
import { prisma } from "@/lib/db";
import { toListingCardModelFromDb } from "@/lib/listingsDb";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Voiture neuve et d'occasion — Achat et location | AuTrust",
  description:
    "Des milliers d'annonces de voitures neuves et d'occasion, motos et utilitaires. Achetez ou louez votre véhicule en toute confiance sur AuTrust.",
  openGraph: {
    title: "Voiture neuve et d'occasion — AuTrust",
    description: "Annonces de véhicules à l'achat et à la location.",
    url: "/",
  },
};

export default async function HomePage() {
  // Récupérer les annonces sponsorisées en premier (non expirées)
  const now = new Date();
  const sponsored = await prisma.listing
    .findMany({
      where: { 
        status: "ACTIVE", 
        isSponsored: true,
        sponsoredUntil: { gt: now },
        mode: "SALE" 
      } as any,
      include: {
        photos: {
          orderBy: { order: "asc" },
          take: 1, // Première photo seulement
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    })
    .catch(() => []);

  const latest = await prisma.listing
    .findMany({
      where: { 
        status: "ACTIVE", 
        mode: "SALE" 
      } as any,
      include: {
        photos: {
          orderBy: { order: "asc" },
          take: 1, // Première photo seulement
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    })
    .catch(() => []);

  const featured =
    latest.length > 0
      ? latest.map((l: any) => toListingCardModelFromDb(l))
      : demoListings.slice(0, 3).map(toListingCardModel);

  const sponsoredListings =
    sponsored.length > 0
      ? sponsored.map((l: any) => toListingCardModelFromDb(l))
      : [];


  // Récupérer les favoris de l'utilisateur connecté
  const user = await getCurrentUser();
  const userFavorites = user
    ? await prisma.favorite
        .findMany({
          where: { userId: user.id },
          select: { listingId: true },
        })
        .then((favs: Array<{ listingId: string }>) => new Set(favs.map((f) => f.listingId)))
    : new Set<string>();

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-7xl">
        {/* Layout avec annonces sponsorisées à droite */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Colonne centrale : Contenu principal */}
          <div className={`${sponsoredListings.length > 0 ? "lg:col-span-9" : "lg:col-span-12"}`}>
            <section className="grid gap-10 md:grid-cols-2 items-start">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">
                  Achetez et vendez votre véhicule en toute simplicité.
                </h1>
                <p className="mt-4 text-slate-700 max-w-prose">
                  Auto, moto et utilitaire. Filtrez rapidement, comparez, et contactez le vendeur.
                </p>

            <form action="/listings" method="GET" className="mt-8 grid gap-3 max-w-xl">
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  name="q"
                  placeholder="Ex: Golf, MT-07, utilitaire..."
                  className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300 sm:col-span-2"
                />
                <select
                  name="category"
                  defaultValue=""
                  className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
                >
                  <option value="">Toutes catégories</option>
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <select
                  name="bodyType"
                  defaultValue=""
                  className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
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
                  placeholder="Ville (ex: Bruxelles)"
                  className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm backdrop-blur focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300 sm:col-span-1"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-5 py-3 font-medium text-white hover:bg-sky-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 sm:col-span-1"
                >
                  Rechercher
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sell"
                className="rounded-xl border border-emerald-200/80 bg-white/75 px-4 py-2 text-sm font-medium text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/70 transition backdrop-blur"
              >
                Déposer une annonce
              </Link>
              <Link
                href="/listings"
                className="rounded-xl border border-sky-200/80 bg-white/75 px-4 py-2 text-sm font-medium text-sky-700 hover:border-sky-300 hover:bg-sky-50/70 transition backdrop-blur"
              >
                Voir toutes les annonces
              </Link>
              <Link
                href="/location"
                className="rounded-xl border border-emerald-200/80 bg-white/75 px-4 py-2 text-sm font-medium text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50/70 transition backdrop-blur"
              >
                Location
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
              <div className="text-sm font-medium text-slate-700">Catégories</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {CATEGORY_OPTIONS.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/listings?category=${encodeURIComponent(c.slug)}`}
                    className="rounded-2xl border border-slate-200/70 bg-white/75 p-4 hover:border-sky-300 hover:bg-sky-50/60 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={
                          c.slug === "auto"
                            ? "/icon-voiture-v2.png"
                            : c.slug === "moto"
                              ? "/icon-moto-v2.png"
                              : "/icon-utilitaire-v2.png"
                        }
                        alt=""
                        width={64}
                        height={64}
                        className="h-6 w-6 object-contain"
                      />
                      <div className="font-semibold">{c.label}</div>
                    </div>
                    <div className="mt-1 text-xs text-slate-600">Explorer les annonces</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
              <div className="text-sm font-medium text-slate-700">Confiance</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-white/75 p-4">
                  <div className="flex items-center justify-center">
                    <Image
                      src="/trust-annonce-icon-v4.png"
                      alt="Annonce sécurisée"
                      width={520}
                      height={520}
                      className="h-32 w-auto object-contain"
                    />
                  </div>
                </div>
                <Link
                  href="/garages"
                  className="rounded-2xl border border-slate-200/70 bg-white/75 p-4 hover:border-sky-300 transition"
                >
                  <div className="flex items-center justify-center">
                    <Image
                      src="/trust-garage-icon-v4.png"
                      alt="Garage partenaire"
                      width={520}
                      height={520}
                      className="h-32 w-auto object-contain"
                    />
                  </div>
                </Link>
              </div>
              <div className="mt-3 text-xs text-slate-500">
                Annonce validée & sécurisée —{" "}
                <Link href="/garages" className="text-sky-700 underline hover:text-sky-800">
                  Garage partenaire certifié
                </Link>
                .
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
              <div className="flex items-end justify-between gap-4">
                <div className="text-sm font-medium text-slate-700">Acheter par carrosserie</div>
                <Link
                  href="/listings"
                  className="text-xs text-sky-700 underline decoration-sky-300"
                >
                  Tout voir
                </Link>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {BODY_TYPE_OPTIONS.map((b) => (
                  <Link
                    key={b.slug}
                    href={`/listings?bodyType=${encodeURIComponent(b.slug)}`}
                    className="rounded-2xl border border-slate-200/70 bg-white/75 p-4 hover:border-emerald-300 hover:bg-emerald-50/60 transition"
                  >
                    <div className="font-semibold">{b.label}</div>
                    <div className="mt-1 text-xs text-slate-600">
                      Voir les {b.label.toLowerCase()}
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-6 text-xs text-slate-500">
                Astuce: combine “carrosserie” + “ville” pour aller vite.
              </div>
            </div>
          </div>
            </section>
          </div>

          {/* Colonne droite : Carousel des annonces sponsorisées */}
          {sponsoredListings.length > 0 && (
            <aside className="lg:col-span-3">
              <SponsoredCarousel 
                listings={sponsoredListings} 
                userFavorites={userFavorites}
              />
            </aside>
          )}
        </div>

        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Marques populaires</h2>
              <p className="mt-1 text-sm text-slate-600">
                Cliquez sur une marque pour voir tous les véhicules disponibles
              </p>
            </div>
            <Link href="/listings" className="text-sm text-sky-700 underline decoration-sky-300">
              Tout voir
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {CAR_BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/listings?make=${encodeURIComponent(brand.name)}`}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white/75 p-4 hover:border-sky-300 hover:bg-sky-50/60 transition text-center min-h-[80px]"
              >
                <div className="text-sm font-semibold text-slate-900 leading-tight">{brand.name}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* Section principale avec le reste du contenu */}
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold">Annonces à la une</h2>
            <Link href="/listings" className="text-sm text-sky-700 underline decoration-sky-300">
              Tout voir
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {featured.map((l) => (
              <ListingCardWithFavorite
                key={l.id}
                listing={l}
                initialFavorited={userFavorites.has(l.id)}
              />
            ))}
          </div>
        </section>

        <Suspense fallback={null}>
          <RecentlyViewedList />
        </Suspense>
      </div>
    </main>
  );
}
