"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { isSafeRedirectPath } from "@/lib/sanitize";
import { TurnstileWidget } from "@/app/_components/TurnstileWidget";

type LoginFormProps = {
  /** URL de redirection après connexion (ex. /sell). Doit être un chemin sûr (same-origin). */
  redirectTo?: string;
};

export function LoginForm({ redirectTo = "/account" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const safeRedirect = isSafeRedirectPath(redirectTo) ? redirectTo : "/account";
  const onTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const body: { email: string; password: string; turnstileToken?: string } = { email, password };
    if (turnstileToken) body.turnstileToken = turnstileToken;

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    setBusy(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error === "TURNSTILE_FAILED" ? "Vérification anti-robot échouée. Réessayez." : "Email ou mot de passe incorrect.");
      return;
    }

    router.push(safeRedirect);
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

      <TurnstileWidget onVerify={onTurnstileVerify} size="compact" />

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

