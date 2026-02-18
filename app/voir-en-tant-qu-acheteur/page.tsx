import Link from "next/link";

export const metadata = {
  title: "Voir en tant qu'acheteur",
  description: "Consulter le site comme un acheteur : annonces, parcours, pages d'information.",
};

export default function VoirEnTantQuAcheteurPage() {
  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Voir en tant qu&apos;acheteur
        </h1>
        <p className="mt-2 text-slate-600">
          Cliquez sur les liens ci-dessous pour découvrir ce qu&apos;un acheteur
          voit sur AuTrust. Les pages s&apos;ouvrent comme pour un visiteur qui
          cherche un véhicule.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/"
            className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30"
          >
            <span className="text-lg font-semibold text-slate-900">
              Page d&apos;accueil
            </span>
            <span className="mt-1 text-sm text-slate-600">
              Premier écran, présentation et CTA vers les annonces
            </span>
          </Link>

          <Link
            href="/listings"
            className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30"
          >
            <span className="text-lg font-semibold text-slate-900">
              Voir les annonces
            </span>
            <span className="mt-1 text-sm text-slate-600">
              Recherche et liste des véhicules (filtres, cartes)
            </span>
          </Link>

          <Link
            href="/comment-ca-marche"
            className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30"
          >
            <span className="text-lg font-semibold text-slate-900">
              Comment ça marche
            </span>
            <span className="mt-1 text-sm text-slate-600">
              Étapes achat, sécurité, acompte
            </span>
          </Link>

          <Link
            href="/securite-verification"
            className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30"
          >
            <span className="text-lg font-semibold text-slate-900">
              Sécurité & vérification
            </span>
            <span className="mt-1 text-sm text-slate-600">
              Vérifications véhicule et vendeur
            </span>
          </Link>

          <Link
            href="/pourquoi-autrust"
            className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30"
          >
            <span className="text-lg font-semibold text-slate-900">
              Pourquoi AuTrust
            </span>
            <span className="mt-1 text-sm text-slate-600">
              À propos, confiance, presse
            </span>
          </Link>

          <Link
            href="/tarifs"
            className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:bg-sky-50/30"
          >
            <span className="text-lg font-semibold text-slate-900">
              Tarifs (pro)
            </span>
            <span className="mt-1 text-sm text-slate-600">
              Packs professionnels
            </span>
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          Une fois sur une annonce, vous verrez la fiche véhicule comme un
          acheteur (description, photos, contact, etc.).
        </p>

        <div className="mt-6">
          <Link
            href="/account"
            className="text-sm text-slate-600 hover:text-sky-600"
          >
            ← Retour à Mon compte
          </Link>
        </div>
      </div>
    </main>
  );
}
