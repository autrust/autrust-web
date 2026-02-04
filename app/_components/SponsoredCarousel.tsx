"use client";

import { useState, useEffect } from "react";
import type { ListingCardModel } from "@/lib/listings";
import { ListingCardWithFavorite } from "./ListingCardWithFavorite";

interface SponsoredCarouselProps {
  listings: ListingCardModel[];
  userFavorites: Set<string>;
}

export function SponsoredCarousel({ listings, userFavorites }: SponsoredCarouselProps) {
  const [startIndex, setStartIndex] = useState(0);
  const itemsToShow = 3;

  // Rotation automatique toutes les 10 secondes
  useEffect(() => {
    if (listings.length <= itemsToShow) return;

    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % listings.length);
    }, 10000); // 10 secondes

    return () => clearInterval(interval);
  }, [listings.length]);

  if (listings.length === 0) {
    return null;
  }

  // Obtenir les 3 annonces à afficher en rotation
  const getDisplayedListings = () => {
    const displayed: ListingCardModel[] = [];
    for (let i = 0; i < itemsToShow; i++) {
      const index = (startIndex + i) % listings.length;
      displayed.push(listings[index]);
    }
    return displayed;
  };

  const displayedListings = getDisplayedListings();

  return (
    <div className="sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">⭐ En vedette</h2>
        {listings.length > itemsToShow && (
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(listings.length, 10) }).map((_, index) => {
              const actualIndex = index % listings.length;
              return (
                <button
                  key={index}
                  onClick={() => setStartIndex(actualIndex)}
                  className={`h-2 rounded-full transition-all ${
                    actualIndex === startIndex
                      ? "w-6 bg-sky-600"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                  aria-label={`Aller à l'annonce ${actualIndex + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>
      <div className="space-y-2">
        {displayedListings.map((listing, position) => (
          <div
            key={`${listing.id}-${startIndex}-${position}`}
            className="transition-opacity duration-500"
          >
            <ListingCardWithFavorite
              listing={listing}
              initialFavorited={userFavorites.has(listing.id)}
              compact={true}
            />
          </div>
        ))}
      </div>
      {listings.length > itemsToShow && (
        <div className="mt-4 text-xs text-slate-500 text-center">
          {startIndex + 1} / {listings.length}
        </div>
      )}
    </div>
  );
}
