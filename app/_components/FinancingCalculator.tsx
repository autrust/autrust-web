"use client";

import { useState, useMemo } from "react";
import { formatPriceEUR } from "@/lib/listings";

// Taux indicatifs type crédit auto (Belgique/France, 2024–2025) : environ 5,5 % à 8 % TAEG selon durée et profil
const DEFAULT_TAEG = 6.9;
const MIN_TAEG = 4;
const MAX_TAEG = 12;
const DURATIONS = [12, 24, 36, 48, 60, 72, 84];

function monthlyPayment(principal: number, annualRatePercent: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function FinancingCalculator({ price }: { price: number }) {
  const [downPayment, setDownPayment] = useState(0);
  const [duration, setDuration] = useState(48);
  const [taeg, setTaeg] = useState(DEFAULT_TAEG);

  const principal = Math.max(0, price - downPayment);
  const monthly = useMemo(
    () => monthlyPayment(principal, taeg, duration),
    [principal, taeg, duration]
  );
  const totalPaid = monthly * duration;
  const totalInterest = totalPaid - principal;

  return (
    <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur">
      <h3 className="text-lg font-semibold text-slate-900">Simulateur de financement</h3>
      <p className="mt-1 text-xs text-slate-500">
        Taux indicatif type crédit auto (TAEG). Les offres réelles dépendent des banques et de votre profil.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Prix du véhicule</label>
          <div className="mt-1 text-lg font-semibold text-slate-900">{formatPriceEUR(price)}</div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Apport (€)</label>
          <input
            type="number"
            min={0}
            max={price}
            step={500}
            value={downPayment || ""}
            onChange={(e) => setDownPayment(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Durée (mois)</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300/60"
          >
            {DURATIONS.map((m) => (
              <option key={m} value={m}>
                {m} mois ({m / 12} an{m > 12 ? "s" : ""})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Taux annuel (TAEG indicatif) %
          </label>
          <div className="mt-1 flex items-center gap-2">
            <input
              type="range"
              min={MIN_TAEG}
              max={MAX_TAEG}
              step={0.1}
              value={taeg}
              onChange={(e) => setTaeg(Number(e.target.value))}
              className="flex-1 accent-sky-600"
            />
            <span className="w-12 text-right text-sm font-medium text-slate-700">{taeg.toFixed(1)} %</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Ordre de grandeur : 5–8 % selon les banques et la durée
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50/50 p-4">
        <div className="text-sm text-slate-600">Mensualité estimée</div>
        <div className="mt-1 text-2xl font-bold text-sky-800">
          {formatPriceEUR(Math.round(monthly))}
          <span className="text-base font-normal text-slate-600"> / mois</span>
        </div>
        {totalInterest > 0 && (
          <div className="mt-2 text-xs text-slate-500">
            Coût total du crédit : {formatPriceEUR(Math.round(totalInterest))} d’intérêts
            (total remboursé : {formatPriceEUR(Math.round(totalPaid))})
          </div>
        )}
      </div>
    </div>
  );
}
