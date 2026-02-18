import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const SPONSOR_PRICES = { "7": 999, "30": 1999, "48h": 499 };
const DURATIONS = ["7", "30", "48h"];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addMonths(d, n) {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log("📊 Création des données démo pour Mes chiffres (acomptes, CarVertical, mises en avant)...\n");

  const listings = await prisma.listing.findMany({
    where: { sellerId: { not: null } },
    select: { id: true, sellerId: true },
    take: 80,
  });
  const users = await prisma.user.findMany({
    select: { id: true },
    take: 20,
  });

  if (listings.length === 0 || users.length === 0) {
    console.log("⚠️  Créez d’abord des garages et annonces (npm run db:seed-garages).");
    await prisma.$disconnect();
    process.exit(1);
  }

  const now = new Date();

  // ——— SponsorPayment (annonces mises en avant) ———
  const existingSponsor = await prisma.sponsorPayment.count();
  if (existingSponsor === 0) {
    for (let i = 0; i < 25; i++) {
      const listing = listings[i % listings.length];
      const duration = DURATIONS[i % 3];
      const amountCents = SPONSOR_PRICES[duration];
      const createdAt = addMonths(now, -rand(0, 6));
      await prisma.sponsorPayment.create({
        data: {
          listingId: listing.id,
          amountCents,
          duration,
          createdAt,
        },
      });
    }
    console.log("✅ 25 mises en avant démo créées (SponsorPayment).");
  } else {
    console.log("  Mises en avant : déjà des données, ignoré.");
  }

  // ——— ListingReport payés (CarVertical) ———
  const reportsToCreate = 15;
  const existingReports = await prisma.listingReport.count({
    where: { status: { in: ["PAID_AWAITING_UPLOAD", "READY"] } },
  });
  if (existingReports < 5) {
    const listingIds = [...new Set(listings.map((l) => l.id))];
    for (let i = 0; i < reportsToCreate; i++) {
      const listingId = listingIds[i % listingIds.length];
      const createdAt = addMonths(now, -rand(0, 5));
      await prisma.listingReport.create({
        data: {
          listingId,
          provider: "carvertical",
          status: i % 3 === 0 ? "READY" : "PAID_AWAITING_UPLOAD",
          amountCents: 1000,
          currency: "eur",
          createdAt,
          updatedAt: createdAt,
        },
      });
    }
    console.log(`✅ ${reportsToCreate} rapports CarVertical payés démo créés.`);
  } else {
    console.log("  Rapports CarVertical : déjà des données, ignoré.");
  }

  // ——— DepositPayment (acomptes) ———
  const existingDeposits = await prisma.depositPayment.count();
  if (existingDeposits === 0) {
    const buyerIds = users.map((u) => u.id).filter((id) => id !== listings[0]?.sellerId);
    for (let i = 0; i < 20; i++) {
      const listing = listings[i % listings.length];
      if (!listing.sellerId) continue;
      const buyerId = buyerIds[i % buyerIds.length] ?? buyerIds[0];
      const amountCents = [30000, 50000, 75000, 100000, 150000][rand(0, 4)]; // 300€ à 1500€
      const createdAt = addMonths(now, -rand(0, 4));
      await prisma.depositPayment.create({
        data: {
          listingId: listing.id,
          buyerId,
          sellerId: listing.sellerId,
          amountCents,
          createdAt,
        },
      });
    }
    console.log("✅ 20 acomptes démo créés (DepositPayment).");
  } else {
    console.log("  Acomptes : déjà des données, ignoré.");
  }

  console.log("\n🎉 Démo Mes chiffres prête. Va sur /admin/mes-chiffres pour voir les chiffres.\n");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
