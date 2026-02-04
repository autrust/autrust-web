"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getRecentListingIds } from "./RecentlyViewedTracker";
import { ListingCardWithFavorite } from "./ListingCardWithFavorite";
import type { ListingCardModel } from "@/lib/listings";

export function RecentlyViewedList() {
  const [listings, setListings] = useState<ListingCardModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getRecentListingIds();
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    fetch(`/api/listings/by-ids?ids=${encodeURIComponent(ids.join(","))}`)
      .then((res) => res.json())
      .then((data: { items: ListingCardModel[] }) => {
        setListings(data.items ?? []);
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || listings.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-slate-900">Récemment consultées</h2>
      <p className="mt-1 text-sm text-slate-600">
        Les annonces que vous avez vues récemment
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <ListingCardWithFavorite
            key={l.id}
            listing={l}
            initialFavorited={false}
          />
        ))}
      </div>
    </section>
  );
}
