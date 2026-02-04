"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setBusy(false);
    if (!res.ok) {
      setError("Email ou mot de passe incorrect.");
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
      </div>

      {error ? <div className="text-sm text-red-700">{error}</div> : null}

      <button
        disabled={busy}
        className="rounded-xl bg-sky-600 px-5 py-3 font-medium text-white hover:bg-sky-500 disabled:opacity-60"
        type="submit"
      >
        {busy ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

