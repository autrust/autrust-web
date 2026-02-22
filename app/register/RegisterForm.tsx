"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { isSafeRedirectPath } from "@/lib/sanitize";
import { TurnstileWidget } from "@/app/_components/TurnstileWidget";

type RegisterFormProps = {
  /** URL de redirection après inscription (ex. /sell). Doit être un chemin sûr (same-origin). */
  redirectTo?: string;
};

type Step = "form" | "profile";

export function RegisterForm({ redirectTo = "/account" }: RegisterFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVatForm, setShowVatForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showListingsForm, setShowListingsForm] = useState(false);
  const [vatNumber, setVatNumber] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"START" | "PRO" | "ELITE" | "ENTERPRISE" | null>(null);
  const [maxListings, setMaxListings] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const safeRedirect = isSafeRedirectPath(redirectTo) ? redirectTo : "/account";
  const onTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const body: { email: string; password: string; turnstileToken?: string } = { email, password };
    if (turnstileToken) body.turnstileToken = turnstileToken;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (data?.error === "TURNSTILE_FAILED") setError("Vérification anti-robot échouée. Réessayez.");
      else if (data?.error === "EMAIL_ALREADY_USED") setError("Cet email est déjà utilisé.");
      else if (data?.error === "WEAK_PASSWORD") setError("Mot de passe trop faible (8 caractères min).");
      else setError("Inscription impossible.");
      return;
    }

    setStep("profile");
  }

  function getPlanLimits(plan: "START" | "PRO" | "ELITE" | "ENTERPRISE") {
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

  async function chooseProfile(profileType: "PARTICULIER" | "CONCESSIONNAIRE", vat?: string, plan?: "START" | "PRO" | "ELITE" | "ENTERPRISE", listings?: number) {
    setBusy(true);
    setError(null);
    const payload: { profileType: "PARTICULIER" | "CONCESSIONNAIRE"; vatNumber?: string; selectedPlan?: "START" | "PRO" | "ELITE" | "ENTERPRISE"; maxListings?: number } = {
      profileType,
    };
    if (profileType === "CONCESSIONNAIRE") {
      if (vat?.trim()) payload.vatNumber = vat.trim();
      if (plan) payload.selectedPlan = plan;
      if (listings !== undefined) payload.maxListings = listings;
    }
    const res = await fetch("/api/auth/profile-type", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string; message?: string } | null;
      const errorMsg = body?.message || "Erreur lors de l'enregistrement. Tu pourras choisir plus tard dans ton compte.";
      setError(errorMsg);
      return;
    }
    router.push(safeRedirect);
    router.refresh();
  }

  if (step === "profile") {
    if (showListingsForm && selectedPlan) {
      const limits = getPlanLimits(selectedPlan);
      const planNames: Record<"START" | "PRO" | "ELITE" | "ENTERPRISE", string> = {
        START: "Start",
        PRO: "Pro",
        ELITE: "Elite",
        ENTERPRISE: "Enterprise",
      };
      const listingsNum = Number.parseInt(maxListings, 10);
      const isValid = !Number.isNaN(listingsNum) && listingsNum >= limits.min && listingsNum <= limits.max;
      return (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-medium text-slate-700">
            Pack {planNames[selectedPlan]} — Combien d'annonces veux-tu publier ?
          </p>
          <p className="text-xs text-slate-600">
            Tu peux publier entre {limits.min} et {limits.max} annonces avec ce pack (1 véhicule = 1 annonce).
          </p>
          <div>
            <label className="text-sm text-slate-600">Nombre d'annonces</label>
            <input
              type="number"
              min={limits.min}
              max={limits.max}
              value={maxListings}
              onChange={(e) => setMaxListings(e.target.value)}
              placeholder={`Entre ${limits.min} et ${limits.max}`}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
            {maxListings && !isValid && (
              <p className="mt-1 text-xs text-red-600">
                Le nombre doit être entre {limits.min} et {limits.max}.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || !isValid}
              onClick={() => isValid && selectedPlan && chooseProfile("CONCESSIONNAIRE", vatNumber, selectedPlan, listingsNum)}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {busy ? "Enregistrement..." : "Valider"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setShowListingsForm(false);
                setMaxListings("");
              }}
              className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Retour
            </button>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      );
    }
    if (showPlanForm) {
      const plans = [
        { id: "START" as const, name: "Start", price: 49, range: "Jusqu'à 14 véhicules", color: "emerald" },
        { id: "PRO" as const, name: "Pro", price: 189, range: "15 – 30 véhicules", color: "violet" },
        { id: "ELITE" as const, name: "Elite", price: 289, range: "31 – 120 véhicules", color: "amber" },
        { id: "ENTERPRISE" as const, name: "Enterprise", price: 489, range: "120+ véhicules", color: "slate" },
      ];
      return (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-medium text-slate-700">Choisis ton pack professionnel :</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const borderColor = plan.color === "emerald" ? "border-emerald-300" : plan.color === "violet" ? "border-violet-300" : plan.color === "amber" ? "border-amber-300" : "border-slate-400";
              const bgColor = plan.color === "emerald" ? "bg-emerald-50" : plan.color === "violet" ? "bg-violet-50" : plan.color === "amber" ? "bg-amber-50" : "bg-slate-50";
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition ${
                    isSelected ? `${borderColor} ${bgColor} ring-2 ring-offset-2` : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-semibold text-slate-900">{plan.name}</span>
                    <span className="text-lg font-bold text-slate-900">{plan.price}€</span>
                  </div>
                  <span className="text-xs text-slate-600">{plan.range}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || !selectedPlan}
              onClick={() => {
                if (selectedPlan) {
                  setShowPlanForm(false);
                  setShowListingsForm(true);
                }
              }}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Suivant
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowPlanForm(false)}
              className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Retour
            </button>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      );
    }
    if (showVatForm) {
      return (
        <div className="mt-6 space-y-4">
          <p className="text-sm font-medium text-slate-700">
            Profil professionnel — indique ton numéro de TVA (optionnel)
          </p>
          <div>
            <label className="text-sm text-slate-600">Numéro de TVA</label>
            <input
              type="text"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              placeholder="Ex: BE0123456789"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
            <p className="mt-1 text-xs text-slate-500">Tu pourras le modifier plus tard dans ton compte.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowPlanForm(true)}
              className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              Suivant
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowVatForm(false)}
              className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Retour
            </button>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      );
    }
    return (
      <div className="mt-6 space-y-4">
        <p className="text-sm font-medium text-slate-700">Choisis ton profil :</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => chooseProfile("PARTICULIER")}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-5 text-slate-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/50 focus:outline-none focus:ring-2 focus:ring-sky-300/60 disabled:opacity-60"
          >
            <span className="text-2xl" aria-hidden>👤</span>
            <span className="font-medium">Particulier</span>
            <span className="text-xs text-slate-500">Vendre ou acheter pour soi</span>
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setShowVatForm(true)}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-5 text-slate-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/50 focus:outline-none focus:ring-2 focus:ring-sky-300/60 disabled:opacity-60"
          >
            <span className="text-2xl" aria-hidden>🏪</span>
            <span className="font-medium">Professionnel</span>
            <span className="text-xs text-slate-500">Concessionnaire, garage, pro — numéro de TVA</span>
          </button>
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {busy ? <p className="text-sm text-slate-500">Enregistrement...</p> : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-3">
      <div>
        <label className="text-sm text-slate-700">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
        />
      </div>
      <div>
        <label className="text-sm text-slate-700">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
        />
        <div className="mt-1 text-xs text-slate-500">8 caractères minimum.</div>
      </div>

      <TurnstileWidget onVerify={onTurnstileVerify} size="compact" />

      {error ? <div className="text-sm text-red-700">{error}</div> : null}

      <button
        disabled={busy}
        className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
        type="submit"
      >
        {busy ? "Création..." : "Créer mon compte"}
      </button>
    </form>
  );
}
