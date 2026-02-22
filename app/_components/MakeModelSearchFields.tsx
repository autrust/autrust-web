"use client";

import { getPopularAndOtherBrands } from "@/lib/carBrands";
import { getModelsForMake, hasModelList } from "@/lib/carModels";
import { useCallback, useEffect, useState } from "react";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300";
const makeInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300";
const labelClass = "mb-1 block text-xs font-medium text-slate-500";
const makeLabelClass = "mb-1 block text-sm font-medium text-slate-500";

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

const OTHER_MAKE_VALUE = "other";
const OTHER_MODEL_VALUE = "other";

const otherLabel: Record<Locale, { specifyMake: string; specifyModel: string }> = {
  fr: { specifyMake: "Précisez la marque", specifyModel: "Précisez le modèle" },
  en: { specifyMake: "Specify brand", specifyModel: "Specify model" },
  nl: { specifyMake: "Geef merk op", specifyModel: "Geef model op" },
  de: { specifyMake: "Marke angeben", specifyModel: "Modell angeben" },
};

type Props = {
  defaultMake?: string;
  defaultModel?: string;
  idPrefix: string;
  locale?: Locale;
  /** Catégorie sélectionnée : auto = voitures, moto = motos, utilitaire ou "" = toutes les marques */
  category?: string;
  /** Mode contrôlé : marque et modèle pilotés par le parent (ex. formulaire de dépôt d'annonce) */
  make?: string;
  model?: string;
  onMakeChange?: (value: string) => void;
  onModelChange?: (value: string) => void;
  /** Marques ajoutées automatiquement (recherches fréquentes, 4+ fois) */
  additionalMakes?: string[];
  /** Modèles ajoutés automatiquement par marque (recherches fréquentes) */
  additionalModelsByMake?: Record<string, string[]>;
};

