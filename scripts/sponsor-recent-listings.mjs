import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const dbPath = connectionString.startsWith("file:")
    ? connectionString.replace("file:", "")
    : connectionString;
  
  const sqlite = new Database(dbPath);
  const adapter = new PrismaBetterSqlite3({
    url: connectionString,
  });
  const prisma = new PrismaClient({ adapter });

  console.log("⭐ Mise en vedette de quelques annonces récentes...");

  // Récupérer les annonces récentes (2024-2026) qui ne sont pas déjà sponsorisées
  const recentListings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      year: { gte: 2024 },
      isSponsored: false,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  if (recentListings.length === 0) {
    console.log("❌ Aucune annonce récente trouvée à mettre en vedette.");
    await prisma.$disconnect();
    return;
  }

  // Sélectionner les 6 premières annonces pour les mettre en vedette
  const listingsToSponsor = recentListings.slice(0, 6);
  const now = new Date();
  const sponsoredUntil = new Date(now);
  sponsoredUntil.setDate(sponsoredUntil.getDate() + 30); // 30 jours de sponsoring

  let sponsoredCount = 0;

  for (const listing of listingsToSponsor) {
    await prisma.listing.update({
      where: { id: listing.id },
      data: {
        isSponsored: true,
        sponsoredUntil: sponsoredUntil,
      },
    });

    console.log(`✅ Mise en vedette: ${listing.title} (${listing.year})`);
    sponsoredCount++;
  }

  console.log(`\n🎉 ${sponsoredCount} annonce(s) mise(s) en vedette !`);
  console.log(`📅 Expiration du sponsoring: ${sponsoredUntil.toLocaleDateString("fr-BE")}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
