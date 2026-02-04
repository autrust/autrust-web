"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SaveSearchButton() {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Récupérer tous les paramètres de recherche
      const filters: Record<string, unknown> = {};
      searchParams.forEach((value, key) => {
        if (key === "option") {
          // Gérer les options multiples
          if (!filters.options) {
            filters.options = [];
          }
          (filters.options as string[]).push(value);
        } else {
          filters[key] = value;
        }
      });

      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), filters }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "MAX_SEARCHES_REACHED") {
          setError(`Tu as déjà ${data.message || "3 recherches sauvegardées"}. Supprime-en une pour en ajouter une nouvelle.`);
        } else {
          setError("Erreur lors de la sauvegarde");
        }
        setLoading(false);
        return;
      }

      setShowModal(false);
      setName("");
      router.refresh();
    } catch (error) {
      console.error("Error saving search:", error);
      setError("Erreur lors de la sauvegarde");
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-4 w-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          className="h-3 w-3"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        Sauvegarder cette recherche
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Sauvegarder la recherche</h3>
            <p className="mt-2 text-sm text-slate-600">
              Donne un nom à cette recherche pour recevoir des alertes sur les nouvelles annonces correspondantes.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700">Nom de la recherche</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: BMW série 3"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setShowModal(false);
                }}
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setName("");
                  setError(null);
                }}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500 transition disabled:opacity-50"
              >
                {loading ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
