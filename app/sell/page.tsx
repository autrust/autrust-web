import { SellForm } from "@/app/sell/SellForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const metadata = {
  title: "Déposer une annonce",
};

export const dynamic = "force-dynamic";

export default async function SellPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold">Publier sur AuTrust</h1>
          <p className="mt-3 text-slate-600">
            Pour protéger les acheteurs et éviter les fraudes, seuls les comptes identifiés peuvent publier un véhicule.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            AuTrust vérifie chaque vendeur pour garantir un environnement fiable.
          </p>
          <div className="mt-8">
            <Link
              href="/auth?next=/sell"
              className="inline-block rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
            >
              Créer un compte ou se connecter
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { kyc: true },
  });
  if (!dbUser) {
    return (
      <main className="px-6 py-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold">Publier sur AuTrust</h1>
          <p className="mt-3 text-slate-600">
            Pour protéger les acheteurs et éviter les fraudes, seuls les comptes identifiés peuvent publier un véhicule.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            AuTrust vérifie chaque vendeur pour garantir un environnement fiable.
          </p>
          <div className="mt-8">
            <Link
              href="/auth?next=/sell"
              className="inline-block rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
            >
              Créer un compte ou se connecter
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Déposer une annonce</h1>
        <p className="mt-2 text-slate-600">
          Remplissez le formulaire : l’annonce sera enregistrée en <strong>brouillon</strong>. Une fois votre email et votre téléphone vérifiés dans Mon compte, vous pourrez la <strong>publier</strong> depuis Mes annonces pour la rendre visible à tous.
        </p>

        <div className="mt-6 rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
          <SellForm />
        </div>
      </div>
    </main>
  );
}

