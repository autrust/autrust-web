"use client";

import { useState } from "react";
import { isProPromoActive, PROMO_LANCEMENT_PRO } from "@/lib/constants";

type PlanId = "START" | "PRO" | "ELITE" | "ENTERPRISE";

const PLANS: { id: PlanId; name: string; price: number; range: string; accent: string }[] = [
  { id: "START", name: "Start", price: 49, range: "1 – 14 véhicules", accent: "emerald" },
  { id: "PRO", name: "Pro", price: 189, range: "15 – 30 véhicules", accent: "violet" },
  { id: "ELITE", name: "Elite", price: 289, range: "31 – 120 véhicules", accent: "amber" },
  { id: "ENTERPRISE", name: "Enterprise", price: 489, range: "120+ véhicules", accent: "slate" },
];

const ACCENT_STYLES: Record<string, { border: string; borderSelected: string; bgSelected: string; dot: string }> = {
  emerald: {
    border: "border-emerald-300",
    borderSelected: "border-emerald-500",
    bgSelected: "bg-emerald-50",
    dot: "bg-emerald-500",
  },
  violet: {
    border: "border-violet-300",
    borderSelected: "border-violet-500",
    bgSelected: "bg-violet-50",
    dot: "bg-violet-500",
  },
  amber: {
    border: "border-amber-300",
    borderSelected: "border-amber-500",
    bgSelected: "bg-amber-50",
    dot: "bg-amber-500",
  },
  slate: {
    border: "border-slate-400",
    borderSelected: "border-slate-600",
    bgSelected: "bg-slate-100",
    dot: "bg-slate-600",
  },
};

function getPlanLimits(plan: PlanId) {
  switch (plan) {
    case "START":
      return { min: 1, max: 14 };
    case "PRO":
      return { min: 15, max: 30 };
    case "ELITE":
      return { min: 31, max: 120 };
    case "ENTERPRISE":
      return { min: 120, max: 1000 };
  }
}

function planLabel(plan: PlanId | null): string {
  if (!plan) return "—";
  return PLANS.find((p) => p.id === plan)?.name ?? plan;
}

function getPlanOrder(plan: PlanId | null): number {
  if (!plan) return 0;
  const order: Record<PlanId, number> = {
    START: 1,
    PRO: 2,
    ELITE: 3,
    ENTERPRISE: 4,
  };
  return order[plan] ?? 0;
}

type Props = {
  currentPlan: PlanId | null;
  currentMaxListings: number | null;
  pendingPlanChange?: PlanId | null;
};

