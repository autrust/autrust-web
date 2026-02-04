import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SellSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string }>;
}) {
  const sp = await searchParams;
  const id = sp.id;
  const token = sp.token;

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold">Annonce publiée</h1>
        <p className="mt-2 text-slate-600">
          Tu peux maintenant ajouter un rapport d’historique (payé par le vendeur).
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {id ? (
            <Link
              href={`/listings/${id}`}
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 font-medium text-slate-900 hover:bg-slate-50"
            >
              Voir l’annonce
            </Link>
          ) : null}

          {token ? (
            <Link
              href={`/sell/manage/${token}`}
              className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500"
            >
              Ajouter un rapport (vendeur)
            </Link>
          ) : null}
        </div>

        {token ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Lien vendeur à conserver:{" "}
            <span className="font-mono break-all">{`/sell/manage/${token}`}</span>
          </div>
        ) : null}
      </div>
    </main>
  );
}

