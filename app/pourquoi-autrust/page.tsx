import Link from "next/link";

export const metadata = {
  title: "Pourquoi AuTrust | AuTrust",
  description:
    "Pourquoi AuTrust existe : une marketplace auto pensée pour la confiance, la sécurité et la transparence — vendeurs vérifiés, acompte sécurisé, garages partenaires.",
};

export default function PourquoiAutrustPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-white">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:pt-20">
        <div className="rounded-3xl border border-slate-200 bg-white/70 backdrop-blur-md p-8 sm:p-12 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700">
            Confiance • Sécurité • Transparence
          </div>

          <h1 className="mt-5 text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900">
            La nouvelle norme du marché automobile
          </h1>

          <p className="mt-4 max-w-3xl text-base sm:text-lg text-slate-600">
            AuTrust a été créé pour corriger les failles des marketplaces
            traditionnelles : faux vendeurs, manque de transparence, aucune
            protection financière. Ici, la confiance n'est pas un slogan — c'est
            une fonctionnalité.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-white font-medium hover:bg-slate-800 transition"
            >
              Explorer les véhicules
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-900 hover:bg-slate-50 transition"
            >
              Je suis le vendeur
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            <Chip>Vendeurs vérifiés</Chip>
            <Chip>Acompte sécurisé</Chip>
            <Chip>Historique / VIN</Chip>
            <Chip>Garages partenaires</Chip>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <Block
            title="Le problème aujourd'hui"
            subtitle="Ce qui abîme la confiance sur les plateformes classiques."
            tone="danger"
          >
            <ul className="mt-4 space-y-3 text-slate-700">
              <li className="flex gap-3">
                <span className="mt-0.5 text-red-500" aria-hidden>✕</span>
                <span>
                  <span className="font-medium text-slate-900">Faux vendeurs</span>{" "}
                  et profils anonymes difficiles à vérifier.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-red-500" aria-hidden>✕</span>
                <span>
                  <span className="font-medium text-slate-900">Infos floues</span>{" "}
                  : historique incomplet, VIN absent, incohérences.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-red-500" aria-hidden>✕</span>
                <span>
                  <span className="font-medium text-slate-900">Aucune protection</span>{" "}
                  sur les paiements / réservations.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-red-500" aria-hidden>✕</span>
                <span>
                  <span className="font-medium text-slate-900">Perte de temps</span>{" "}
                  : demandes non sérieuses, rendez-vous fantômes.
                </span>
              </li>
            </ul>
          </Block>

          <Block
            title="La solution AuTrust"
            subtitle="Une marketplace pensée pour réduire les risques."
            tone="success"
          >
            <ul className="mt-4 space-y-3 text-slate-700">
              <li className="flex gap-3">
                <span className="mt-0.5 text-emerald-600" aria-hidden>✓</span>
                <span>
                  <span className="font-medium text-slate-900">Vendeurs vérifiés</span>{" "}
                  : inscription obligatoire, profils identifiés.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-emerald-600" aria-hidden>✓</span>
                <span>
                  <span className="font-medium text-slate-900">Transparence</span>{" "}
                  : VIN, infos claires, historique disponible.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-emerald-600" aria-hidden>✓</span>
                <span>
                  <span className="font-medium text-slate-900">Acompte sécurisé</span>{" "}
                  : réservation protégée jusqu'à validation.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-emerald-600" aria-hidden>✓</span>
                <span>
                  <span className="font-medium text-slate-900">Garages partenaires</span>{" "}
                  : pros certifiés pour une confiance renforcée.
                </span>
              </li>
            </ul>
          </Block>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">
            Les 3 piliers AuTrust
          </h2>
          <p className="mt-2 text-slate-600 max-w-3xl">
            AuTrust ne cherche pas à être la plus grande marketplace. Notre
            objectif est simple : être la plus fiable.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Pillar
              title="Confiance"
              text="Des vendeurs identifiés et des professionnels certifiés pour limiter les arnaques."
            />
            <Pillar
              title="Sécurité"
              text="Un acompte sécurisé pour réserver un véhicule sans stress et réduire les demandes non sérieuses."
            />
            <Pillar
              title="Transparence"
              text="VIN, informations claires et historique véhicule pour prendre une décision éclairée."
            />
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/securite-verification"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-900 hover:bg-slate-50 transition"
            >
              Voir Sécurité & Vérification
            </Link>
            <Link
              href="/comment-ca-marche"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-white font-medium shadow-sm hover:bg-emerald-700 transition"
            >
              Voir Comment ça marche
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Rejoignez la nouvelle norme.
            </h2>
            <p className="mt-1 text-slate-600">
              Achetez et vendez en toute confiance avec AuTrust.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-900 hover:bg-white transition"
            >
              Créer un compte
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-white font-medium hover:bg-slate-800 transition"
            >
              Déposer une annonce
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
      {children}
    </span>
  );
}

function Block({
  title,
  subtitle,
  tone,
  children,
}: {
  title: string;
  subtitle: string;
  tone: "danger" | "success";
  children: React.ReactNode;
}) {
  const badge =
    tone === "danger"
      ? "bg-red-600/10 text-red-700 border-red-200"
      : "bg-emerald-600/10 text-emerald-700 border-emerald-200";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-slate-600">{subtitle}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-medium ${badge}`}>
          {tone === "danger" ? "Problème" : "Solution"}
        </span>
      </div>
      {children}
    </div>
  );
}

function Pillar({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm hover:shadow-md transition">
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
