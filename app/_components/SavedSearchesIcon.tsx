"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function SavedSearchesIcon() {
  const [totalNewCount, setTotalNewCount] = useState(0);

  useEffect(() => {
    // Charger le nombre total de nouvelles annonces
    fetch("/api/saved-searches")
      .then((res) => res.json())
      .then((data) => {
        if (data.savedSearches) {
          const total = data.savedSearches.reduce(
            (sum: number, search: { newListingsCount: number }) => sum + search.newListingsCount,
            0
          );
          setTotalNewCount(total);
        }
      })
      .catch(() => {
        // Ignorer les erreurs
      });
  }, []);

  return (
    <Link
      href="/recherches"
      className="relative flex items-center justify-center rounded-xl border border-amber-200 bg-white p-2.5 text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60"
      aria-label="Mes recherches sauvegardées"
      title="Mes recherches sauvegardées"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
      >
        {/* Étoile avec remplissage blanc */}
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="white"
          stroke="currentColor"
          strokeWidth={1.5}
          className="text-amber-500"
        />
        {/* Loupe positionnée à l'intérieur de l'étoile (légèrement à droite, comme dans l'image) */}
        <g transform="translate(7, 5)">
          <circle
            cx="7"
            cy="5"
            r="3"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-amber-600"
          />
          <line
            x1="9.5"
            y1="7.5"
            x2="12"
            y2="10"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            className="text-amber-600"
          />
        </g>
      </svg>
      {totalNewCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-sm">
          {totalNewCount > 9 ? "9+" : totalNewCount}
        </span>
      )}
    </Link>
  );
}
