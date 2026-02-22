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
        <h1 className="text-3xl font-bold">Annonce enregistrée en brouillon</h1>
        <p className="mt-2 text-slate-600">
          Votre annonce est enregistrée. Elle ne sera visible par personne tant que vous ne l'aurez pas publiée.
        </p>
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Pour la publier et la rendre visible à tous :</p>
          <ol className="mt-2 list-decimal list-inside space-y-1">
            <li>Vérifiez votre <strong>email</strong> et votre <strong>téléphone</strong> dans <Link href="/account" className="underline">Mon compte</Link>.</li>
            <li>Allez dans <Link href="/account#mes-annonces" className="underline">Mes annonces</Link> et cliquez sur &quot;Publier l'annonce&quot; pour cette annonce.</li>
          </ol>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {id ? (
            <Link
              href={`/listings/${id}`}
              className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 font-medium text-slate-900 hover:bg-slate-50"
            >
              Voir le brouillon
            </Link>
          ) : null}

          {token ? (
            <Link
              href={`/sell/manage/${token}`}
              className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 font-medium text-sky-800 hover:bg-sky-100"
            >
              Compléter / modifier l'annonce
            </Link>
          ) : null}

          <Link
            href="/account#mes-annonces"
            className="rounded-xl bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500"
          >
            Mes annonces
          </Link>
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
