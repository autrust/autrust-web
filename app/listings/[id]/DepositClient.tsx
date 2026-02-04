"use client";

import { useState } from "react";

export function DepositClient({ listingId }: { listingId: string }) {
  const [amount, setAmount] = useState("500");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function pay() {
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(cents) || cents < 100) {
      setMessage("Montant invalide.");
      return;
    }
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/deposits/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ listingId, amountCents: cents }),
    });
    const body = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    setBusy(false);

    if (!res.ok || !body?.url) {
      if (body?.error === "BUYER_NOT_VERIFIED") setMessage("Ton compte doit être vérifié (email+téléphone+KYC).");
      else if (body?.error === "SELLER_NOT_READY") setMessage("Le vendeur n’est pas encore prêt à recevoir un acompte.");
      else if (body?.error === "STRIPE_NOT_CONFIGURED") setMessage("Stripe n’est pas configuré.");
      else setMessage("Impossible de créer le paiement.");
      return;
    }
    window.location.href = body.url;
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/75 p-5 shadow-sm backdrop-blur">
      <div className="text-sm font-semibold text-slate-900">Payer un acompte</div>
      <div className="mt-1 text-sm text-slate-600">
        Paiement sécurisé via Stripe (carte ou IBAN SEPA si disponible).
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-sm text-slate-700">Montant (€)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm"
          />
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={pay}
          className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {busy ? "Ouverture..." : "Payer"}
        </button>
      </div>
      {message ? <div className="mt-3 text-sm text-slate-700">{message}</div> : null}
    </div>
  );
}

