import Link from "next/link";
import { LoginForm } from "@/app/login/LoginForm";

export const metadata = {
  title: "Connexion",
};

export default function LoginPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Connexion</h1>
        <p className="mt-2 text-slate-600">
          Connecte-toi pour vendre ou payer un acompte.
        </p>

        <div className="mt-6 rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
          <LoginForm />
          <div className="mt-4 text-sm text-slate-600">
            Pas encore de compte ?{" "}
            <Link className="text-sky-700 underline" href="/register">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

