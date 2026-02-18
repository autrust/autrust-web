import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, isAdmin } from "@/lib/auth";

function getPlanLimits(plan: "START" | "PRO" | "ELITE" | "ENTERPRISE") {
  switch (plan) {
    case "START":
      return { min: 1, max: 14 };
    case "PRO":
      return { min: 15, max: 30 };
    case "ELITE":
      return { min: 31, max: 120 };
    case "ENTERPRISE":
      return { min: 120, max: 1000 };
  }
}

// Applique les changements de plan en attente (pour les downgrades)
// À appeler au début de chaque mois (cron ou manuellement par admin)
export async function POST(req: Request) {
  const user = await requireUser();
  
  // Seuls les admins peuvent déclencher manuellement cette action
  // (sinon elle peut être appelée par un cron externe avec une clé secrète)
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const usersWithPendingChanges = await prisma.user.findMany({
    where: {
      pendingPlanChange: { not: null },
      profileType: "CONCESSIONNAIRE",
    },
    select: {
      id: true,
      pendingPlanChange: true,
      maxListings: true,
    },
  });

  let applied = 0;
  let errors = 0;

  for (const u of usersWithPendingChanges) {
    if (!u.pendingPlanChange) continue;

    try {
      const limits = getPlanLimits(u.pendingPlanChange);
      // Si maxListings dépasse les limites du nouveau plan, ajuster
      const newMaxListings =
        u.maxListings && u.maxListings > limits.max
          ? limits.max
          : u.maxListings && u.maxListings < limits.min
            ? limits.min
            : u.maxListings;

      await prisma.user.update({
        where: { id: u.id },
        data: {
          selectedPlan: u.pendingPlanChange,
          maxListings: newMaxListings,
          pendingPlanChange: null,
        },
      });
      applied++;
    } catch (err) {
      console.error(`Erreur lors de l'application du changement de plan pour ${u.id}:`, err);
      errors++;
    }
  }

  return NextResponse.json({
    ok: true,
    applied,
    errors,
    total: usersWithPendingChanges.length,
  });
}
