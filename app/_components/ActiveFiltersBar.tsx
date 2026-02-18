"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORY_OPTIONS, BODY_TYPE_OPTIONS } from "@/lib/listings";

export function ActiveFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");
  const category = searchParams.get("category");
  const bodyType = searchParams.get("bodyType");
  const city = searchParams.get("city");
  const make = searchParams.get("make");
  const radiusKm = searchParams.get("radiusKm");
  const registered = searchParams.get("registered");
  const minRegistrationYear = searchParams.get("minRegistrationYear");
  const maxRegistrationYear = searchParams.get("maxRegistrationYear");

  const activeFilters: Array<{ key: string; label: string; value: string }> = [];

  if (mode === "SALE") {
    activeFilters.push({ key: "mode", label: "Achat", value: "SALE" });
  } else if (mode === "RENT") {
    activeFilters.push({ key: "mode", label: "Location", value: "RENT" });
  }

  if (category) {
    const cat = CATEGORY_OPTIONS.find((c) => c.slug === category);
    if (cat) {
      activeFilters.push({ key: "category", label: cat.label, value: category });
    }
  }

  if (bodyType) {
    const bt = BODY_TYPE_OPTIONS.find((b) => b.slug === bodyType);
    if (bt) {
      activeFilters.push({ key: "bodyType", label: bt.label, value: bodyType });
    }
  }

  if (city) {
    activeFilters.push({ key: "city", label: city, value: city });
  }

  if (make) {
    activeFilters.push({ key: "make", label: make, value: make });
  }

  if (radiusKm) {
    activeFilters.push({ key: "radiusKm", label: `Rayon ${radiusKm} km`, value: radiusKm });
  }

  if (registered === "yes") {
    let label = "Déjà été immatriculé";
    if (minRegistrationYear || maxRegistrationYear) {
      const yearRange = [
        minRegistrationYear || "...",
        maxRegistrationYear || "...",
      ].join(" - ");
      label = `Déjà été immatriculé (${yearRange})`;
    }
    activeFilters.push({ key: "registered", label, value: "yes" });
  } else if (registered === "no") {
    activeFilters.push({ key: "registered", label: "Pas encore été immatriculé", value: "no" });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  const handleRemove = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`/listings?${params.toString()}`);
  };

  const handleRemoveAll = () => {
    router.push("/listings");
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {activeFilters.map((filter) => (
        <div
          key={`${filter.key}-${filter.value}`}
          role="group"
          className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
        >
          <button
            type="button"
            onClick={() => handleRemove(filter.key)}
            className="text-left"
          >
            {filter.label}
          </button>
          <button
            type="button"
            onClick={() => handleRemove(filter.key)}
            className="ml-0.5 flex items-center justify-center rounded-full hover:bg-slate-200 p-0.5"
            aria-label={`Retirer le filtre ${filter.label}`}
          >
            <svg
              className="h-3.5 w-3.5 text-slate-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
      {activeFilters.length > 1 && (
        <button
          type="button"
          onClick={handleRemoveAll}
          className="text-sm text-sky-700 underline decoration-sky-300 hover:text-sky-800"
        >
          Réinitialiser les filtres
        </button>
      )}
    </div>
  );
}
