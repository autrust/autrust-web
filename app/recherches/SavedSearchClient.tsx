"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ListingFilters } from "@/lib/listings";

interface SavedSearch {
  id: string;
  name: string;
  filters: ListingFilters;
  lastCheckedAt: string | Date;
  newListingsCount: number;
  createdAt: string | Date;
}

export function SavedSearchClient({ search }: { search: SavedSearch }) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newCount, setNewCount] = useState(search.newListingsCount);
  const router = useRouter();

  const checkForNew = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/saved-searches/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId: search.id }),
      });

      if (!res.ok) {
        throw new Error("Failed to check");
      }

      const data = await res.json();
      setNewCount(data.newCount);
    } catch (error) {
      console.error("Error checking for new listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSearch = async () => {
    if (!confirm("Supprimer cette recherche sauvegardée ?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/saved-searches?id=${search.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      router.refresh();
    } catch (error) {
      console.error("Error deleting search:", error);
      setDeleting(false);
    }
  };

  // Construire l'URL de recherche
  const searchParams = new URLSearchParams();
  Object.entries(search.filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });
  const searchUrl = `/listings?${searchParams.toString()}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/75 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">{search.name}</h3>
            {newCount > 0 && (
              <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-medium text-white">
                {newCount} nouvelle{newCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Dernière vérification :{" "}
            {new Date(search.lastCheckedAt).toLocaleString("fr-BE", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {search.newListingsCount > 0 && (
              <span className="ml-2 text-red-600 font-medium">
                • {search.newListingsCount} nouvelle{search.newListingsCount > 1 ? "s" : ""} annonce{search.newListingsCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={searchUrl}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition"
            >
              Voir les résultats
            </Link>
            <button
              onClick={checkForNew}
              disabled={loading}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
            >
              {loading ? "Vérification..." : "Vérifier maintenant"}
            </button>
            <button
              onClick={deleteSearch}
              disabled={deleting}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50"
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
