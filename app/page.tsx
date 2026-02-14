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
import { TotalVehiclesCount } from "@/app/_components/TotalVehiclesCount";

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
                <div
                  className="rounded-2xl border-2 border-slate-200 bg-white/80 px-6 py-5 shadow-sm"
                  style={{
                    boxShadow:
                      "0 0 100px 30px rgba(59,130,246,0.15), 0 1px 3px 0 rgb(0 0 0 / 0.05)",
                  }}
                >
                  <h1
                    className="text-4xl font-bold tracking-tight text-slate-900"
                    style={{
                      textShadow: "0 0 60px rgba(59,130,246,0.35), 0 0 30px rgba(59,130,246,0.2)",
                    }}
                  >
                    Achetez et vendez en toute confiance.
                  </h1>
                  <p className="mt-3 text-slate-700 text-lg">
                    La nouvelle norme du marché automobile.
                  </p>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  <Suspense fallback={<span>Chargement...</span>}>
                    Plus de <TotalVehiclesCount /> disponibles sur la plateforme
                  </Suspense>
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
              <Link
                href="/garages"
                title="Voir tous les garages partenaires vérifiés"
                className="mt-4 flex items-center justify-center overflow-hidden rounded-xl"
              >
                <Image
                  src="/badge-garage-partenaire-autrust-v3.png"
                  alt="Garage Partenaire Autrust — Professionnel certifié"
                  width={400}
                  height={400}
                  className="h-40 w-auto max-w-full object-contain"
                />
              </Link>
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

        <div className="mt-14 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Vérification CarVertical
          </h3>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            CarVertical est une plateforme qui te permet de vérifier l’historique d’un véhicule à partir de son VIN (numéro d’identification) afin d’éviter les mauvaises affaires. Elle collecte des données de plus de 900 sources (bases gouvernementales, assurances, contrôles techniques, etc.) pour donner un rapport complet sur la vie passée d’une voiture ou moto comme : dommages subis, kilométrage réel, vols déclarés, historique d’immatriculation — tout ça avant d’acheter ou de vendre un véhicule.
          </p>
          <div className="mt-3 flex flex-wrap gap-4">
            <a
              href="https://www.carvertical.com/be/fr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-sky-600 hover:text-sky-700 underline"
            >
              En savoir plus sur CarVertical (version FR) →
            </a>
            <a
              href="https://youtu.be/LBaaF2YA1bY"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-sky-600 hover:text-sky-700 underline"
            >
              Vidéo explicative →
            </a>
          </div>
        </div>

        {/* Comment ça marche */}
        <section className="mt-16 pb-10" id="comment-ca-marche">
          <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md p-8 sm:p-12 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Transparence • Sécurité • Confiance
            </div>
            <h2 className="mt-5 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Comment fonctionne AuTrust ?
            </h2>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-600">
              Achetez et vendez en toute confiance, en{" "}
              <span className="font-medium text-slate-900">4 étapes simples</span>.
              AuTrust protège les acheteurs et réduit les fraudes grâce à la
              vérification des vendeurs, l'acompte sécurisé et la transparence des
              informations.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                Vendeurs vérifiés
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                Acompte sécurisé
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                VIN & transparence
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
                Garages partenaires
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">Pour les vendeurs</h3>
                  <p className="mt-1 text-slate-600">Publiez plus vite, avec plus de confiance.</p>
                </div>
                <span className="shrink-0 rounded-full bg-sky-600/10 text-sky-700 border border-sky-200 px-3 py-1 text-sm font-medium">
                  Vendeur
                </span>
              </div>
              <div className="mt-6 space-y-4">
                <HomeStep n="1" title="Créez votre compte" text="Inscription obligatoire pour publier. AuTrust vérifie chaque vendeur pour garantir un environnement fiable." />
                <HomeStep n="2" title="Publiez votre véhicule" text="Ajoutez infos, photos et VIN. Vous pouvez activer l'option historique véhicule si disponible." />
                <HomeStep n="3" title="Recevez des acheteurs qualifiés" text="Les acheteurs peuvent réserver via acompte sécurisé pour limiter les demandes non sérieuses." />
                <HomeStep n="4" title="Finalisez en toute sécurité" text="L'acompte est protégé jusqu'à validation de la transaction. Support AuTrust en cas de souci." />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">Pour les acheteurs</h3>
                  <p className="mt-1 text-slate-600">Achetez sereinement, avec des preuves.</p>
                </div>
                <span className="shrink-0 rounded-full bg-sky-600/10 text-sky-700 border border-sky-200 px-3 py-1 text-sm font-medium">
                  Acheteur
                </span>
              </div>
              <div className="mt-6 space-y-4">
                <HomeStep n="1" title="Trouvez un véhicule" text="Filtrez, comparez, et repérez les badges de confiance sur les annonces." />
                <HomeStep n="2" title="Vérifiez l'historique" text="Consultez le rapport véhicule lorsqu'il est proposé (VIN, événements, cohérence des infos)." />
                <HomeStep n="3" title="Réservez via acompte sécurisé" text="Bloquez le véhicule en versant un acompte protégé. Plus de sécurité, moins d'arnaques." />
                <HomeStep n="4" title="Finalisez sans stress" text="Rendez-vous, contrôle, paiement final. AuTrust peut assister en cas de litige." />
              </div>
              <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-sm text-slate-700">
                <p className="font-medium text-slate-900">Astuce AuTrust</p>
                <p className="mt-1">
                  Privilégiez les annonces <span className="font-medium">Vendeur vérifié</span> et{" "}
                  <span className="font-medium">Garage partenaire</span> pour une expérience encore plus fiable.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Prêt à passer à la nouvelle norme du marché automobile ?
              </h3>
              <p className="mt-1 text-slate-600">
                Rejoignez AuTrust et profitez d'une marketplace plus sûre.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-900 hover:bg-slate-50 transition"
              >
                Créer un compte
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-white font-medium hover:bg-slate-800 transition"
              >
                Je suis le vendeur
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function HomeStep({
  n,
  title,
  text,
}: {
  n: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm font-semibold">
        {n}
      </span>
      <div>
        <h4 className="font-medium text-slate-900">{title}</h4>
        <p className="mt-0.5 text-sm text-slate-600">{text}</p>
      </div>
    </div>
  );
}
