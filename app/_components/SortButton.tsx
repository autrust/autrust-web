"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const SORT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Résultats standards" },
  { value: "price_asc", label: "Prix (croissant)" },
  { value: "price_desc", label: "Prix (décroissant)" },
  { value: "km_asc", label: "Kilométrage (croissant)" },
  { value: "km_desc", label: "Kilométrage (décroissant)" },
  { value: "year_asc", label: "Année (la plus ancienne en premier)" },
  { value: "year_desc", label: "Année (la plus récente en premier)" },
  { value: "date_desc", label: "Annonces (la plus récente en premier)" },
  { value: "date_asc", label: "Annonces (la plus ancienne en premier)" },
  { value: "power_asc", label: "Puissance (croissant)" },
  { value: "power_desc", label: "Puissance (décroissant)" },
];

export function SortButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSort = searchParams.get("sort") ?? "";
  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === currentSort)?.label ?? "Résultats standards";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    router.push(`/listings?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm hover:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300 transition min-w-[200px]"
      >
        <span className="text-sm font-medium truncate">{currentLabel}</span>
        <svg
          className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-full min-w-[240px] rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="py-1">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value || "default"}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  currentSort === option.value
                    ? "bg-emerald-50 text-emerald-800 font-medium"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {currentSort === option.value && <span className="mr-2">✔</span>}
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
