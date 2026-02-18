import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mes chiffres | Admin AuTrust",
};

// Prix par mois (€/mois)
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

// Tu paies 8 € à CarVertical, le client te paie 10 € → bénéfice 2 €/rapport
const CARVERTICAL_COST_CENTS = 800; // 8 € par rapport (ce que tu paies à CarVertical)
const CARVERTICAL_PRICE_CENTS = 1000; // 10 € (ce que le client te paie)
const CARVERTICAL_MARGIN_CENTS = CARVERTICAL_PRICE_CENTS - CARVERTICAL_COST_CENTS; // 2 €

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

const OWNER_EMAILS = ["candel.s@hotmail.fr", "candel.pro@hotmail.com"];

export default async function AdminMesChiffresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin/mes-chiffres");
  if (!isAdmin(user)) redirect("/account?admin=verify_phone");
  if (!OWNER_EMAILS.includes(user.email.toLowerCase()))
    redirect("/admin");

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Abonnements : nombre par type (garages actuels)
  const garagesByPlan = await prisma.user.groupBy({
    by: ["selectedPlan"],
    where: {
      profileType: "CONCESSIONNAIRE",
      selectedPlan: { not: null },
    },
    _count: { id: true },
  });

  const planCounts: Record<string, number> = {};
  let caAbonnements = 0;
  garagesByPlan.forEach((row) => {
    if (row.selectedPlan) {
      planCounts[row.selectedPlan] = row._count.id;
      caAbonnements += (PLAN_PRICE_EUR[row.selectedPlan] ?? 0) * 12 * row._count.id;
    }
  });

  // Nouveaux pros ce mois / cette année (inscriptions)
  const newProsThisMonth = await prisma.user.count({
    where: {
      profileType: "CONCESSIONNAIRE",
      createdAt: { gte: startOfMonth },
    },
  });
  const newProsThisYear = await prisma.user.count({
    where: {
      profileType: "CONCESSIONNAIRE",
      createdAt: { gte: startOfYear },
    },
  });

  // Mises en avant : SponsorPayment
  const sponsorPayments = await prisma.sponsorPayment.findMany({
    orderBy: { createdAt: "asc" },
  });
  const sponsorTotalCents = sponsorPayments.reduce((s, p) => s + p.amountCents, 0);
  const sponsorByMonth: Record<string, { count: number; cents: number }> = {};
  sponsorPayments.forEach((p) => {
    const key = getMonthKey(p.createdAt);
    if (!sponsorByMonth[key]) sponsorByMonth[key] = { count: 0, cents: 0 };
    sponsorByMonth[key].count += 1;
    sponsorByMonth[key].cents += p.amountCents;
  });

  // Rapports CarVertical (ListingReport payés)
  const reportsPaid = await prisma.listingReport.findMany({
    where: {
      status: { in: ["PAID_AWAITING_UPLOAD", "READY"] },
    },
    select: { amountCents: true, createdAt: true, provider: true },
  });
  const reportTotalCents = reportsPaid.reduce((s, r) => s + r.amountCents, 0);
  const reportCount = reportsPaid.length;
  const carVerticalCostCents = reportCount * CARVERTICAL_COST_CENTS;
  const reportNetCents = reportTotalCents - carVerticalCostCents; // bénéfice (2 €/rapport)
  const reportByMonth: Record<string, { count: number; cents: number }> = {};
  reportsPaid.forEach((r) => {
    const key = getMonthKey(r.createdAt);
    if (!reportByMonth[key]) reportByMonth[key] = { count: 0, cents: 0 };
    reportByMonth[key].count += 1;
    reportByMonth[key].cents += r.amountCents;
  });

  // Acomptes : DepositPayment
  const depositPayments = await prisma.depositPayment.findMany({
    orderBy: { createdAt: "asc" },
  });
  const depositTotalCents = depositPayments.reduce((s, p) => s + p.amountCents, 0);
  const DEPOSIT_COMMISSION_PERCENT = 3;
  const depositCommissionCents = Math.round((depositTotalCents * DEPOSIT_COMMISSION_PERCENT) / 100);
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
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mes chiffres</h1>
            <p className="mt-1 text-slate-600">
              Vue réservée à candel.s@hotmail.fr / candel.pro@hotmail.com
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-slate-600 hover:text-sky-600"
          >
            ← Administration
          </Link>
        </div>

        {/* Abonnements */}
        <section className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Abonnements (garages pro)</h2>
          <p className="mt-1 text-sm text-slate-600">
            Nombre d&apos;abonnements par type (prix affichés par mois). CA théorique annuel.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-2 font-medium text-slate-700">Type</th>
                  <th className="py-2 font-medium text-slate-700">Nombre</th>
                  <th className="py-2 font-medium text-slate-700">CA théorique</th>
                </tr>
              </thead>
              <tbody>
                {(["START", "PRO", "ELITE", "ENTERPRISE"] as const).map((plan) => (
                  <tr key={plan} className="border-b border-slate-100">
                    <td className="py-2 text-slate-700">{planLabel(plan)}</td>
                    <td className="py-2 font-medium">{planCounts[plan] ?? 0}</td>
                    <td className="py-2 font-medium text-emerald-700">
                      {formatEur((planCounts[plan] ?? 0) * (PLAN_PRICE_EUR[plan] ?? 0) * 12 * 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="font-medium text-emerald-700">
              CA total abonnements (théorique) : {formatEur(caAbonnements * 100)}
            </span>
            <span className="text-slate-600">
              Nouveaux pros ce mois : {newProsThisMonth} · Cette année : {newProsThisYear}
            </span>
          </div>
        </section>

        {/* Annonces mises en avant */}
        <section className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Annonces mises en avant</h2>
          <p className="mt-1 text-sm text-slate-600">
            Nombre de mises en avant achetées et revenus (Top recherche 7j/30j, Boost 48h).
          </p>
          <div className="mt-4 flex flex-wrap gap-6">
            <div>
              <span className="text-sm text-slate-500">Nombre total</span>
              <div className="text-2xl font-bold text-slate-900">{sponsorPayments.length}</div>
            </div>
            <div>
              <span className="text-sm text-slate-500">Revenus total</span>
              <div className="text-2xl font-bold text-emerald-700">
                {formatEur(sponsorTotalCents)}
              </div>
            </div>
          </div>
        </section>

        {/* Rapports CarVertical */}
        <section className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Rapports CarVertical</h2>
          <p className="mt-1 text-sm text-slate-600">
            Nombre de rapports payés. Tu paies 8 € à CarVertical, le client te paie 10 € → bénéfice 2 €/rapport.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-sm text-slate-500">Nombre</span>
              <div className="text-xl font-bold text-slate-900">{reportCount}</div>
            </div>
            <div>
              <span className="text-sm text-slate-500">CA total</span>
              <div className="text-xl font-bold text-emerald-700">
                {formatEur(reportTotalCents)}
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-500">Coût CarVertical (8 €/rapport)</span>
              <div className="text-xl font-bold text-red-700">
                − {formatEur(carVerticalCostCents)}
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-500">Bénéfice (2 €/rapport)</span>
              <div className="text-xl font-bold text-emerald-700">
                {formatEur(reportNetCents)}
              </div>
            </div>
          </div>
        </section>

        {/* Acomptes */}
        <section className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Acomptes</h2>
          <p className="mt-1 text-sm text-slate-600">
            Nombre d&apos;acomptes, volume total et commission {DEPOSIT_COMMISSION_PERCENT} % (ce que tu gardes).
          </p>
          <div className="mt-4 flex flex-wrap gap-6">
            <div>
              <span className="text-sm text-slate-500">Nombre total</span>
              <div className="text-2xl font-bold text-slate-900">{depositPayments.length}</div>
            </div>
            <div>
              <span className="text-sm text-slate-500">En cours</span>
              <div className="text-2xl font-bold text-slate-500">—</div>
              <span className="text-xs text-slate-400">(non suivi)</span>
            </div>
            <div>
              <span className="text-sm text-slate-500">Montant total (volume)</span>
              <div className="text-2xl font-bold text-slate-900">
                {formatEur(depositTotalCents)}
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-500">Commission {DEPOSIT_COMMISSION_PERCENT} % (ce que j&apos;ai eu)</span>
              <div className="text-2xl font-bold text-emerald-700">
                {formatEur(depositCommissionCents)}
              </div>
            </div>
          </div>
        </section>

        {/* Total des rentrées */}
        <section className="mt-8 rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Total des rentrées</h2>
          <p className="mt-1 text-sm text-slate-600">
            Abonnements + mises en avant + bénéfice CarVertical + commission acomptes.
          </p>
          <div className="mt-4 text-3xl font-bold text-emerald-700">
            {formatEur(
              caAbonnements * 100 +
                sponsorTotalCents +
                reportNetCents +
                depositCommissionCents
            )}
          </div>
        </section>

        {/* Historique par mois */}
        <section className="mt-8 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">Historique par mois</h2>
          <p className="mt-1 text-sm text-slate-600">
            Mises en avant, rapports CarVertical et acomptes par mois.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="px-3 py-2 text-left font-medium text-slate-700">Mois</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700">Mises en avant (nb)</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700">Mises en avant (€)</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700">Rapports (nb)</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700">Rapports (€)</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700">Acomptes (nb)</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-700">Acomptes (€)</th>
                </tr>
              </thead>
              <tbody>
                {sortedMonths.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                      Aucune donnée pour le moment.
                    </td>
                  </tr>
                ) : (
                  sortedMonths.map((key) => {
                    const [y, m] = key.split("-");
                    const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("fr-BE", {
                      month: "long",
                      year: "numeric",
                    });
                    const sp = sponsorByMonth[key];
                    const rp = reportByMonth[key];
                    const dp = depositByMonth[key];
                    return (
                      <tr key={key} className="border-b border-slate-100">
                        <td className="px-3 py-2 font-medium text-slate-800 capitalize">{label}</td>
                        <td className="px-3 py-2 text-right">{sp?.count ?? 0}</td>
                        <td className="px-3 py-2 text-right">{sp ? formatEur(sp.cents) : "—"}</td>
                        <td className="px-3 py-2 text-right">{rp?.count ?? 0}</td>
                        <td className="px-3 py-2 text-right">{rp ? formatEur(rp.cents) : "—"}</td>
                        <td className="px-3 py-2 text-right">{dp?.count ?? 0}</td>
                        <td className="px-3 py-2 text-right">{dp ? formatEur(dp.cents) : "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
