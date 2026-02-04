import { ListingCardWithFavorite } from "@/app/_components/ListingCardWithFavorite";
import type { ListingCardModel } from "@/lib/listings";

export function SimilarListings({
  listings,
  userFavorites,
}: {
  listings: ListingCardModel[];
  userFavorites: Set<string>;
}) {
  if (listings.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-slate-900">Véhicules similaires</h2>
      <p className="mt-1 text-sm text-slate-600">
        Autres annonces qui pourraient vous intéresser
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {listings.map((l) => (
          <ListingCardWithFavorite
            key={l.id}
            listing={l}
            initialFavorited={userFavorites.has(l.id)}
          />
        ))}
      </div>
    </section>
  );
}
