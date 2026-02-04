"use client";

import { useRouter, useSearchParams } from "next/navigation";

type ModeTag = {
  value: "SALE" | "RENT";
  label: string;
};

const MODE_TAGS: ModeTag[] = [
  { value: "SALE", label: "Achat" },
  { value: "RENT", label: "Location" },
];

export function ModeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMode = searchParams.get("mode")?.toUpperCase();

  const handleToggle = (value: "SALE" | "RENT") => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Si le tag est déjà actif, on le supprime
    if (currentMode === value) {
      params.delete("mode");
    } else {
      // Sinon, on active ce tag
      params.set("mode", value);
    }

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      {MODE_TAGS.map((tag) => {
        const isActive = currentMode === tag.value;
        return (
          <button
            key={tag.value}
            type="button"
            onClick={() => handleToggle(tag.value)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span>{tag.label}</span>
            {isActive && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("mode");
                  router.push(`/listings?${params.toString()}`);
                }}
                className="ml-0.5 flex items-center justify-center rounded-full hover:bg-slate-200 p-0.5"
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
            )}
          </button>
        );
      })}
    </div>
  );
}
