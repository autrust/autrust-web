import Link from "next/link";

export const metadata = {
  title: "Tarifs | AuTrust",
  description:
    "Tarifs particuliers (gratuit + options premium) et offres professionnelles : Start, Pro, Elite, Enterprise.",
};

const PARTICULIER_OPTIONS = [
  { label: "⭐ Top recherche 7 jours", price: "9,99 €" },
  { label: "⭐ Top recherche 30 jours", price: "19,99 €" },
  { label: "⭐ Boost express 48 h", price: "4,99 €" },
] as const;

const PLANS = [
  {
    name: "Start",
    price: 49,
    range: "Jusqu'à 14 véhicules",
    description: "Idéal pour démarrer",
    accent: "emerald", // 🟢
  },
  {
    name: "Pro",
    price: 189,
    range: "15 – 30 véhicules",
    description: "Pour développer votre activité",
    accent: "violet", // 🟣
  },
  {
    name: "Elite",
    price: 289,
    range: "31 – 120 véhicules",
    description: "Volume et visibilité maximale",
    accent: "amber", // 🟡
  },
  {
    name: "Enterprise",
    price: 489,
    range: "120+ véhicules",
    description: "Pour les grands parcs",
    accent: "slate", // ⚫
  },
] as const;

// Couleurs en style inline pour garantir l'affichage (Pro violet, Enterprise slate)
const PLAN_COLORS: Record<string, { border: string; dot: string; button: string }> = {
  emerald: { border: "#6ee7b7", dot: "#10b981", button: "#059669" },
  violet: { border: "#c4b5fd", dot: "#8b5cf6", button: "#7c3aed" },
  amber: { border: "#fcd34d", dot: "#f59e0b", button: "#d97706" },
  slate: { border: "#94a3b8", dot: "#475569", button: "#334155" },
};

export default function TarifsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Tarifs
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-slate-600">
            Particuliers : annonces gratuites + options de visibilité. Professionnels : packs selon le nombre de véhicules.
          </p>
        </div>

        {/* Particuliers */}
        <div className="mt-12 rounded-3xl border-2 border-sky-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Particuliers</h2>
          <p className="mt-2 text-slate-600">
            <strong>Gratuit</strong> pour toute annonce. Options premium facultatives pour plus de visibilité.
          </p>
          <ul className="mt-4 space-y-2 text-slate-700">
            {PARTICULIER_OPTIONS.map((opt) => (
              <li key={opt.label} className="flex items-center justify-between gap-4">
                <span>{opt.label}</span>
                <span className="font-semibold text-sky-700">{opt.price}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
            <strong>CarVertical</strong> (vérification historique véhicule) : le vendeur choisit de l’inclure ou l’acheteur peut le payer au prix de <strong>10 €</strong>.
          </div>
          <div className="mt-6">
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-white font-medium hover:bg-sky-500 transition"
            >
              Déposer une annonce (gratuit)
            </Link>
          </div>
        </div>

        {/* Professionnels */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Tarifs professionnels</h2>
          <p className="mt-2 text-slate-600">
            Choisissez l’offre adaptée au nombre de véhicules que vous souhaitez publier.
          </p>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const colors = PLAN_COLORS[plan.accent] ?? PLAN_COLORS.slate;
            return (
              <div
                key={plan.name}
                className="rounded-3xl border-2 bg-white p-6 shadow-sm transition"
                style={{ borderColor: colors.border }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: colors.dot }}
                  />
                  <span className="font-semibold text-slate-900">{plan.name}</span>
                </div>
                <div className="mt-2 text-sm text-slate-600">{plan.range}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">{plan.price} €</span>
                  <span className="text-slate-600">/mois</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
                <div className="mt-6">
                  <Link
                    href="/auth"
                    className="inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                    style={{ backgroundColor: colors.button }}
                  >
                    Choisir
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8 text-center">
          <p className="text-slate-700">
            Vous hésitez ?{" "}
            <Link href="/contact" className="font-medium text-sky-600 hover:text-sky-700 underline underline-offset-2">
              Contactez-nous
            </Link>{" "}
            pour une offre personnalisée.
          </p>
          <div className="mt-4">
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-white font-medium hover:bg-emerald-500 transition"
            >
              Déposer une annonce
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
