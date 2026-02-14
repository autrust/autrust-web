import { Suspense } from "react";
import { AuthTabs } from "@/app/auth/AuthTabs";

export const metadata = {
  title: "Connexion",
  description: "Crée un compte ou connecte-toi pour déposer une annonce ou payer un acompte.",
};

export default function AuthPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Connexion</h1>
        <p className="mt-2 text-slate-600">
          Crée un compte ou connecte-toi pour vendre, sauvegarder des recherches ou payer un acompte.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          AuTrust vérifie chaque vendeur pour garantir un environnement fiable.
        </p>
        <Suspense fallback={<div className="mt-6 h-64 rounded-3xl border border-slate-200/70 bg-white/75 animate-pulse" />}>
          <AuthTabs />
        </Suspense>
      </div>
    </main>
  );
}
