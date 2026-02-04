"use client";

import { useState } from "react";

export function KycStartClient() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/kyc/identity/start", { method: "POST" });
    const body = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    setBusy(false);
    if (!res.ok || !body?.url) {
      if (body?.error === "STRIPE_NOT_CONFIGURED") setMessage("Stripe n’est pas configuré (STRIPE_SECRET_KEY).");
      else if (body?.error === "MISSING_EMAIL_OR_PHONE_VERIFICATION") setMessage("Valide d’abord ton email et ton téléphone.");
      else setMessage("Impossible de démarrer le KYC.");
      return;
    }
    window.location.href = body.url;
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={busy}
        onClick={start}
        className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
      >
        {busy ? "Ouverture..." : "Démarrer la vérification (Stripe)"}
      </button>
      {message ? <div className="mt-2 text-xs text-slate-600">{message}</div> : null}
    </div>
  );
}

