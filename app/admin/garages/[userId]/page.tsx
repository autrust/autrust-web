import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPriceEUR } from "@/lib/listings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Détail garage",
};

// Prix par mois (€/mois) — aligné avec mes-chiffres
const PLAN_PRICE_EUR: Record<string, number> = {
  START: 49,
  PRO: 189,
  ELITE: 289,
  ENTERPRISE: 489,
};
const PLAN_DISPLAY_NAMES: Record<string, string> = {
  START: "Start",
  PRO: "Pro",
  ELITE: "Elite",
  ENTERPRISE: "Enterprise",
};
function planLabel(plan: string): string {
  const name = PLAN_DISPLAY_NAMES[plan] ?? plan;
  const perMonth = PLAN_PRICE_EUR[plan] ?? 0;
  return `${name} (${perMonth} €/mois)`;
}
const CARVERTICAL_COST_CENTS = 800;
const CARVERTICAL_MARGIN_CENTS = 200;
const DEPOSIT_COMMISSION_PERCENT = 3;

function formatEur(cents: number) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
function getMonthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function AdminGarageDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/garages");
  if (!isAdmin(user)) redirect("/account?admin=verify_phone");

  const { userId } = await params;

  const garage = await prisma.user.findFirst({
    where: { id: userId, profileType: "CONCESSIONNAIRE" },
    select: {
      id: true,
      email: true,
      phone: true,
      vatNumber: true,
      selectedPlan: true,
      maxListings: true,
      createdAt: true,
      emailVerifiedAt: true,
    },
  });
  if (!garage) notFound();

  const listings = await prisma.listing.findMany({
    where: { sellerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      price: true,
      year: true,
      km: true,
      city: true,
      createdAt: true,
      category: true,
      hasCarVerticalVerification: true,
    },
  });

  const sold = listings.filter((l) => l.status === "SOLD");
  const active = listings.filter((l) => l.status === "ACTIVE");
  const archived = listings.filter((l) => l.status === "ARCHIVED");
  const totalVentesAmount = sold.reduce((s, l) => s + l.price, 0);
  const carVerticalCount = listings.filter((l) => l.hasCarVerticalVerification).length;

  // Chiffres du garage (comme Mes chiffres mais pour ce garage)
  const listingIds = listings.map((l) => l.id);
  const [sponsorPayments, reportsPaid, depositPayments] = await Promise.all([
    prisma.sponsorPayment.findMany({
      where: { listingId: { in: listingIds } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.listingReport.findMany({
      where: {
        listingId: { in: listingIds },
        status: { in: ["PAID_AWAITING_UPLOAD", "READY"] },
      },
      select: { amountCents: true, createdAt: true },
    }),
    prisma.depositPayment.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  const sponsorTotalCents = sponsorPayments.reduce((s, p) => s + p.amountCents, 0);
  const reportTotalCents = reportsPaid.reduce((s, r) => s + r.amountCents, 0);
  const reportCount = reportsPaid.length;
  const carVerticalCostCents = reportCount * CARVERTICAL_COST_CENTS;
  const reportNetCents = reportTotalCents - carVerticalCostCents;
  const depositTotalCents = depositPayments.reduce((s, p) => s + p.amountCents, 0);
  const depositCommissionCents = Math.round(
    (depositTotalCents * DEPOSIT_COMMISSION_PERCENT) / 100
  );
  const caAbonnementCents =
    garage.selectedPlan && PLAN_PRICE_EUR[garage.selectedPlan] != null
      ? (PLAN_PRICE_EUR[garage.selectedPlan] ?? 0) * 12 * 100
      : 0;
  const totalRentreesCents =
    caAbonnementCents + sponsorTotalCents + reportNetCents + depositCommissionCents;

  const sponsorByMonth: Record<string, { count: number; cents: number }> = {};
  sponsorPayments.forEach((p) => {
    const key = getMonthKey(p.createdAt);
    if (!sponsorByMonth[key]) sponsorByMonth[key] = { count: 0, cents: 0 };
    sponsorByMonth[key].count += 1;
    sponsorByMonth[key].cents += p.amountCents;
  });
  const reportByMonth: Record<string, { count: number; cents: number }> = {};
  reportsPaid.forEach((r) => {
    const key = getMonthKey(r.createdAt);
    if (!reportByMonth[key]) reportByMonth[key] = { count: 0, cents: 0 };
    reportByMonth[key].count += 1;
    reportByMonth[key].cents += r.amountCents;
  });
  const depositByMonth: Record<string, { count: number; cents: number }> = {};
  depositPayments.forEach((p) => {
    const key = getMonthKey(p.createdAt);
    if (!depositByMonth[key]) depositByMonth[key] = { count: 0, cents: 0 };
    depositByMonth[key].count += 1;
    depositByMonth[key].cents += p.amountCents;
  });
  const allMonths = new Set<string>([
    ...Object.keys(sponsorByMonth),
    ...Object.keys(reportByMonth),
    ...Object.keys(depositByMonth),
  ]);
  const sortedMonths = Array.from(allMonths).sort().reverse();

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/admin/garages"
            className="text-sm text-slate-600 hover:text-sky-600"
          >
            ← Garages
          </Link>
        </div>

        <h1 className="text-3xl font-bold">Garage — {garage.email}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-sky-200/70 bg-sky-50/50 px-4 py-3 text-sm">
          <span className="font-semibold text-slate-800">
            Nombre de véhicules : {listings.length}
          </span>
          <span className="text-slate-600">
            ({active.length} active{active.length !== 1 ? "s" : ""}, {sold.length} vendue
            {sold.length !== 1 ? "s" : ""}
            {archived.length > 0 &&
              `, ${archived.length} archivée${archived.length !== 1 ? "s" : ""}`}
            )
          </span>
          {carVerticalCount > 0 && (
            <span className="font-medium text-emerald-700">
              {carVerticalCount} avec CarVertical
            </span>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 text-sm">
          <h2 className="mb-3 font-semibold text-slate-800">Données du garage</h2>
          <div className="grid gap-1 sm:grid-cols-2">
            <div>
              <span className="text-slate-500">Email :</span>{" "}
              {garage.email}
              {garage.emailVerifiedAt ? (
                <span className="ml-1 text-emerald-600">✓</span>
              ) : null}
            </div>
            <div>
              <span className="text-slate-500">Téléphone :</span>{" "}
              {garage.phone ?? "—"}
            </div>
            <div>
              <span className="text-slate-500">N° TVA :</span>{" "}
              {garage.vatNumber ?? "—"}
            </div>
            <div>
              <span className="text-slate-500">Abonnement :</span>{" "}
              {garage.selectedPlan
                ? `${garage.selectedPlan}${garage.maxListings != null ? ` — ${garage.maxListings} annonces max` : ""}`
                : "—"}
            </div>
            <div>
              <span className="text-slate-500">Inscrit le :</span>{" "}
              {garage.createdAt.toLocaleDateString("fr-BE")}
            </div>
          </div>
        </div>

        {/* Chiffres du garage (même structure que Mes chiffres) */}
        <section className="mt-8 rounded-2xl border-2 border-slate-200/70 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Chiffres du garage</h2>
          <p className="mt-1 text-sm text-slate-600">
            Abonnement, mises en avant, CarVertical, acomptes et total des rentrées pour ce garage.
          </p>

          <div className="mt-6 space-y-8">
            {/* Abonnement */}
            <div>
              <h3 className="text-sm font-medium text-slate-700">Abonnement</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left">
                      <th className="py-2 font-medium text-slate-700">Type</th>
                      <th className="py-2 font-medium text-slate-700">CA théorique annuel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {garage.selectedPlan ? (
                      <tr className="border-b border-slate-100">
                        <td className="py-2 text-slate-700">
                          {planLabel(garage.selectedPlan)}
                        </td>
                        <td className="py-2 font-medium text-emerald-700">
                          {formatEur(caAbonnementCents)}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={2} className="py-2 text-slate-500">
                          Aucun abonnement
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mises en avant */}
            <div>
              <h3 className="text-sm font-medium text-slate-700">Annonces mises en avant</h3>
              <div className="mt-2 flex flex-wrap gap-6">
                <div>
                  <span className="text-xs text-slate-500">Nombre</span>
                  <div className="text-xl font-bold text-slate-900">{sponsorPayments.length}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Revenus</span>
                  <div className="text-xl font-bold text-emerald-700">
                    {formatEur(sponsorTotalCents)}
                  </div>
                </div>
              </div>
            </div>

            {/* Rapports CarVertical */}
            <div>
              <h3 className="text-sm font-medium text-slate-700">Rapports CarVertical</h3>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <span className="text-xs text-slate-500">Nombre</span>
                  <div className="text-lg font-bold text-slate-900">{reportCount}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">CA total</span>
                  <div className="text-lg font-bold text-emerald-700">
                    {formatEur(reportTotalCents)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Coût (8 €/rapport)</span>
                  <div className="text-lg font-bold text-red-700">
                    − {formatEur(carVerticalCostCents)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Bénéfice (2 €/rapport)</span>
                  <div className="text-lg font-bold text-emerald-700">
                    {formatEur(reportNetCents)}
                  </div>
                </div>
              </div>
            </div>

            {/* Acomptes */}
            <div>
              <h3 className="text-sm font-medium text-slate-700">Acomptes</h3>
              <div className="mt-2 flex flex-wrap gap-6">
                <div>
                  <span className="text-xs text-slate-500">Nombre</span>
                  <div className="text-xl font-bold text-slate-900">{depositPayments.length}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Volume total</span>
                  <div className="text-xl font-bold text-slate-900">
                    {formatEur(depositTotalCents)}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500">
                    Commission {DEPOSIT_COMMISSION_PERCENT} %
                  </span>
                  <div className="text-xl font-bold text-emerald-700">
                    {formatEur(depositCommissionCents)}
                  </div>
                </div>
              </div>
            </div>

            {/* Total des rentrées */}
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/80 p-4">
              <h3 className="text-sm font-medium text-slate-700">Total des rentrées (théorique)</h3>
              <p className="mt-1 text-xs text-slate-600">
                Abonnement + mises en avant + bénéfice CarVertical + commission acomptes
              </p>
              <div className="mt-2 text-2xl font-bold text-emerald-700">
                {formatEur(totalRentreesCents)}
              </div>
            </div>

            {/* Historique par mois */}
            {sortedMonths.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-700">Historique par mois</h3>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        <th className="px-3 py-2 text-left font-medium text-slate-700">Mois</th>
                        <th className="px-3 py-2 text-right font-medium text-slate-700">
                          Mises en avant (nb)
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-slate-700">
                          Mises en avant (€)
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-slate-700">
                          Rapports (nb)
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-slate-700">
                          Rapports (€)
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-slate-700">
                          Acomptes (nb)
                        </th>
                        <th className="px-3 py-2 text-right font-medium text-slate-700">
                          Acomptes (€)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMonths.map((key) => {
                        const [y, m] = key.split("-");
                        const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(
                          "fr-BE",
                          { month: "long", year: "numeric" }
                        );
                        const sp = sponsorByMonth[key];
                        const rp = reportByMonth[key];
                        const dp = depositByMonth[key];
                        return (
                          <tr key={key} className="border-b border-slate-100">
                            <td className="px-3 py-2 font-medium text-slate-800 capitalize">
                              {label}
                            </td>
                            <td className="px-3 py-2 text-right">{sp?.count ?? 0}</td>
                            <td className="px-3 py-2 text-right">
                              {sp ? formatEur(sp.cents) : "—"}
                            </td>
                            <td className="px-3 py-2 text-right">{rp?.count ?? 0}</td>
                            <td className="px-3 py-2 text-right">
                              {rp ? formatEur(rp.cents) : "—"}
                            </td>
                            <td className="px-3 py-2 text-right">{dp?.count ?? 0}</td>
                            <td className="px-3 py-2 text-right">
                              {dp ? formatEur(dp.cents) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Résumé ventes */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800">Ventes</h2>
          <p className="mt-1 text-sm text-slate-600">
            {sold.length} annonce{sold.length !== 1 ? "s" : ""} vendue
            {sold.length !== 1 ? "s" : ""}
            {sold.length > 0 &&
              ` · Montant total ${formatPriceEUR(totalVentesAmount)}`}
          </p>
          {sold.length > 0 ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Annonce
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-700">
                      Prix
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-700">
                      Année · km
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Ville
                    </th>
                    <th className="px-4 py-2 text-center font-medium text-slate-700" title="CarVertical">
                      CarVertical
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Déposée le
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sold.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-2">
                        <Link
                          href={`/listings/${l.id}`}
                          className="text-sky-700 hover:underline"
                        >
                          {l.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
                        {formatPriceEUR(l.price)}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-600">
                        {l.year} · {l.km.toLocaleString("fr-BE")} km
                      </td>
                      <td className="px-4 py-2 text-slate-600">{l.city}</td>
                      <td className="px-4 py-2 text-center">
                        {l.hasCarVerticalVerification ? (
                          <span className="text-emerald-600 font-medium" title="Vérification CarVertical">✓</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {l.createdAt.toLocaleDateString("fr-BE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-2 text-slate-500">Aucune vente enregistrée.</p>
          )}
        </section>

        {/* Toutes les annonces */}
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800">
            Toutes les annonces
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {active.length} active{active.length !== 1 ? "s" : ""},{" "}
            {archived.length} archivée{archived.length !== 1 ? "s" : ""}
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Annonce
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Statut
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-700">
                      Prix
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-700">
                      Année · km
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Ville
                    </th>
                    <th className="px-4 py-2 text-center font-medium text-slate-700" title="CarVertical">
                      CarVertical
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Déposée le
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <tr
                      key={l.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-2">
                        <Link
                          href={`/listings/${l.id}`}
                          className="text-sky-700 hover:underline"
                        >
                          {l.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={
                            l.status === "ACTIVE"
                              ? "text-emerald-600"
                              : l.status === "SOLD"
                                ? "text-sky-600"
                                : "text-slate-500"
                          }
                        >
                          {l.status === "ACTIVE"
                            ? "Active"
                            : l.status === "SOLD"
                              ? "Vendue"
                              : "Archivée"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
                        {formatPriceEUR(l.price)}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-600">
                        {l.year} · {l.km.toLocaleString("fr-BE")} km
                      </td>
                      <td className="px-4 py-2 text-slate-600">{l.city}</td>
                      <td className="px-4 py-2 text-center">
                        {l.hasCarVerticalVerification ? (
                          <span className="text-emerald-600 font-medium" title="Vérification CarVertical">✓</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {l.createdAt.toLocaleDateString("fr-BE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
