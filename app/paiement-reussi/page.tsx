import Link from "next/link";

export const metadata = {
  title: "Paiement réussi | AuTrust",
  description: "Votre paiement a bien été enregistré.",
};

export default async function PaiementReussiPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Paiement réussi ✅</h1>
      <p className="mt-3 text-slate-600">Merci ! Nous confirmons votre paiement.</p>
      <p className="mt-2 text-sm text-slate-500">Session : {session_id ?? "—"}</p>
      <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
        Vous recevrez votre rapport CarVertical par email sous 24 h.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        <Link href="/legal/report-history" className="text-sky-600 hover:underline">
          Conditions applicables au rapport d&apos;historique
        </Link>
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-sky-600 px-5 py-3 font-medium text-white hover:bg-sky-500"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
