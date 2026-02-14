import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ListingCardWithFavorite } from "@/app/_components/ListingCardWithFavorite";
import { toListingCardModelFromDb } from "@/lib/listingsDb";
import { redirect } from "next/navigation";

export default async function FavorisPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth?next=/favoris");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        include: {
          photos: {
            orderBy: { order: "asc" },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const listings = favorites
    .map((f) => f.listing)
    .map((l) => toListingCardModelFromDb(l));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Mes favoris</h1>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/75 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8 text-slate-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.312-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-700">
            Aucune annonce sauvegardée pour le moment
          </p>
          <p className="mt-2 text-slate-500">
            Cliquez sur l&apos;icône ❤️ pour sauvegarder vos véhicules favoris.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCardWithFavorite
              key={listing.id}
              listing={listing}
              initialFavorited={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
