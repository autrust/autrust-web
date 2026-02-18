"use client";

import { type Locale } from "@/lib/locale";

const LABELS: Record<Locale, string> = { fr: "FR", en: "EN" };

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  return (
    <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5 text-sm">
      {(["fr", "en"] as const).map((loc) => (
        <form key={loc} action="/api/locale" method="POST" className="inline">
          <input type="hidden" name="locale" value={loc} />
          <button
            type="submit"
            className={`rounded-lg px-2.5 py-1.5 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 ${
              currentLocale === loc
                ? "bg-sky-100 text-sky-800"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
            }`}
            title={loc === "fr" ? "Français" : "English"}
          >
            {LABELS[loc]}
          </button>
        </form>
      ))}
    </div>
  );
}
