import Link from "next/link";
import { RegisterForm } from "@/app/register/RegisterForm";

export const metadata = {
  title: "Créer un compte",
};

export default function RegisterPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold">Créer un compte</h1>
        <p className="mt-2 text-slate-600">Crée ton compte pour vendre ou payer un acompte.</p>

        <div className="mt-6 rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
          <RegisterForm />
          <div className="mt-4 text-sm text-slate-600">
            Déjà un compte ?{" "}
            <Link className="text-sky-700 underline" href="/login">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

