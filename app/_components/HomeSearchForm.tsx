"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/lib/locale";
import { CATEGORY_OPTIONS, COUNTRY_OPTIONS } from "@/lib/listings";
import { MakeModelSearchFields } from "@/app/_components/MakeModelSearchFields";

const L = (locale: Locale, o: { fr: string; en: string; nl: string; de: string }) => o[locale] ?? o.fr;

type Props = {
  locale: Locale;
  t: {
    listing: { categoryAuto: string; categoryMoto: string; categoryUtilitaire: string };
    home: {
      searchCta: string;
      tipSearch: string;
    };
  };
};

export function HomeSearchForm({ locale, t }: Props) {
  const [category, setCategory] = useState("");

  return (
    <form action="/listings" method="GET" className="mt-8 max-w-3xl">
      <div className="rounded-2xl border-2 border-slate-200/80 bg-white p-4 shadow-lg shadow-sky-500/10 focus-within:border-sky-400 focus-within:shadow-xl focus-within:shadow-sky-500/15 transition-all duration-200">
        <p className="mb-3 text-xs font-medium text-slate-500">
          {L(locale, { fr: "Catégorie", en: "Category", nl: "Categorie", de: "Kategorie" })}
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-700 has-[:checked]:border-sky-400 has-[:checked]:bg-sky-50 has-[:checked]:text-sky-700">
            <input
              type="radio"
              name="category"
              value=""
              checked={category === ""}
              onChange={() => setCategory("")}
              className="h-4 w-4 accent-sky-600"
            />
            {L(locale, { fr: "Toutes", en: "All", nl: "Alle", de: "Alle" })}
          </label>
          {CATEGORY_OPTIONS.map((c) => (
            <label
              key={c.slug}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-700 has-[:checked]:border-sky-400 has-[:checked]:bg-sky-50 has-[:checked]:text-sky-700"
            >
              <input
                type="radio"
                name="category"
                value={c.slug}
                checked={category === c.slug}
                onChange={() => setCategory(c.slug)}
                className="h-4 w-4 accent-sky-600"
              />
              <Image
                src={
                  c.slug === "auto"
                    ? "/icon-voiture-v2.png"
                    : c.slug === "moto"
                      ? "/icon-moto-v2.png"
                      : "/icon-utilitaire-v2.png"
                }
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
              />
              {locale === "fr"
                ? c.label
                : c.slug === "auto"
                  ? t.listing.categoryAuto
                  : c.slug === "moto"
                    ? t.listing.categoryMoto
                    : t.listing.categoryUtilitaire}
            </label>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MakeModelSearchFields idPrefix="home" locale={locale} category={category} />
          <div>
            <label
              htmlFor="home-maxPrice"
              className="mb-1 block text-xs font-medium text-slate-500"
            >
              {L(locale, { fr: "Prix max (€)", en: "Max price (€)", nl: "Max. prijs (€)", de: "Max. Preis (€)" })}
            </label>
            <input
              id="home-maxPrice"
              name="maxPrice"
              type="number"
              min={0}
              placeholder="—"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
          </div>
          <div>
            <label
              htmlFor="home-minYear"
              className="mb-1 block text-xs font-medium text-slate-500"
            >
              {L(locale, { fr: "Année min.", en: "Min. year", nl: "Min. jaar", de: "Min. Baujahr" })}
            </label>
            <input
              id="home-minYear"
              name="minYear"
              type="number"
              min={1900}
              max={2100}
              placeholder="—"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
          </div>
          <div>
            <label
              htmlFor="home-maxKm"
              className="mb-1 block text-xs font-medium text-slate-500"
            >
              {L(locale, { fr: "Kilométrage max", en: "Max mileage", nl: "Max. km", de: "Max. km" })}
            </label>
            <input
              id="home-maxKm"
              name="maxKm"
              type="number"
              min={0}
              placeholder="—"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
          </div>
          <div>
            <label
              htmlFor="home-gearbox"
              className="mb-1 block text-xs font-medium text-slate-500"
            >
              {L(locale, { fr: "Transmission", en: "Transmission", nl: "Transmissie", de: "Getriebe" })}
            </label>
            <select
              id="home-gearbox"
              name="gearbox"
              defaultValue=""
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            >
              <option value="">{L(locale, { fr: "Toutes", en: "All", nl: "Alle", de: "Alle" })}</option>
              <option value="manual">{L(locale, { fr: "Manuelle", en: "Manual", nl: "Handgeschakeld", de: "Manuell" })}</option>
              <option value="automatic">{L(locale, { fr: "Automatique", en: "Automatic", nl: "Automatisch", de: "Automatik" })}</option>
              <option value="semi-automatic">Semi-auto</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="home-country"
              className="mb-1 block text-xs font-medium text-slate-500"
            >
              {L(locale, { fr: "Pays", en: "Country", nl: "Land", de: "Land" })}
            </label>
            <select
              id="home-country"
              name="country"
              defaultValue=""
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            >
              <option value="">{L(locale, { fr: "Tous", en: "All", nl: "Alle", de: "Alle" })}</option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-sky-300/60">
              <input
                type="checkbox"
                name="electric"
                value="1"
                className="h-4 w-4 accent-amber-500"
                aria-label={
                  L(locale, { fr: "100% électrique uniquement", en: "100% electric only", nl: "Alleen 100% elektrisch", de: "Nur 100% elektrisch" })
                }
              />
              <span className="inline-flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 text-amber-500"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
                </svg>
                {L(locale, { fr: "100% électrique", en: "100% electric", nl: "100% elektrisch", de: "100% elektrisch" })}
              </span>
            </label>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-500 active:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
            >
              {t.home.searchCta}
            </button>
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{t.home.tipSearch}</p>
    </form>
  );
}
