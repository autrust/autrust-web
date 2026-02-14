import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Utilisateurs",
};

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/users");
  if (!isAdmin(user)) redirect("/account");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      emailVerifiedAt: true,
      phone: true,
      phoneVerifiedAt: true,
      isBlocked: true,
      createdAt: true,
      _count: {
        select: { listings: true },
      },
    },
  });

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/account"
            className="text-sm text-slate-600 hover:text-sky-600"
          >
            ← Mon compte
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <p className="mt-2 text-slate-600">
          {users.length} utilisateur{users.length !== 1 ? "s" : ""}
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Téléphone
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Inscrit le
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Annonces
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-3 text-slate-900">
                      {u.email}
                      {u.emailVerifiedAt ? (
                        <span className="ml-1 text-emerald-600" title="Email vérifié">✓</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.phone ?? "—"}
                      {u.phone && u.phoneVerifiedAt ? (
                        <span className="ml-1 text-emerald-600" title="Tél. vérifié">✓</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u.createdAt.toLocaleDateString("fr-BE")}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {u._count.listings}
                    </td>
                    <td className="px-4 py-3">
                      {u.isBlocked ? (
                        <span className="text-red-600 font-medium">Bloqué</span>
                      ) : (
                        <span className="text-slate-500">Actif</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
