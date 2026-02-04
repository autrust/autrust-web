"use client";

import { ListingCard } from "./ListingCard";
import { FavoriteButton } from "./FavoriteButton";
import type { ListingCardModel } from "@/lib/listings";

export function ListingCardWithFavorite({
  listing,
  initialFavorited = false,
  compact = false,
}: {
  listing: ListingCardModel;
  initialFavorited?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="relative group">
      <ListingCard listing={listing} compact={compact} />
      <div className={`absolute ${compact ? "right-1 top-1" : "right-3 top-3"} z-10`}>
        <FavoriteButton listingId={listing.id} initialFavorited={initialFavorited} />
      </div>
    </div>
  );
}
