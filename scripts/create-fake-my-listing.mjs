/**
 * Crée une fausse annonce + quelques contacts et favoris pour tester "Mes annonces"
 *
 * Usage:
 *   node scripts/create-fake-my-listing.mjs
 *   node scripts/create-fake-my-listing.mjs ton-email@exemple.com
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  const prisma = new PrismaClient({ adapter });

  const emailArg = process.argv[2]?.trim();
  const searchEmail = emailArg || "demo@autrust.local";
  let seller = await prisma.user.findUnique({
    where: { email: searchEmail },
  });

  if (!seller) {
    const firstUser = await prisma.user.findFirst();
    if (!firstUser) {
      console.error("Aucun utilisateur en base. Lance d’abord: node scripts/demo.mjs");
      process.exit(1);
    }
    seller = firstUser;
    console.log("Email non trouvé, utilisation du premier utilisateur:", seller.email);
  } else {
    console.log("Utilisateur vendeur:", seller.email);
    if (seller.email === "demo@autrust.local") {
      console.log("   (mot de passe démo: demo123)");
    }
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId: seller.id,
      title: "Peugeot 208 1.2 PureTech 82 — Fausse annonce de test",
      description:
        "Annonce de test pour voir le tableau de bord vendeur (Mes annonces). Citadine en très bon état, idéale ville.",
      category: "VOITURE",
      mode: "SALE",
      price: 12500,
      year: 2020,
      km: 42000,
      city: "Liège",
      make: "Peugeot",
      model: "208",
      status: "ACTIVE",
      contactEmail: seller.email,
      contactName: "Démo Vendeur",
    },
  });

  await prisma.listingPhoto.create({
    data: {
      listingId: listing.id,
      url: "/uploads/peugeot-3008.png",
      order: 0,
    },
  });

  const otherUser = await prisma.user.findFirst({
    where: { id: { not: seller.id } },
  });

  await prisma.contactRequest.create({
    data: {
      listingId: listing.id,
      sellerId: seller.id,
      senderName: "Jean Dupont",
      senderEmail: "jean.dupont@example.com",
      message: "Bonjour, cette annonce est-elle toujours disponible ? Je suis intéressé.",
    },
  });
  await prisma.contactRequest.create({
    data: {
      listingId: listing.id,
      sellerId: seller.id,
      senderName: "Marie Martin",
      senderEmail: "marie.martin@example.com",
      message: "Possibilité de voir le véhicule ce week-end ? Merci.",
    },
  });

  if (otherUser) {
    await prisma.favorite.upsert({
      where: {
        userId_listingId: { userId: otherUser.id, listingId: listing.id },
      },
      create: {
        userId: otherUser.id,
        listingId: listing.id,
      },
      update: {},
    });
  }

  console.log("");
  console.log("✅ Fausse annonce créée:");
  console.log("   Titre:", listing.title);
  console.log("   Prix:", listing.price, "€");
  console.log("   ID:", listing.id);
  console.log("");
  console.log("   • 2 demandes de contact ajoutées");
  console.log(otherUser ? "   • 1 favori ajouté (autre utilisateur)" : "   • (Aucun autre user pour ajouter un favori)");
  console.log("");
  console.log("👉 Connecte-toi avec", seller.email, "et va sur Mon compte → Mes annonces");
  if (seller.email === "demo@autrust.local") {
    console.log("   Mot de passe démo: demo123");
  }
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
