"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function RegistrationFilter() {
  const searchParams = useSearchParams();
  const registeredParam = searchParams.get("registered") || "";
  const [registered, setRegistered] = useState<string>(registeredParam);

  return (
    <div className="space-y-3">
      <select
        name="registered"
        defaultValue={registeredParam}
        onChange={(e) => setRegistered(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
      >
        <option value="">Immatriculation (tout)</option>
        <option value="yes">Déjà été immatriculé</option>
        <option value="no">Pas encore été immatriculé</option>
      </select>

      {registered === "yes" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-slate-600">Année min (mise en circulation)</label>
            <input
              name="minRegistrationYear"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              placeholder="Ex: 2019"
              defaultValue={searchParams.get("minRegistrationYear") || ""}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600">Année max (mise en circulation)</label>
            <input
              name="maxRegistrationYear"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              placeholder="Ex: 2023"
              defaultValue={searchParams.get("maxRegistrationYear") || ""}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
