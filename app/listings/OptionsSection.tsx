"use client";

import { useState } from "react";
import { SELLER_OPTION_GROUPS } from "@/lib/sellerOptions";

interface OptionsSectionProps {
  selectedCount: number;
  filters: {
    options?: string[];
  };
  description?: string;
}

export function OptionsSection({ selectedCount, filters, description = "Coche les options voulues pour filtrer les annonces." }: OptionsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <div className="text-sm font-semibold text-slate-900">
            Options ({selectedCount})
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {description}
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`h-5 w-5 text-slate-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {SELLER_OPTION_GROUPS.map((g) => (
            <div key={g.title}>
              <div className="text-xs font-medium text-slate-500">{g.title}</div>
              <div className="mt-2 grid gap-2">
                {g.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-800">
                    <input
                      type="checkbox"
                      name="option"
                      value={opt}
                      defaultChecked={filters.options?.includes(opt) ?? false}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
