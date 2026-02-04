"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function FavoriteButton({
  listingId,
  initialFavorited = false,
}: {
  listingId: string;
  initialFavorited?: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      if (res.status === 401) {
        // Non connecté, rediriger vers login
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to toggle favorite");
      }

      const data = await res.json();
      setFavorited(data.favorited);
      
      // Rafraîchir la page si on est sur /favoris pour mettre à jour la liste
      if (window.location.pathname === "/favoris" && !data.favorited) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center justify-center rounded-lg p-2 transition shadow-sm ${
        favorited
          ? "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200"
          : "bg-white/90 text-slate-400 hover:bg-white hover:text-red-500 border border-slate-200"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={favorited ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.312-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
