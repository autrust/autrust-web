import { prisma } from "@/lib/db";

const MIN_COUNT_TO_PROMOTE = 4;

/** Enregistre une recherche (marque et/ou modèle) pour les proposer après 4+ recherches. */
export async function recordSearchTerms(make?: string | null, model?: string | null): Promise<void> {
  if (!make?.trim() && !model?.trim()) return;
  try {
    if (make?.trim()) {
      await prisma.searchTermCount.upsert({
        where: {
          type_value_make: { type: "make", value: make.trim(), make: "" },
        },
        create: { type: "make", value: make.trim(), make: "", count: 1 },
        update: { count: { increment: 1 }, updatedAt: new Date() },
      });
    }
    if (model?.trim() && make?.trim()) {
      await prisma.searchTermCount.upsert({
        where: {
          type_value_make: { type: "model", value: model.trim(), make: make.trim() },
        },
        create: { type: "model", value: model.trim(), make: make.trim(), count: 1 },
        update: { count: { increment: 1 }, updatedAt: new Date() },
      });
    }
  } catch {
    // Table peut ne pas exister encore (migration non appliquée)
  }
}

/** Marques recherchées au moins MIN_COUNT_TO_PROMOTE fois (pour liste "Souvent recherchées"). */
export async function getPopularMakes(minCount: number = MIN_COUNT_TO_PROMOTE): Promise<string[]> {
  try {
    const rows = await prisma.searchTermCount.findMany({
      where: { type: "make", count: { gte: minCount } },
      orderBy: { count: "desc" },
      take: 50,
    });
    return rows.map((r) => r.value);
  } catch {
    return [];
  }
}

/** Modèles fréquents par marque (pour afficher dans le select modèle). */
export async function getPopularModelsByMake(
  minCount: number = MIN_COUNT_TO_PROMOTE
): Promise<Record<string, string[]>> {
  try {
    const rows = await prisma.searchTermCount.findMany({
      where: { type: "model", count: { gte: minCount }, make: { not: "" } },
      orderBy: { count: "desc" },
    });
    const byMake: Record<string, string[]> = {};
    for (const r of rows) {
      const makeKey = r.make;
      if (!byMake[makeKey]) byMake[makeKey] = [];
      if (!byMake[makeKey].includes(r.value)) byMake[makeKey].push(r.value);
    }
    return byMake;
  } catch {
    return {};
  }
}
