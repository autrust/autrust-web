import Link from "next/link";
import Image from "next/image";
import { formatPriceEUR } from "@/lib/listings";
import { prisma } from "@/lib/db";
import { labelFromDbCategory } from "@/lib/listingsDb";
import { getCurrentUser } from "@/lib/auth";
import { DepositClient } from "@/app/listings/[id]/DepositClient";
import { UserRatings } from "@/app/_components/UserRatings";
import { CreateRating } from "@/app/_components/CreateRating";
import { ShareButton } from "@/app/_components/ShareButton";
import { RecentlyViewedTracker } from "@/app/_components/RecentlyViewedTracker";
import { FinancingCalculator } from "@/app/_components/FinancingCalculator";
import { SimilarListings } from "@/app/_components/SimilarListings";
import { ContactSellerForm } from "@/app/_components/ContactSellerForm";
import { toListingCardModelFromDb } from "@/lib/listingsDb";
import { getSiteUrl } from "@/lib/siteUrl";
import { JsonLd } from "@/app/_components/JsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id: String(id) },
    select: { title: true, price: true, year: true, city: true, mode: true },
  });
  if (!listing) {
    return { title: "Annonce introuvable" };
  }
  const price = new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(listing.price);
  const title = `${listing.title} - ${price} | Autrust`;
  const description = `${listing.title}, ${listing.year}, ${listing.city}. ${listing.mode === "RENT" ? "Location" : "Vente"} véhicule.`;
  const { getSiteUrl } = await import("@/lib/siteUrl");
  const canonical = `${getSiteUrl()}/listings/${id}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

function labelBodyType(t: string) {
  if (t === "CITADINE") return "Citadine";
  if (t === "SUV") return "SUV";
  if (t === "PICKUP") return "Pick-up";
  if (t === "CABRIOLET") return "Cabriolet";
  if (t === "MONOSPACE") return "Monospace";
  if (t === "BERLINE") return "Berline";
  if (t === "BREAK") return "Break";
  if (t === "COUPE") return "Coupé";
  return t;
}

// ✅ Next 15 : params est une Promise → il faut await
export default async function ListingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // <-- LE POINT IMPORTANT
  const listing = await prisma.listing.findUnique({
    where: { id: String(id) },
    include: {
      photos: { orderBy: { order: "asc" } },
      reports: { orderBy: { createdAt: "desc" } },
      seller: { include: { kyc: true, stripe: true } },
    },
  });

  if (!listing) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Annonce introuvable</h1>
          <p className="mt-2 text-slate-600">id reçu : {String(id)}</p>
          <Link href="/listings" className="inline-block mt-6 text-sky-700 underline">
            Retour aux annonces
          </Link>
        </div>
      </main>
    );
  }

  const currentUser = await getCurrentUser();
  const buyer =
    currentUser
      ? await prisma.user.findUnique({ where: { id: currentUser.id }, include: { kyc: true } })
      : null;
  const buyerOk =
    !!buyer && Boolean(buyer.emailVerifiedAt) && Boolean(buyer.phoneVerifiedAt) && buyer.kyc?.status === "VERIFIED";

  const seller = listing.seller;
  const sellerOk =
    !!seller && Boolean(seller.emailVerifiedAt) && Boolean(seller.phoneVerifiedAt) && seller.kyc?.status === "VERIFIED";
  const sellerDepositReady = sellerOk && Boolean(seller?.stripe?.connectPayoutsEnabled);

  const userFavorites = currentUser
    ? await prisma.favorite
        .findMany({
          where: { userId: currentUser.id },
          select: { listingId: true },
        })
        .then((favs) => new Set(favs.map((f) => f.listingId)))
    : new Set<string>();

  const priceMin = Math.floor(listing.price * 0.8);
  const priceMax = Math.ceil(listing.price * 1.2);
  const similarRaw = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      status: "ACTIVE",
      category: listing.category,
      mode: listing.mode,
      price: { gte: priceMin, lte: priceMax },
    },
    include: {
      photos: { orderBy: { order: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
  });
  const similarListings = similarRaw.map(toListingCardModelFromDb);

  // Prix moyen pour véhicules comparables (même marque+modèle si dispo, sinon même catégorie + année proche)
  const comparableWhere =
    listing.make && listing.model
      ? {
          status: "ACTIVE" as const,
          mode: listing.mode,
          make: { equals: listing.make },
          model: { contains: listing.model },
          id: { not: listing.id },
        }
      : {
          status: "ACTIVE" as const,
          mode: listing.mode,
          category: listing.category,
          year: { gte: listing.year - 2, lte: listing.year + 2 },
          id: { not: listing.id },
        };
  const comparable = await prisma.listing.findMany({
    where: comparableWhere,
    select: { price: true },
  });
  const avgPrice =
    comparable.length >= 3
      ? Math.round(
          comparable.reduce((s, l) => s + l.price, 0) / comparable.length
        )
      : null;
  const isGoodDeal =
    avgPrice !== null && listing.price < avgPrice * 0.92;

  const baseUrl = getSiteUrl();
  const listingUrl = `${baseUrl}/listings/${listing.id}`;
  const imageUrl = listing.photos[0]?.url
    ? (listing.photos[0].url.startsWith("http") ? listing.photos[0].url : `${baseUrl}${listing.photos[0].url}`)
    : undefined;
  const jsonLdVehicle: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: listing.title,
    description: listing.description?.slice(0, 500) ?? listing.title,
    url: listingUrl,
    vehicleModelDate: listing.year,
    vehicleCondition: "https://schema.org/UsedCondition",
    offers: {
      "@context": "https://schema.org",
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: listingUrl,
    },
  };
  
  if (imageUrl) {
    jsonLdVehicle.image = imageUrl;
  }
  
  if (listing.make) {
    jsonLdVehicle.brand = {
      "@context": "https://schema.org",
      "@type": "Brand",
      name: listing.make,
    };
  }
  
  if (listing.km) {
    jsonLdVehicle.mileageFromOdometer = {
      "@context": "https://schema.org",
      "@type": "QuantitativeValue",
      value: listing.km,
      unitCode: "KMT",
    };
  }

  return (
    <main className="px-6 py-10">
      <JsonLd data={jsonLdVehicle} />
      <RecentlyViewedTracker listingId={listing.id} />
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href="/listings" className="text-sm underline decoration-sky-300 text-sky-700">
            ← Retour aux annonces
          </Link>
          <ShareButton url={`/listings/${listing.id}`} title={listing.title} />
        </div>

        <div className="mt-6 text-sm text-slate-600">
          {labelFromDbCategory(listing.category)} • {listing.city}
        </div>

        <h1 className="mt-2 text-3xl font-bold">{listing.title}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-xl font-semibold">
            {formatPriceEUR(listing.price)}
            {listing.mode === "RENT" ? " / jour" : ""}
          </span>
          {isGoodDeal && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
              ✓ Bonne affaire
            </span>
          )}
        </div>

        {avgPrice !== null && listing.mode === "SALE" && (
          <div className="mt-2 text-sm text-slate-600">
            Prix moyen pour ce type de véhicule : {formatPriceEUR(avgPrice)}
            {listing.price < avgPrice ? (
              <span className="ml-2 text-emerald-700">
                (soit {Math.round((1 - listing.price / avgPrice) * 100)} % sous la moyenne)
              </span>
            ) : null}
          </div>
        )}

        <div className="mt-2 text-slate-700">
          {listing.year} • {listing.km.toLocaleString("fr-BE")} km
        </div>

        {listing.mode === "SALE" && (
          <FinancingCalculator price={listing.price} />
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          {sellerOk ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
              <Image
                src="/icon-verified-v2.png"
                alt=""
                width={32}
                height={32}
                className="h-4 w-4 object-contain"
              />
              Vendeur vérifié
            </span>
          ) : seller?.kyc?.status === "PENDING_REVIEW" ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-900">
              Vendeur: vérification en cours
            </span>
          ) : seller?.kyc?.status === "REJECTED" ? (
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs text-red-800">
              Vendeur: vérification refusée
            </span>
          ) : (
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-800">
              Vendeur non vérifié
            </span>
          )}
          {listing.fuel ? (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-800">
              Carburant: {String(listing.fuel)}
            </span>
          ) : null}
          {listing.gearbox ? (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-800">
              Boîte: {String(listing.gearbox)}
            </span>
          ) : null}
          {listing.powerKw ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
              Puissance: {listing.powerKw} kW
            </span>
          ) : null}
          {listing.doors ? (
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-800">
              Portes: {listing.doors}
            </span>
          ) : null}
          {listing.seats ? (
            <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs text-slate-800">
              Sièges: {listing.seats}
            </span>
          ) : null}
          {listing.hasServiceBook ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
              Carnet d’entretien
            </span>
          ) : null}
          {listing.isNonSmoker ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
              Non-fumeur
            </span>
          ) : null}
          {listing.hasWarranty ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800">
              Garantie
            </span>
          ) : null}
          {listing.isDamaged ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-900">
              Accidentée / endommagée
            </span>
          ) : null}
        </div>

        {currentUser ? (
          buyerOk ? (
            sellerDepositReady ? (
              <DepositClient listingId={listing.id} />
            ) : (
              <div className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-5 text-sm text-slate-800">
                Le vendeur n’est pas encore prêt à recevoir un acompte (IBAN/Stripe non terminé).
              </div>
            )
          ) : (
            <div className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-5 text-sm text-slate-800">
              Pour payer un acompte, ton compte doit être vérifié. Va dans{" "}
              <Link className="text-sky-700 underline" href="/account">
                Mon compte
              </Link>
              .
            </div>
          )
        ) : (
          <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/70 p-5 text-sm text-slate-700">
            Pour payer un acompte,{" "}
            <Link className="text-sky-700 underline" href="/login">
              connecte-toi
            </Link>
            .
          </div>
        )}

        {listing.vin ||
        listing.make ||
        listing.model ||
        listing.trim ||
        listing.color ||
        listing.fuelType ||
        listing.transmission ||
        listing.transmissionSpeeds ||
        listing.driveType ||
        listing.engineCylinders ||
        listing.engineHp ||
        listing.engineModel ||
        listing.displacementL ? (
          <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur">
            <div className="text-sm font-semibold">Fiche véhicule (VIN)</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
              {listing.vin ? (
                <div>
                  <div className="text-xs text-slate-500">VIN</div>
                  <div className="font-medium">{listing.vin}</div>
                </div>
              ) : null}

              {listing.manufacturer ? (
                <div>
                  <div className="text-xs text-slate-500">Constructeur</div>
                  <div className="font-medium">{listing.manufacturer}</div>
                </div>
              ) : null}

              {listing.make || listing.model || listing.trim ? (
                <div>
                  <div className="text-xs text-slate-500">Modèle</div>
                  <div className="font-medium">
                    {[listing.make, listing.model, listing.trim].filter(Boolean).join(" ")}
                  </div>
                </div>
              ) : null}

              {listing.bodyClass ? (
                <div>
                  <div className="text-xs text-slate-500">Carrosserie</div>
                  <div className="font-medium">{listing.bodyClass}</div>
                </div>
              ) : null}

              {listing.bodyType ? (
                <div>
                  <div className="text-xs text-slate-500">Type</div>
                  <div className="font-medium">{labelBodyType(listing.bodyType)}</div>
                </div>
              ) : null}

              {listing.color ? (
                <div>
                  <div className="text-xs text-slate-500">Couleur</div>
                  <div className="font-medium">{listing.color}</div>
                </div>
              ) : null}

              {listing.fuelType ? (
                <div>
                  <div className="text-xs text-slate-500">Carburant</div>
                  <div className="font-medium">{listing.fuelType}</div>
                </div>
              ) : null}

              {listing.transmission ? (
                <div>
                  <div className="text-xs text-slate-500">Transmission</div>
                  <div className="font-medium">{listing.transmission}</div>
                </div>
              ) : null}

              {listing.transmissionSpeeds ? (
                <div>
                  <div className="text-xs text-slate-500">Vitesses</div>
                  <div className="font-medium">{listing.transmissionSpeeds}</div>
                </div>
              ) : null}

              {listing.driveType ? (
                <div>
                  <div className="text-xs text-slate-500">Transmission (roues)</div>
                  <div className="font-medium">{listing.driveType}</div>
                </div>
              ) : null}

              {listing.engineCylinders ? (
                <div>
                  <div className="text-xs text-slate-500">Cylindres</div>
                  <div className="font-medium">{listing.engineCylinders}</div>
                </div>
              ) : null}

              {listing.engineHp ? (
                <div>
                  <div className="text-xs text-slate-500">Puissance</div>
                  <div className="font-medium">
                    {listing.engineHp} ch (VIN){" "}
                    <span className="text-slate-500">
                      (~{Math.round(listing.engineHp * 0.7355)} kW)
                    </span>
                  </div>
                </div>
              ) : null}

              {listing.engineModel ? (
                <div>
                  <div className="text-xs text-slate-500">Moteur (code)</div>
                  <div className="font-medium">{listing.engineModel}</div>
                </div>
              ) : null}

              {listing.displacementL ? (
                <div>
                  <div className="text-xs text-slate-500">Cylindrée</div>
                  <div className="font-medium">{listing.displacementL} L</div>
                </div>
              ) : null}

              {listing.plantCountry || listing.plantCity ? (
                <div className="sm:col-span-2">
                  <div className="text-xs text-slate-500">Usine</div>
                  <div className="font-medium">
                    {[listing.plantCity, listing.plantCountry].filter(Boolean).join(", ")}
                  </div>
                </div>
              ) : null}
            </div>

            {Array.isArray(listing.vinOptions) && listing.vinOptions.length ? (
              <div className="mt-5">
                <div className="text-xs font-medium text-slate-500">Options détectées (VIN)</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {listing.vinOptions.slice(0, 24).map((o, idx) => (
                    <span
                      key={`${idx}-${String(o)}`}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800"
                    >
                      {String(o)}
                    </span>
                  ))}
                </div>
                {listing.vinOptions.length > 24 ? (
                  <div className="mt-2 text-xs text-slate-500">
                    +{listing.vinOptions.length - 24} autres options…
                  </div>
                ) : null}
              </div>
            ) : null}

            {Array.isArray(listing.sellerOptions) && listing.sellerOptions.length ? (
              <div className="mt-5">
                <div className="text-xs font-medium text-slate-500">Options (vendeur)</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {listing.sellerOptions.slice(0, 32).map((o, idx) => (
                    <span
                      key={`${idx}-${String(o)}`}
                      className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs text-sky-800"
                    >
                      {String(o)}
                    </span>
                  ))}
                </div>
                {listing.sellerOptions.length > 32 ? (
                  <div className="mt-2 text-xs text-slate-500">
                    +{listing.sellerOptions.length - 32} autres…
                  </div>
                ) : null}
              </div>
            ) : null}

            {listing.sellerOptionsNote ? (
              <div className="mt-3 text-sm text-slate-700">
                <div className="text-xs font-medium text-slate-500">Autres options</div>
                <div className="mt-1 whitespace-pre-wrap">{listing.sellerOptionsNote}</div>
              </div>
            ) : null}

            {listing.vinDecodedAt ? (
              <div className="mt-3 text-xs text-slate-500">
                Décodé le {listing.vinDecodedAt.toLocaleString("fr-BE")}
              </div>
            ) : null}
          </div>
        ) : null}

        {listing.photos.length ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {listing.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.id}
                src={p.url}
                alt=""
                className="aspect-video w-full rounded-2xl border border-slate-200/70 object-cover bg-white/60 shadow-sm"
              />
            ))}
          </div>
        ) : null}

        <p className="mt-6 text-slate-800">{listing.description}</p>

        <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur">
          <div className="text-sm font-semibold">Coordonnées</div>
          <div className="mt-2 text-sm text-slate-700 space-y-1">
            {listing.contactName ? <div>Nom: {listing.contactName}</div> : null}
            {listing.contactPhone ? <div>Téléphone: {listing.contactPhone}</div> : null}
            {listing.contactEmail ? <div>Email: {listing.contactEmail}</div> : null}
            {!listing.contactName && !listing.contactPhone && !listing.contactEmail ? (
              <div className="text-slate-500">Aucune coordonnée fournie.</div>
            ) : null}
          </div>
        </div>

        <ContactSellerForm
          listingId={listing.id}
          listingTitle={listing.title}
          contactEmail={listing.contactEmail}
        />

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sell"
            className="rounded-xl border border-sky-200/80 bg-white/75 px-5 py-3 font-medium text-sky-800 hover:border-sky-300 hover:bg-sky-50/60 transition backdrop-blur"
          >
            Déposer une annonce similaire
          </Link>
        </div>

        {listing.reports.some((r) => r.status === "READY" && r.reportUrl) ? (
          <div className="mt-8 rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur">
            <div className="text-sm font-semibold">Rapport d’historique</div>
            <div className="mt-2 text-sm text-slate-700">
              Rapport fourni par le vendeur (payé côté vendeur).
            </div>
            <div className="mt-3 space-y-2">
              {listing.reports
                .filter((r) => r.status === "READY" && r.reportUrl)
                .slice(0, 3)
                .map((r) => (
                  <a
                    key={r.id}
                    href={r.reportUrl!}
                    className="inline-block text-sm text-sky-700 underline decoration-sky-300"
                  >
                    Télécharger le rapport ({r.provider})
                  </a>
                ))}
            </div>
          </div>
        ) : null}

        {/* Évaluations du vendeur */}
        {seller && (
          <div className="mt-8">
            <UserRatings userId={seller.id} />
          </div>
        )}

        {/* Formulaire pour noter le vendeur */}
        {currentUser && seller && currentUser.id !== seller.id && (
          <div className="mt-6">
            <CreateRating
              toUserId={seller.id}
              toUserName={seller.email.split("@")[0]}
              listingId={listing.id}
              listingTitle={listing.title}
            />
          </div>
        )}

        <SimilarListings listings={similarListings} userFavorites={userFavorites} />
      </div>
    </main>
  );
}
