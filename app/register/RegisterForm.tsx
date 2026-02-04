"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setBusy(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      if (body?.error === "EMAIL_ALREADY_USED") setError("Cet email est déjà utilisé.");
      else if (body?.error === "WEAK_PASSWORD") setError("Mot de passe trop faible (8 caractères min).");
      else setError("Inscription impossible.");
      return;
    }

    router.push("/account");
    router.refresh();
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