export function ChangePlanClient({ currentPlan, currentMaxListings, pendingPlanChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(currentPlan);
  const [maxListings, setMaxListings] = useState(currentMaxListings?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limits = selectedPlan ? getPlanLimits(selectedPlan) : null;
  const listingsNum = maxListings.trim() ? Number.parseInt(maxListings, 10) : null;
  const isValid =
    selectedPlan &&
    (!maxListings.trim() || (limits && listingsNum !== null && !Number.isNaN(listingsNum) && listingsNum >= limits.min && listingsNum <= limits.max));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !selectedPlan) return;
    setBusy(true);
    setError(null);

    const payload: { newPlan: PlanId; maxListings?: number } = {
      newPlan: selectedPlan,
    };
    if (listingsNum !== null && !Number.isNaN(listingsNum)) {
      payload.maxListings = listingsNum;
    }

    const res = await fetch("/api/plans/change", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => null)) as {
      error?: string;
      message?: string;
      url?: string;
      sessionId?: string;
      ok?: boolean;
      immediate?: boolean;
      pending?: boolean;
    } | null;
    setBusy(false);

    if (!res.ok) {
      setError(body?.message ?? "Erreur lors de la mise à jour.");
      return;
    }

    // Si upgrade avec paiement Stripe
    if (body?.url) {
      window.location.href = body.url;
      return;
    }

    // Si changement immédiat (pas de paiement) ou downgrade (en attente)
    setEditing(false);
    setMaxListings(String(listingsNum));
    window.location.reload();
  }

  if (!editing) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
        <div className="text-xs text-slate-500">Pack professionnel</div>
        {isProPromoActive() && (
          <p className="mt-1 text-xs text-amber-800">Gratuit jusqu'au 1er juil. 2026 (sauf rapport CarVertical 14,99 €)</p>
        )}
        <div className="mt-1 font-medium text-slate-900">
          {planLabel(currentPlan)}
          {currentMaxListings != null ? (
            <span className="text-slate-600 font-normal">
              {" "}
              — {currentMaxListings} annonce(s) autorisée(s)
            </span>
          ) : null}
        </div>
        {pendingPlanChange && pendingPlanChange !== currentPlan && (
          <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Changement prévu vers <strong>{planLabel(pendingPlanChange)}</strong> le mois prochain
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setSelectedPlan(currentPlan);
            setMaxListings(currentMaxListings?.toString() ?? "");
            setError(null);
          }}
          className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-100"
        >
          Changer de pack
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
      <div className="text-sm font-semibold text-slate-900">Changer de pack</div>
      {isProPromoActive() && (
        <p className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
          {PROMO_LANCEMENT_PRO}
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-3 space-y-4">
        <div>
          <label className="text-xs text-slate-600">Pack</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {PLANS.map((plan) => {
              const style = ACCENT_STYLES[plan.accent] ?? ACCENT_STYLES.slate;
              const isSelected = selectedPlan === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => {
                    setSelectedPlan(plan.id);
                    const lim = getPlanLimits(plan.id);
                    setMaxListings((prev) => {
                      const n = Number.parseInt(prev, 10);
                      if (Number.isNaN(n) || n < lim.min || n > lim.max) return String(lim.min);
                      return prev;
                    });
                  }}
                  className={`rounded-xl border-2 p-3 text-left text-sm transition ${
                    isSelected ? `${style.borderSelected} ${style.bgSelected}` : `${style.border} bg-white hover:opacity-90`
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                    <span className="font-medium text-slate-900">{plan.name}</span>
                  </div>
                  <span className="mt-1 block text-xs text-slate-600">{plan.range}</span>
                </button>
              );
            })}
          </div>
        </div>
        {selectedPlan && (
          <div>
            <label className="text-xs text-slate-600">Nombre d&apos;annonces (1 véhicule = 1 annonce) — optionnel</label>
            <input
              type="number"
              min={getPlanLimits(selectedPlan).min}
              max={getPlanLimits(selectedPlan).max}
              value={maxListings}
              onChange={(e) => setMaxListings(e.target.value)}
              placeholder={`${getPlanLimits(selectedPlan).min}-${getPlanLimits(selectedPlan).max}`}
              className="mt-2 w-full max-w-[140px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60"
            />
            <p className="mt-1 text-xs text-slate-500">
              Optionnel : entre {getPlanLimits(selectedPlan).min} et {getPlanLimits(selectedPlan).max} pour le pack {planLabel(selectedPlan)}. Tu peux changer de pack sans spécifier le nombre d&apos;annonces.
            </p>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {selectedPlan && currentPlan && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            {getPlanOrder(selectedPlan) > getPlanOrder(currentPlan) ? (
              <>
                <strong>Upgrade</strong>{" "}
                {isProPromoActive()
                  ? ": gratuit pendant la promo, le changement sera actif immédiatement."
                  : `: vous paierez la différence (${PLANS.find((p) => p.id === selectedPlan)?.price ?? 0} €/mois - ${PLANS.find((p) => p.id === currentPlan)?.price ?? 0} €/mois) via Stripe et le changement sera actif immédiatement.`}
              </>
            ) : getPlanOrder(selectedPlan) < getPlanOrder(currentPlan) ? (
              <>
                <strong>Downgrade</strong> : le changement prendra effet le mois prochain (pas de paiement).
              </>
            ) : (
              <>Même plan sélectionné.</>
            )}
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={busy || !isValid}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {busy ? "Enregistrement..." : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            disabled={busy}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
