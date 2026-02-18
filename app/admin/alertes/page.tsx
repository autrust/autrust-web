import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Alertes admin",
};

export default async function AdminAlertesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/alertes");
  if (!isAdmin(user)) redirect("/account?admin=verify_phone");

  const alertes = await prisma.adminAlert.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/account"
            className="text-sm text-slate-600 hover:text-sky-600"
          >
            ← Mon compte
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Alertes admin</h1>
        <p className="mt-2 text-slate-600">
          Particuliers ayant tenté de dépasser la limite d&apos;annonces (vente
          pro sans numéro de TVA).
        </p>

        <div className="mt-6 space-y-4">
          {alertes.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white/75 p-6 text-center text-slate-600">
              Aucune alerte pour le moment.
            </div>
          ) : (
            alertes.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-amber-900">
                    {a.type === "PARTICULIER_TOO_MANY_LISTINGS"
                      ? "Particulier : trop d'annonces"
                      : a.type}
                  </span>
                  <time className="text-xs text-slate-500">
                    {a.createdAt.toLocaleDateString("fr-BE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                <p className="mt-2 text-sm text-slate-700">{a.message}</p>
                {(a.userEmail || a.userId) && (
                  <p className="mt-2 text-xs text-slate-600">
                    Utilisateur : {a.userEmail ?? a.userId}
                    {a.userId && (
                      <>
                        {" "}
                        ·{" "}
                        <Link
                          href={`/admin/users?userId=${a.userId}`}
                          className="text-sky-600 hover:underline"
                        >
                          Voir fiche
                        </Link>
                      </>
                    )}
                  </p>
                )}
                {a.metadata && typeof a.metadata === "object" && (
                  <pre className="mt-2 text-xs text-slate-500 overflow-x-auto">
                    {JSON.stringify(a.metadata, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
