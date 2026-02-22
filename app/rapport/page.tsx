"use client";

import { useState } from "react";
import Link from "next/link";

export default function RapportPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vin, setVin] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vin: vin.trim() || undefined,
          make: make.trim() || undefined,
          model: model.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !data.url) {
        setError(
          data.error === "STRIPE_NOT_CONFIGURED"
            ? "Paiement indisponible (configurez Stripe dans .env)."
            : "Impossible de créer le paiement."
        );
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-semibold text-slate-900">Rapport CarVertical — 15€</h1>
      <p className="mt-3 text-slate-600">
        Le rapport est fourni par CarVertical (prestataire tiers). Les conditions sont consultables sur leur site.
      </p>
      <p className="mt-2">
        <a
          href="https://www.carvertical.com/legal/terms-and-conditions"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-sky-600 hover:underline"
        >
          Conditions CarVertical →
        </a>
      </p>

      <form onSubmit={pay} className="mt-6 space-y-4">
        <div>
          <label htmlFor="rapport-vin" className="block text-sm font-medium text-slate-700">
            VIN (optionnel)
          </label>
          <input
            id="rapport-vin"
            type="text"
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            placeholder="Ex: WVWZZZ3CZWE123456"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="rapport-make" className="block text-sm font-medium text-slate-700">
            Marque (optionnel)
          </label>
          <input
            id="rapport-make"
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Ex: Volkswagen"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="rapport-model" className="block text-sm font-medium text-slate-700">
            Modèle (optionnel)
          </label>
          <input
            id="rapport-model"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Ex: Golf"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="rapport-email" className="block text-sm font-medium text-slate-700">
            Email (optionnel, pré-remplit Stripe)
          </label>
          <input
            id="rapport-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
          />
        </div>
        <div>
          <label htmlFor="rapport-phone" className="block text-sm font-medium text-slate-700">
            Téléphone (optionnel)
          </label>
          <input
            id="rapport-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: 0494123456"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="mt-4 w-full rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {busy ? "Redirection vers le paiement…" : "Acheter le rapport — 15€"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <p className="mt-6 text-center">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
          ← Retour à l&apos;accueil
        </Link>
      </p>
    </main>
  );
}
