import Link from "next/link";

export const metadata = {
  title: "Sécurité & Vérification | AuTrust",
  description:
    "Découvrez comment AuTrust protège acheteurs et vendeurs grâce à la vérification des profils, l'acompte sécurisé et la transparence des véhicules.",
};

export default function SecuriteVerificationPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-white">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:pt-20">
        <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md p-8 sm:p-12 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700">
            Protection • Sécurité • Transparence
          </div>

          <h1 className="mt-5 text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900">
            Votre sécurité est notre priorité.
          </h1>

          <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-600">
            AuTrust met en place des mécanismes concrets pour protéger chaque
            transaction et réduire les fraudes sur le marché automobile.
          </p>

          <div className="mt-8 flex gap-3">
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-white font-medium shadow-sm hover:bg-emerald-700 transition"
            >
              Publier en toute sécurité
            </Link>
          </div>
        </div>
      </section>

      {/* Security Blocks */}
      <section className="mx-auto max-w-6xl px-4 pb-16 grid gap-6 md:grid-cols-2">
        <SecurityCard
          title="Vendeurs vérifiés"
          text="Chaque vendeur doit créer un compte identifié avant de publier. Cela réduit les faux profils et protège les acheteurs."
        />
        <SecurityCard
          title="Acompte sécurisé"
          text="Les acomptes sont protégés et conservés jusqu'à validation de la transaction. Moins de risques, plus de sérénité."
        />
        <SecurityCard
          title="Transparence véhicule"
          text="Le VIN peut être renseigné et vérifié. Les informations sont claires pour éviter les mauvaises surprises."
        />
        <SecurityCard
          title="Garages partenaires"
          text="Les professionnels certifiés AuTrust sont identifiés et contrôlés pour garantir un environnement fiable."
        />
      </section>

      {/* Why It Matters */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-8 sm:p-10">
          <h2 className="text-2xl font-semibold text-slate-900">
            Pourquoi c'est important ?
          </h2>

          <p className="mt-4 text-slate-600 max-w-3xl">
            Le marché automobile en ligne comporte des risques : faux vendeurs,
            véhicules endommagés dissimulés, paiements non sécurisés. AuTrust a
            été conçu pour corriger ces failles et instaurer une nouvelle norme
            de confiance.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/comment-ca-marche"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-900 hover:bg-white transition"
            >
              Voir comment ça marche
            </Link>
            <Link
              href="/listings"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-white font-medium hover:bg-slate-800 transition"
            >
              Explorer les véhicules
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SecurityCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
          />
        </svg>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-slate-600">{text}</p>
    </div>
  );
}
