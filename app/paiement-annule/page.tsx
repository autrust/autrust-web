import Link from "next/link";

export const metadata = {
  title: "Paiement annulé | AuTrust",
  description: "Le paiement a été annulé.",
};

export default function PaiementAnnulePage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Paiement annulé</h1>
      <p className="mt-3 text-slate-600">
        Le paiement a été annulé. Vous pouvez réessayer quand vous le souhaitez.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl border border-slate-200 bg-white px-5 py-3 font-medium text-slate-800 hover:bg-slate-50"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
