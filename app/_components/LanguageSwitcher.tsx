"use client";

import { type Locale } from "@/lib/locale";
import { useRef, useEffect, useState } from "react";

const LABELS: Record<Locale, string> = { fr: "FR", en: "EN", nl: "NL", de: "DE" };
const TITLES: Record<Locale, string> = { fr: "Français", en: "English", nl: "Nederlands", de: "Deutsch" };
const LOCALES: Locale[] = ["fr", "en", "nl", "de"];

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
        title={TITLES[currentLocale]}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {LABELS[currentLocale]}
        <svg
          className={`h-3.5 w-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          {LOCALES.map((loc) => (
            <form key={loc} action="/api/locale" method="POST" className="block">
              <input type="hidden" name="locale" value={loc} />
              <button
                type="submit"
                role="menuitem"
                className={`block w-full px-4 py-2.5 text-left text-sm transition ${
                  currentLocale === loc
                    ? "bg-sky-50 font-medium text-sky-800"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {LABELS[loc]} — {TITLES[loc]}
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
