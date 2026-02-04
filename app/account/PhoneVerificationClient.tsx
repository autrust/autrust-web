"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PhoneVerificationClient() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/auth/phone/send-otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setBusy(false);
    if (!res.ok) {
      setMessage("Impossible d’envoyer le code.");
      return;
    }
    setMessage("Code envoyé (en dev: visible dans les logs).");
  }

  async function verify() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/auth/phone/verify-otp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    setBusy(false);
    if (!res.ok) {
      setMessage("Code invalide.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-2 grid gap-2">
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Ex: +32 4 123 45 67"
        className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || !phone.trim()}
          onClick={send}
          className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        >
          {busy ? "Envoi..." : "Envoyer le code SMS"}
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code SMS"
          className="w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm"
        />
        <button
          type="button"
          disabled={busy || !phone.trim() || !code.trim()}
          onClick={verify}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {busy ? "Vérification..." : "Vérifier"}
        </button>
      </div>
      {message ? <div className="text-xs text-slate-600">{message}</div> : null}
    </div>
  );
}

