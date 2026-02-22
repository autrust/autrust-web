"use client";

import { getPopularAndOtherBrands } from "@/lib/carBrands";
import { getModelsForMake, hasModelList } from "@/lib/carModels";
import { useCallback, useEffect, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300";
const labelClass = "mb-1 block text-xs font-medium text-slate-500";

type Locale = "fr" | "en" | "nl" | "de";

const labels: Record<Locale, { make: string; model: string; allMakes: string; allModels: string; modelPlaceholder: string; popularBrands: string; otherBrands: string; otherMake: string }> = {
  fr: {
    make: "Marque",
    model: "Modèle",
    allMakes: "Toutes",
    allModels: "Tous les modèles",
    modelPlaceholder: "Ex: Golf, 308…",
    popularBrands: "Marques populaires",
    otherBrands: "Autres marques",
    otherMake: "Autre",
  },
  en: {
    make: "Brand",
    model: "Model",
    allMakes: "All",
    allModels: "All models",
    modelPlaceholder: "e.g. Golf, 308",
    popularBrands: "Popular brands",
    otherBrands: "Other brands",
    otherMake: "Other",
  },
  nl: {
    make: "Merk",
    model: "Model",
    allMakes: "Alle",
    allModels: "Alle modellen",
    modelPlaceholder: "Bijv. Golf, 308",
    popularBrands: "Populaire merken",
    otherBrands: "Overige merken",
    otherMake: "Overig",
  },
  de: {
    make: "Marke",
    model: "Modell",
    allMakes: "Alle",
    allModels: "Alle Modelle",
    modelPlaceholder: "z. B. Golf, 308",
    popularBrands: "Beliebte Marken",
    otherBrands: "Weitere Marken",
    otherMake: "Sonstige",
  },
};

type Props = {
  defaultMake?: string;
  defaultModel?: string;
  idPrefix: string;
  locale?: Locale;
  /** Catégorie sélectionnée : auto = voitures, moto = motos, utilitaire ou "" = toutes les marques */
  category?: string;
};

export function MakeModelSearchFields({
  defaultMake = "",
  defaultModel = "",
  idPrefix,
  locale = "fr",
  category = "",
}: Props) {
  const [make, setMake] = useState(defaultMake);
  const t = labels[locale];
  const { popular, other } = getPopularAndOtherBrands(category);
  const models = getModelsForMake(make);
  const showModelSelect = hasModelList(make);

  const handleMakeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setMake(e.target.value);
  }, []);

  const allBrandsForCategory = [...popular, ...other];
  const OTHER_MAKE_VALUE = "other";
  const makeInList =
    !make ||
    make === OTHER_MAKE_VALUE ||
    allBrandsForCategory.some((b) => b.name === make);

  useEffect(() => {
    if (make && !makeInList) setMake("");
  }, [category, make, makeInList]);

  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-make`} className={labelClass}>
          {t.make}
        </label>
        <select
          id={`${idPrefix}-make`}
          name="make"
          value={makeInList ? make : ""}
          onChange={handleMakeChange}
          className={inputClass}
          aria-label={t.make}
        >
          <option value="">{t.allMakes}</option>
          {popular.length > 0 && (
            <optgroup label={t.popularBrands}>
              {popular.map((b) => (
                <option key={b.slug} value={b.name}>
                  {b.name}
                </option>
              ))}
            </optgroup>
          )}
          {other.length > 0 && (
            <optgroup label={t.otherBrands}>
              {other.map((b) => (
                <option key={b.slug} value={b.name}>
                  {b.name}
                </option>
              ))}
            </optgroup>
          )}
          <option value={OTHER_MAKE_VALUE}>{t.otherMake}</option>
        </select>
      </div>
      <div>
        <label htmlFor={`${idPrefix}-model`} className={labelClass}>
          {t.model}
        </label>
        {showModelSelect ? (
          <select
            id={`${idPrefix}-model`}
            name="model"
            defaultValue={models.includes(defaultModel) ? defaultModel : ""}
            key={make || "no-make"}
            className={inputClass}
            aria-label={t.model}
          >
            <option value="">{t.allModels}</option>
            {models.map((modelName) => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`${idPrefix}-model`}
            name="model"
            type="text"
            defaultValue={defaultModel}
            placeholder={t.modelPlaceholder}
            className={inputClass}
            aria-label={t.model}
          />
        )}
      </div>
    </>
  );
}
