"use client";

import { useState } from "react";

const SPONSOR_OPTIONS = [
  { duration: "7", days: 7, price: 8, priceCents: 800 },
  { duration: "20", days: 20, price: 15, priceCents: 1500 },
  { duration: "30", days: 30, price: 20, priceCents: 2000 },
] as const;

export function SponsorButton({ 
  manageToken, 
  isSponsored, 
  sponsoredUntil 
}: { 
  manageToken: string; 
  isSponsored: boolean;
  sponsoredUntil: Date | null;
}) {
  const [busy, setBusy] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>("30");
  const [message, setMessage] = useState<string | null>(null);

  // Vérifier si le sponsoring est encore actif
  const now = new Date();
  const isCurrentlySponsored = isSponsored && 
    sponsoredUntil && 
    new Date(sponsoredUntil) > now;

  async function startSponsorCheckout(duration: string) {
    setBusy(true);
    setMessage(null);
    
    const res = await fetch("/api/sponsor/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ manageToken, duration }),
    });
    
    const body = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    setBusy(false);

    if (!res.ok || !body?.url) {
      const errorMsg = body?.error === "ALREADY_SPONSORED"
        ? "Cette annonce est déjà sponsorisée."
        : body?.error === "NOT_FOUND"
          ? "Annonce introuvable."
          : body?.error === "INVALID_DURATION"
            ? "Durée invalide."
            : "Paiement indisponible (configure Stripe dans .env).";
      setMessage(errorMsg);
      return;
    }
    
    window.location.href = body.url;
  }

  if (isCurrentlySponsored && sponsoredUntil) {
    const daysLeft = Math.ceil((new Date(sponsoredUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return (
      <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <div>
            <div className="font-semibold text-emerald-900">Annonce sponsorisée</div>
            <div className="text-sm text-emerald-700">
              Votre annonce apparaît en haut des résultats de recherche et sur la page d'accueil.
              {daysLeft > 0 && (
                <span className="ml-1 font-medium">({daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""})</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
      <h3 className="text-lg font-semibold text-slate-900">Mettre en avant votre annonce (optionnel)</h3>
      <p className="mt-2 text-sm text-slate-600">
        Optionnel : Faites apparaître votre annonce en haut des résultats de recherche et sur la page d'accueil pour plus de visibilité.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        <li className="flex items-start gap-2">
          <span className="text-emerald-600">✓</span>
          <span>Affichage en haut des résultats de recherche</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-600">✓</span>
          <span>Section "Annonces en vedette" sur la page d'accueil</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-emerald-600">✓</span>
          <span>Badge "⭐ Partenaire" visible sur votre annonce</span>
        </li>
      </ul>

      <div className="mt-6 space-y-3">
        <div className="text-sm font-medium text-slate-700">Choisissez une durée :</div>
        {SPONSOR_OPTIONS.map((option) => (
          <button
            key={option.duration}
            onClick={() => startSponsorCheckout(option.duration)}
            disabled={busy}
            className={`w-full rounded-xl border-2 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60 disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedDuration === option.duration
                ? "border-sky-500 bg-sky-50"
                : "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">{option.days} jours</div>
                <div className="text-xs text-slate-600">Mise en avant pendant {option.days} jours</div>
              </div>
              <div className="text-lg font-bold text-sky-600">{option.price}€</div>
            </div>
          </button>
        ))}
      </div>

      {message && (
        <div className={`mt-4 rounded-lg p-3 text-sm ${
          message.includes("déjà") || message.includes("introuvable") || message.includes("invalide")
            ? "bg-amber-50 text-amber-800"
            : "bg-red-50 text-red-800"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
