import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Garages (professionnels)",
};

export default async function AdminGaragesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/garages");
  if (!isAdmin(user)) redirect("/account?admin=verify_phone");

  const garages = await prisma.user.findMany({
    where: { profileType: "CONCESSIONNAIRE" },
    orderBy: { email: "asc" },
    select: {
      id: true,
      email: true,
      phone: true,
      vatNumber: true,
      selectedPlan: true,
      maxListings: true,
      createdAt: true,
      _count: { select: { listings: true } },
    },
  });

  const garageIds = garages.map((g) => g.id);
  const [countsBySeller, soldAmountBySeller, carVerticalBySeller] =
    garageIds.length > 0
      ? await Promise.all([
          prisma.listing.groupBy({
            by: ["sellerId", "status"],
            where: { sellerId: { in: garageIds } },
            _count: { id: true },
          }),
          prisma.listing.groupBy({
            by: ["sellerId"],
            where: {
              sellerId: { in: garageIds },
              status: "SOLD",
            },
            _sum: { price: true },
          }),
          prisma.listing.groupBy({
            by: ["sellerId"],
            where: {
              sellerId: { in: garageIds },
              hasCarVerticalVerification: true,
            },
            _count: { id: true },
          }),
        ])
      : [[], [], []];

  const statusBySeller: Record<
    string,
    { ACTIVE: number; SOLD: number; ARCHIVED: number }
  > = {};
  garageIds.forEach((id) => {
    statusBySeller[id] = { ACTIVE: 0, SOLD: 0, ARCHIVED: 0 };
  });
  countsBySeller.forEach((row) => {
    if (row.sellerId && row.status in statusBySeller[row.sellerId]) {
      (statusBySeller[row.sellerId] as Record<string, number>)[row.status] =
        row._count.id;
    }
  });

  const soldAmountMap: Record<string, number> = {};
  soldAmountBySeller.forEach((row) => {
    soldAmountMap[row.sellerId] = row._sum?.price ?? 0;
  });

  const carVerticalMap: Record<string, number> = {};
  carVerticalBySeller.forEach((row) => {
    carVerticalMap[row.sellerId] = row._count.id;
  });

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin"
            className="text-sm text-slate-600 hover:text-sky-600"
          >
            ← Administration
          </Link>
          <Link
            href="/account"
            className="text-sm text-slate-600 hover:text-sky-600"
          >
            Mon compte
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Listing garages</h1>
        <p className="mt-2 text-slate-600">
          Nombre de véhicules et ventes par garage. Cliquez sur un garage pour
          voir ses données et le détail des véhicules.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white/75 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Garage
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    TVA
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Abonnement
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Nombre de véhicules
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Actives
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Ventes (nb)
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700">
                    Montant ventes
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-700" title="Véhicules avec CarVertical">
                    CarVertical
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700">
                    Inscrit le
                  </th>
                </tr>
              </thead>
              <tbody>
                {garages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Aucun professionnel pour le moment.
                    </td>
                  </tr>
                ) : (
                  garages.map((g) => {
                    const status = statusBySeller[g.id];
                    const soldAmount = soldAmountMap[g.id] ?? 0;
                    return (
                      <tr
                        key={g.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/garages/${g.id}`}
                            className="font-medium text-sky-700 hover:text-sky-800 hover:underline"
                          >
                            {g.email}
                          </Link>
                          {g.phone && (
                            <div className="text-xs text-slate-500">
                              {g.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {g.vatNumber ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {g.selectedPlan
                            ? `${g.selectedPlan}${g.maxListings != null ? ` — ${g.maxListings} annonces max` : ""}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {g._count.listings}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {status?.ACTIVE ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600">
                          {status?.SOLD ?? 0}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {soldAmount > 0
                            ? new Intl.NumberFormat("fr-BE", {
                                style: "currency",
                                currency: "EUR",
                                maximumFractionDigits: 0,
                              }).format(soldAmount)
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {(carVerticalMap[g.id] ?? 0) > 0 ? (
                            <span className="font-medium text-emerald-700" title={`${carVerticalMap[g.id]} véhicule(s) avec CarVertical`}>
                              {carVerticalMap[g.id]}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {g.createdAt.toLocaleDateString("fr-BE")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