export function MakeModelSearchFields({
  defaultMake = "",
  defaultModel = "",
  idPrefix,
  locale = "fr",
  category = "",
  make: controlledMake,
  model: controlledModel,
  onMakeChange: onMakeChangeProp,
  onModelChange: onModelChangeProp,
  additionalMakes = [],
  additionalModelsByMake = {},
}: Props) {
  const { popular: pop0, other: oth0 } = getPopularAndOtherBrands(category);
  const allBrandsForCategoryInitial = [...pop0, ...oth0];
  const defaultMakeInList = !defaultMake || defaultMake === OTHER_MAKE_VALUE || allBrandsForCategoryInitial.some((b) => b.name === defaultMake);
  const effectiveDefaultMake = !defaultMakeInList && defaultMake ? OTHER_MAKE_VALUE : defaultMake;
  const modelsForDefaultMake = getModelsForMake(effectiveDefaultMake === OTHER_MAKE_VALUE ? "" : effectiveDefaultMake);
  const defaultModelInList = !defaultModel || defaultModel === OTHER_MODEL_VALUE || modelsForDefaultMake.includes(defaultModel);

  const [internalMake, setInternalMake] = useState(
    !defaultMakeInList && defaultMake ? OTHER_MAKE_VALUE : defaultMake
  );
  const [internalModel, setInternalModel] = useState(
    !defaultModelInList && defaultModel ? OTHER_MODEL_VALUE : defaultModel
  );
  const [customMake, setCustomMake] = useState(!defaultMakeInList && defaultMake ? defaultMake : "");
  const [customModel, setCustomModel] = useState(!defaultModelInList && defaultModel ? defaultModel : "");
  const isControlled =
    controlledMake !== undefined &&
    controlledModel !== undefined &&
    onMakeChangeProp !== undefined &&
    onModelChangeProp !== undefined;

  const make = isControlled ? (controlledMake ?? "") : internalMake;
  const model = isControlled ? (controlledModel ?? "") : internalModel;

  const t = labels[locale];
  const tOther = otherLabel[locale];
  const { popular, other } = getPopularAndOtherBrands(category);
  const modelsForMake = getModelsForMake(make === OTHER_MAKE_VALUE ? "" : make);
  const additionalModels = (make && additionalModelsByMake[make]) || [];
  const models = [...modelsForMake, ...additionalModels.filter((m) => !modelsForMake.includes(m))];
  const showModelSelect = hasModelList(make === OTHER_MAKE_VALUE ? "" : make) || additionalModels.length > 0;

  const allBrandsForCategory = [...popular, ...other];
  const makeInList =
    !make ||
    make === OTHER_MAKE_VALUE ||
    allBrandsForCategory.some((b) => b.name === make);

  const handleMakeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (isControlled) {
        onMakeChangeProp?.(value);
      } else {
        setInternalMake(value);
        setInternalModel("");
      }
    },
    [isControlled, onMakeChangeProp]
  );

  const handleModelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
      const value = e.target.value;
      if (isControlled) {
        onModelChangeProp?.(value);
      } else {
        setInternalModel(value);
      }
    },
    [isControlled, onModelChangeProp]
  );

  useEffect(() => {
    if (!isControlled && make && !makeInList) setInternalMake("");
  }, [isControlled, category, make, makeInList]);

  const submittedMake = isControlled ? make : (internalMake === OTHER_MAKE_VALUE ? customMake : internalMake);
  const submittedModel = isControlled ? model : (internalModel === OTHER_MODEL_VALUE ? customModel : internalModel);

  return (
    <>
      <div>
        <label htmlFor={`${idPrefix}-make`} className={makeLabelClass}>
          {t.make}
        </label>
        <select
          id={`${idPrefix}-make`}
          name={isControlled ? undefined : undefined}
          value={makeInList || (isControlled && make) ? make : ""}
          onChange={handleMakeChange}
          className={makeInputClass}
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
          {additionalMakes.filter((name) => !allBrandsForCategory.some((b) => b.name === name)).length > 0 && (
            <optgroup label="Souvent recherchées">
              {additionalMakes
                .filter((name) => !allBrandsForCategory.some((b) => b.name === name))
                .map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
            </optgroup>
          )}
          {isControlled && make && !makeInList ? (
            <option value={make}>{make}</option>
          ) : null}
          <option value={OTHER_MAKE_VALUE}>{t.otherMake}</option>
        </select>
        {!isControlled && (
          <>
            <input type="hidden" name="make" value={submittedMake} readOnly />
            {internalMake === OTHER_MAKE_VALUE && (
              <input
                type="text"
                placeholder={tOther.specifyMake}
                value={customMake}
                onChange={(e) => setCustomMake(e.target.value)}
                className={`${makeInputClass} mt-2`}
                aria-label={tOther.specifyMake}
              />
            )}
          </>
        )}
      </div>
      <div>
        <label htmlFor={`${idPrefix}-model`} className={labelClass}>
          {t.model}
        </label>
        {showModelSelect ? (
          <>
            <select
              id={`${idPrefix}-model`}
              name={undefined}
              value={models.includes(model) || (isControlled && model) || model === OTHER_MODEL_VALUE ? model : ""}
              key={make || "no-make"}
              onChange={handleModelChange}
              className={inputClass}
              aria-label={t.model}
            >
              <option value="">{t.allModels}</option>
              {models.map((modelName) => (
                <option key={modelName} value={modelName}>
                  {modelName}
                </option>
              ))}
              {isControlled && model && !models.includes(model) && model !== OTHER_MODEL_VALUE ? (
                <option value={model}>{model}</option>
              ) : null}
              <option value={OTHER_MODEL_VALUE}>{t.otherMake}</option>
            </select>
            {!isControlled && (
              <>
                <input type="hidden" name="model" value={submittedModel} readOnly />
                {internalModel === OTHER_MODEL_VALUE && (
                  <input
                    type="text"
                    placeholder={tOther.specifyModel}
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    className={`${inputClass} mt-2`}
                    aria-label={tOther.specifyModel}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <>
            <input
              id={`${idPrefix}-model`}
              name={isControlled ? undefined : "model"}
              type="text"
              value={model}
              onChange={handleModelChange}
              placeholder={t.modelPlaceholder}
              className={inputClass}
              aria-label={t.model}
            />
          </>
        )}
      </div>
    </>
  );
}
