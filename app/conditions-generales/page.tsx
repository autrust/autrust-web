import Link from "next/link";

export const metadata = {
  title: "Conditions Générales | AuTrust",
  description:
    "Conditions générales d'utilisation et de vente de la plateforme AuTrust.",
};

export default function ConditionsGeneralesPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">
          Conditions Générales d'Utilisation et de Vente
        </h1>

        <p className="mt-6 text-slate-600">
          Contenu à venir.
        </p>

        <div className="mt-12">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-900 underline underline-offset-2"
          >
            Retour à l'accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
