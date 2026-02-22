import Link from "next/link";
import Image from "next/image";
import type { ListingCardModel } from "@/lib/listings";
import { formatPriceEUR } from "@/lib/listings";

function categoryIconSrc(label: string) {
  if (label === "Voiture") return "/icon-voiture-v2.png";
  if (label === "Moto") return "/icon-moto-v2.png";
  return "/icon-utilitaire-v2.png";
}

export function ListingCard({ 
  listing, 
  compact = false 
}: { 
  listing: ListingCardModel;
  compact?: boolean;
}) {
  const isRent = listing.mode === "RENT";
  return (
    <Link
      href={`/listings/${listing.id}`}
      className={`block ${compact ? "rounded-lg" : "rounded-2xl"} border border-slate-200/70 bg-white/75 overflow-hidden shadow-sm backdrop-blur hover:border-sky-300 hover:shadow-md transition relative ${
        compact ? "text-xs" : ""
      }`}
    >
      {/* Photo du véhicule */}
      {listing.photoUrl ? (
        <div className={`${compact ? "h-28" : "aspect-video"} w-full relative bg-slate-100 overflow-hidden`}>
          {compact ? (
            <Image
              src={listing.photoUrl}
              alt={listing.title}
              width={250}
              height={112}
              className="w-full h-full object-cover"
              sizes="150px"
            />
          ) : (
            <Image
              src={listing.photoUrl}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </div>
      ) : (
        <div className={`${compact ? "h-28" : "aspect-video"} w-full bg-slate-100 flex items-center justify-center`}>
          <Image
            src={categoryIconSrc(listing.categoryLabel)}
            alt=""
            width={compact ? 32 : 64}
            height={compact ? 32 : 64}
            className={`${compact ? "h-8 w-8" : "h-16 w-16"} object-contain opacity-40`}
          />
        </div>
      )}
      
      <div className={compact ? "p-2" : "p-6"}>
        <div className={`flex items-center justify-between ${compact ? "gap-1" : "gap-3"}`}>
          <div className={`flex items-center gap-1 ${compact ? "text-[10px]" : "text-sm"} font-medium text-sky-700`}>
            <Image
              src={categoryIconSrc(listing.categoryLabel)}
              alt=""
              width={48}
              height={48}
              className={`${compact ? "h-3 w-3" : "h-5 w-5"} object-contain`}
            />
            <span>{listing.categoryLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            {listing.isSponsored ? (
              <span className={`rounded-full border border-amber-300 bg-amber-100 ${compact ? "px-1.5 py-0.5 text-[9px]" : "px-3 py-1 text-xs"} font-medium text-amber-800`}>
                ⭐ Partenaire
              </span>
            ) : null}
            {isRent ? (
              <span className={`rounded-full border border-emerald-200 bg-emerald-50 ${compact ? "px-1.5 py-0.5 text-[9px]" : "px-3 py-1 text-xs"} font-medium text-emerald-800`}>
                Location
              </span>
            ) : null}
          </div>
        </div>
        <div className={`${compact ? "mt-0.5 text-sm" : "mt-1 text-xl"} font-semibold text-slate-900 leading-tight`}>{listing.title}</div>
        {(listing.make || listing.model) && (
          <div className={`${compact ? "mt-0.5 text-[10px]" : "mt-1"} text-slate-600`}>
            {[listing.make, listing.model].filter(Boolean).join(" ")}
          </div>
        )}
        <div className={`${compact ? "mt-1 text-[10px]" : "mt-2"} text-slate-600`}>
          {formatPriceEUR(listing.price)}
          {isRent ? " / jour" : ""} • {listing.year} •{" "}
          {listing.km.toLocaleString("fr-BE")} km • {listing.city}
        </div>
      </div>
    </Link>
  );
}

