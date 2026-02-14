"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RegisterFormProps = {
  /** URL de redirection après inscription (ex. /sell). Doit commencer par /. */
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

  const safeRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/account";

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

    setStep("profile");
  }

  async function chooseProfile(profileType: "PARTICULIER" | "CONCESSIONNAIRE") {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/profile-type", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profileType }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Erreur lors de l’enregistrement. Tu pourras choisir plus tard dans ton compte.");
      return;
    }
    router.push(safeRedirect);
    router.refresh();
  }

  if (step === "profile") {
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
            onClick={() => chooseProfile("CONCESSIONNAIRE")}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-5 text-slate-800 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/50 focus:outline-none focus:ring-2 focus:ring-sky-300/60 disabled:opacity-60"
          >
            <span className="text-2xl" aria-hidden>🏪</span>
            <span className="font-medium">Professionnel</span>
            <span className="text-xs text-slate-500">Concessionnaire, garage, pro du véhicule</span>
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

