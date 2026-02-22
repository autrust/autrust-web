/**
 * Crée une annonce de test avec accès gestion pour tester le flux CarVertical.
 * L’annonce a hasCarVerticalVerification: true et un manageToken fixe.
 *
 * Usage:
 *   node scripts/create-test-listing-carvertical.mjs
 *   node scripts/create-test-listing-carvertical.mjs ton-email@exemple.com
 *
 * Puis ouvre : /sell/manage/test-carvertical-annonce (connecté avec le même email)
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const MANAGE_TOKEN = "test-carvertical-annonce";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  const prisma = new PrismaClient({ adapter });

  const emailArg = process.argv[2]?.trim();
  let seller = null;
  if (emailArg) {
    seller = await prisma.user.findUnique({ where: { email: emailArg } });
    if (!seller) {
      console.error("Utilisateur non trouvé:", emailArg);
      process.exit(1);
    }
  }
  if (!seller) {
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (adminEmails.length) {
      seller = await prisma.user.findFirst({
        where: { email: { in: adminEmails } },
      });
    }
    if (!seller) seller = await prisma.user.findFirst();
  }

  if (!seller) {
    console.error("Aucun utilisateur en base. Crée un compte (inscription) puis relance ce script avec ton email.");
    process.exit(1);
  }

  const existing = await prisma.listing.findFirst({
    where: { manageToken: MANAGE_TOKEN },
    select: { id: true, title: true, manageToken: true },
  });

  if (existing) {
    console.log("");
    console.log("✅ Une annonce de test CarVertical existe déjà.");
    console.log("   ID:", existing.id);
    console.log("   Titre:", existing.title);
    console.log("");
    console.log("   👉 Gérer l’annonce (rapport, paiement, formulaire) :");
    console.log("      " + (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000") + "/sell/manage/" + MANAGE_TOKEN);
    console.log("");
    console.log("   👉 Voir l’annonce (fiche publique) :");
    console.log("      " + (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000") + "/listings/" + existing.id);
    console.log("");
    console.log("   Connecte-toi avec :", seller.email);
    console.log("");
    return;
  }

  const listing = await prisma.listing.create({
    data: {
      manageToken: MANAGE_TOKEN,
      sellerId: seller.id,
      title: "Volkswagen Golf 1.5 TSI — Annonce test CarVertical",
      description:
        "Annonce de test pour vérifier le flux CarVertical : paiement rapport, formulaire VIN/marque/modèle, email sous 24 h. Citadine en bon état.",
      category: "VOITURE",
      mode: "SALE",
      price: 18900,
      year: 2021,
      km: 32000,
      city: "Bruxelles",
      country: "BE",
      make: "Volkswagen",
      model: "Golf",
      status: "ACTIVE",
      hasCarVerticalVerification: true,
      contactEmail: seller.email,
      contactName: "Test Vendeur",
      vin: "WVWZZZ3CZWE123456",
    },
  });

  await prisma.listingPhoto.create({
    data: {
      listingId: listing.id,
      url: "/uploads/peugeot-3008.png",
      order: 0,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000";

  console.log("");
  console.log("✅ Annonce de test CarVertical créée.");
  console.log("   ID:", listing.id);
  console.log("   Titre:", listing.title);
  console.log("   manageToken:", MANAGE_TOKEN);
  console.log("");
  console.log("   👉 Gérer l’annonce (payer le rapport, formulaire VIN/marque/modèle, etc.) :");
  console.log("      " + baseUrl + "/sell/manage/" + MANAGE_TOKEN);
  console.log("");
  console.log("   👉 Voir l’annonce (fiche publique avec bloc CarVertical) :");
  console.log("      " + baseUrl + "/listings/" + listing.id);
  console.log("");
  console.log("   Connecte-toi avec :", seller.email);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
