import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AdminTabs } from "@/app/admin/AdminTabs";
import type { AdminStats, GarageRow } from "@/app/admin/AdminTabs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Administration AuTrust",
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?next=/admin");
  if (!isAdmin(user)) redirect("/account?admin=verify_phone");

  // Statistiques globales
  const [
    totalUsers,
    totalListings,
    activeListings,
    soldListings,
    totalGarages,
    totalAlerts,
    recentFeedbacks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "SOLD" } }),
    prisma.user.count({ where: { profileType: "CONCESSIONNAIRE" } }),
    prisma.adminAlert.count(),
    prisma.siteFeedback.count(),
  ]);

  // Garages triés par ordre alphabétique (email)
  const garagesDb = await prisma.user.findMany({
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

  const garageIds = garagesDb.map((g) => g.id);
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
  countsBySeller.forEach((row: { sellerId: string; status: string; _count: { id: number } }) => {
    if (row.sellerId && row.status in statusBySeller[row.sellerId]) {
      (statusBySeller[row.sellerId] as Record<string, number>)[row.status] =
        row._count.id;
    }
  });

  const soldAmountMap: Record<string, number> = {};
  soldAmountBySeller.forEach((row: { sellerId: string; _sum: { price: number | null } }) => {
    soldAmountMap[row.sellerId] = row._sum?.price ?? 0;
  });

  const carVerticalMap: Record<string, number> = {};
  carVerticalBySeller.forEach((row: { sellerId: string; _count: { id: number } }) => {
    carVerticalMap[row.sellerId] = row._count.id;
  });

  const garages: GarageRow[] = garagesDb.map((g) => {
    const status = statusBySeller[g.id];
    return {
      id: g.id,
      email: g.email,
      phone: g.phone,
      vatNumber: g.vatNumber,
      selectedPlan: g.selectedPlan,
      maxListings: g.maxListings,
      createdAt: g.createdAt.toISOString(),
      totalListings: g._count.listings,
      active: status?.ACTIVE ?? 0,
      sold: status?.SOLD ?? 0,
      soldAmountEur: soldAmountMap[g.id] ?? 0,
      carVerticalCount: carVerticalMap[g.id] ?? 0,
    };
  });

  const stats: AdminStats = {
    totalUsers,
    totalListings,
    activeListings,
    soldListings,
    totalGarages,
    totalAlerts,
    recentFeedbacks,
  };

  return (
    <main className="px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Administration AuTrust
            </h1>
            <p className="mt-1 text-slate-600">
              Panneau de contrôle — {user.email}
            </p>
          </div>
          <Link
            href="/account"
            className="text-sm text-slate-600 hover:text-sky-600"
          >
            ← Mon compte
          </Link>
        </div>

        <AdminTabs stats={stats} garages={garages} ownerEmail={user.email} />
      </div>
    </main>
  );
}
