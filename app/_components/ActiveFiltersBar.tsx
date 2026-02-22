"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORY_OPTIONS, BODY_TYPE_OPTIONS, COUNTRY_OPTIONS } from "@/lib/listings";

export function ActiveFiltersBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get("mode");
  const category = searchParams.get("category");
  const bodyType = searchParams.get("bodyType");
  const city = searchParams.get("city");
  const make = searchParams.get("make");
  const model = searchParams.get("model");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minYear = searchParams.get("minYear");
  const maxYear = searchParams.get("maxYear");
  const minKm = searchParams.get("minKm");
  const maxKm = searchParams.get("maxKm");
  const minPowerKw = searchParams.get("minPowerKw");
  const maxPowerKw = searchParams.get("maxPowerKw");
  const gearbox = searchParams.get("gearbox");
  const country = searchParams.get("country");
  const electric = searchParams.get("electric");
  const fuel = searchParams.get("fuel");
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
    activeFilters.push({
      key: "make",
      label: `Marque: ${make === "other" ? "Autre" : make}`,
      value: make,
    });
  }

  if (model) {
    activeFilters.push({ key: "model", label: `Modèle: ${model}`, value: model });
  }

  if (minPrice) {
    activeFilters.push({ key: "minPrice", label: `Prix à partir de: ${minPrice} €`, value: minPrice });
  }
  if (maxPrice) {
    activeFilters.push({ key: "maxPrice", label: `Prix jusqu'à: ${maxPrice} €`, value: maxPrice });
  }

  if (minYear) {
    activeFilters.push({ key: "minYear", label: `Année de: ${minYear}`, value: minYear });
  }

  if (maxYear) {
    activeFilters.push({ key: "maxYear", label: `Année jusqu'à: ${maxYear}`, value: maxYear });
  }

  if (minKm) {
    activeFilters.push({ key: "minKm", label: `Km à partir de: ${minKm}`, value: minKm });
  }
  if (maxKm) {
    activeFilters.push({ key: "maxKm", label: `Km jusqu'à: ${maxKm}`, value: maxKm });
  }

  if (minPowerKw) {
    activeFilters.push({ key: "minPowerKw", label: `Puissance à partir de: ${minPowerKw} kW`, value: minPowerKw });
  }
  if (maxPowerKw) {
    activeFilters.push({ key: "maxPowerKw", label: `Puissance jusqu'à: ${maxPowerKw} kW`, value: maxPowerKw });
  }

  if (gearbox) {
    const gearboxLabel =
      gearbox === "manual" ? "Manuelle" : gearbox === "automatic" ? "Automatique" : gearbox === "semi-automatic" ? "Semi-auto" : gearbox;
    activeFilters.push({ key: "gearbox", label: gearboxLabel, value: gearbox });
  }

  if (country) {
    const countryLabel = COUNTRY_OPTIONS.find((c) => c.code === country)?.label ?? country;
    activeFilters.push({ key: "country", label: countryLabel, value: country });
  }

  if (electric || fuel === "electric") {
    activeFilters.push({ key: "electric", label: "100% électrique", value: "1" });
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
