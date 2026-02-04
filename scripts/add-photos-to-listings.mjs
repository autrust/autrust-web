import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

// Photos correspondant aux modèles de véhicules spécifiques
function getPhotoForVehicle(title, make, model, category) {
  const titleLower = (title || "").toLowerCase();
  const makeLower = (make || "").toLowerCase();
  const modelLower = (model || "").toLowerCase();

  // Audi e-tron GT - photo locale fournie par l'utilisateur
  if (titleLower.includes("e-tron gt") || titleLower.includes("etron gt") || (titleLower.includes("audi") && (titleLower.includes("e-tron gt") || titleLower.includes("etron gt")))) {
    return "/uploads/audi-etron-gt.png";
  }
  
  // Audi Q3 - photo locale fournie par l'utilisateur
  if (titleLower.includes("q3") || (titleLower.includes("audi") && titleLower.includes("q3"))) {
    return "/uploads/audi-q3.png";
  }
  
  // Audi A3 - photo locale fournie par l'utilisateur
  if (titleLower.includes("a3") || (titleLower.includes("audi") && titleLower.includes("a3"))) {
    return "/uploads/audi-a3.png";
  }
  
  // Audi A4 Avant (wagon) - photo locale fournie par l'utilisateur
  if (titleLower.includes("a4 avant") || (titleLower.includes("audi") && titleLower.includes("a4"))) {
    return "/uploads/audi-a4.png";
  }
  
  // Mercedes-Benz EQC 400 - photo locale fournie par l'utilisateur
  if (titleLower.includes("eqc") || (titleLower.includes("mercedes") && titleLower.includes("eqc"))) {
    return "/uploads/mercedes-eqc-400.png";
  }
  
  // Mercedes-Benz GLA 200 - photo locale fournie par l'utilisateur
  if (titleLower.includes("gla") || (titleLower.includes("mercedes") && titleLower.includes("gla"))) {
    return "/uploads/mercedes-gla-200.png";
  }
  
  // Mercedes-Benz Classe A
  if (titleLower.includes("classe a") || (titleLower.includes("mercedes") && titleLower.includes("classe a"))) {
    return "https://images.unsplash.com/photo-1747944827952-7520103c4d5c?w=800&h=600&fit=crop";
  }
  
  // Mercedes-Benz Classe C (photo locale fournie par l'utilisateur)
  if (titleLower.includes("classe c") || (titleLower.includes("mercedes") && titleLower.includes("classe c"))) {
    return "/uploads/mercedes-classe-c.png";
  }
  
  // BMW X5 (SUV) - photo locale fournie par l'utilisateur
  if (titleLower.includes("x5") || (titleLower.includes("bmw") && titleLower.includes("x5"))) {
    return "/uploads/bmw-x5.png";
  }
  
  // BMW X1 (SUV) - photo locale fournie par l'utilisateur
  if (titleLower.includes("x1") || (titleLower.includes("bmw") && titleLower.includes("x1"))) {
    return "/uploads/bmw-x1.png";
  }
  
  // BMW X3 (SUV) - photo locale fournie par l'utilisateur
  if (titleLower.includes("x3") || (titleLower.includes("bmw") && titleLower.includes("x3"))) {
    return "/uploads/bmw-x3.png";
  }
  
  // BMW Série 1 - photo locale fournie par l'utilisateur
  if (titleLower.includes("série 1") || titleLower.includes("serie 1") || (titleLower.includes("bmw") && (titleLower.includes("série 1") || titleLower.includes("serie 1")))) {
    return "/uploads/bmw-serie-1.png";
  }
  
  // BMW Série 3 Touring (wagon) - photo locale fournie par l'utilisateur
  if ((titleLower.includes("série 3") || titleLower.includes("serie 3")) && titleLower.includes("touring") || (titleLower.includes("bmw") && (titleLower.includes("série 3") || titleLower.includes("serie 3")) && titleLower.includes("touring"))) {
    return "/uploads/bmw-serie-3-touring.png";
  }
  
  // BMW Série 3 (berline)
  if (titleLower.includes("série 3") || titleLower.includes("serie 3") || (titleLower.includes("bmw") && titleLower.includes("série 3"))) {
    return "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop";
  }
  
  // Tesla Model Y (spécifique - photo locale fournie par l'utilisateur)
  if (titleLower.includes("model y") || (titleLower.includes("tesla") && titleLower.includes("model y"))) {
    return "/uploads/tesla-model-y.png";
  }
  
  // Tesla Model 3
  if (titleLower.includes("tesla") || titleLower.includes("model 3")) {
    return "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop";
  }
  
  // Volkswagen ID.4 (spécifique - photo locale fournie par l'utilisateur)
  if (titleLower.includes("id.4") || titleLower.includes("id4") || (titleLower.includes("volkswagen") && (titleLower.includes("id.4") || titleLower.includes("id4")))) {
    return "/uploads/volkswagen-id4.png";
  }
  
  // Volkswagen Golf 8 GTI (spécifique - photo locale fournie par l'utilisateur)
  if ((titleLower.includes("golf 8") && titleLower.includes("gti")) || (titleLower.includes("golf") && titleLower.includes("8") && titleLower.includes("gti"))) {
    return "/uploads/golf-8-gti.png";
  }
  
  // Volkswagen Golf 8 (spécifique - photo locale fournie par l'utilisateur)
  if (titleLower.includes("golf 8") || (titleLower.includes("golf") && titleLower.includes("8"))) {
    return "/uploads/golf-8.png";
  }
  
  // Volkswagen Golf 7 (spécifique - photo locale fournie par l'utilisateur)
  if (titleLower.includes("golf 7") || (titleLower.includes("golf") && titleLower.includes("7"))) {
    return "/uploads/golf-7.png";
  }
  
  // Volkswagen Tiguan - photo locale fournie par l'utilisateur
  if (titleLower.includes("tiguan") || (titleLower.includes("volkswagen") && titleLower.includes("tiguan"))) {
    return "/uploads/volkswagen-tiguan.png";
  }
  
  // Volkswagen Golf / GTI (générique)
  if (titleLower.includes("golf") || titleLower.includes("gti") || (titleLower.includes("volkswagen") && titleLower.includes("golf"))) {
    return "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop";
  }
  
  // Renault Clio - photo locale fournie par l'utilisateur
  if (titleLower.includes("clio") || (titleLower.includes("renault") && titleLower.includes("clio"))) {
    return "/uploads/renault-clio.png";
  }
  
  // Ford Transit (utilitaire) - photo locale fournie par l'utilisateur
  if (titleLower.includes("transit") || (titleLower.includes("ford") && titleLower.includes("transit"))) {
    return "/uploads/ford-transit.png";
  }
  
  // Yamaha MT-07 (moto) - photo locale fournie par l'utilisateur
  if (titleLower.includes("mt-07") || (titleLower.includes("yamaha") && titleLower.includes("mt"))) {
    return "/uploads/yamaha-mt-07.png";
  }
  
  // Peugeot 308 SW - photo locale fournie par l'utilisateur
  if ((titleLower.includes("308") && titleLower.includes("sw")) || (makeLower.includes("peugeot") && titleLower.includes("308") && titleLower.includes("sw"))) {
    return "/uploads/peugeot-308-sw.png";
  }
  
  // Peugeot 3008 - photo locale fournie par l'utilisateur
  if (titleLower.includes("3008") || (makeLower.includes("peugeot") && titleLower.includes("3008"))) {
    return "/uploads/peugeot-3008.png";
  }
  
  // Fallback par marque
  if (makeLower.includes("audi")) {
    return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop";
  }
  
  if (makeLower.includes("mercedes") || makeLower.includes("benz")) {
    return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop";
  }
  
  if (makeLower.includes("bmw")) {
    return "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop";
  }
  
  if (makeLower.includes("tesla")) {
    return "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop";
  }
  
  if (makeLower.includes("volkswagen")) {
    return "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop";
  }
  
  if (makeLower.includes("peugeot")) {
    return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop";
  }
  
  // Photos par défaut selon la catégorie
  if (category === "MOTO") {
    return "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&h=600&fit=crop";
  }
  
  if (category === "UTILITAIRE") {
    return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop";
  }
  
  // Voiture par défaut
  return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop";
}

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

  console.log("📸 Ajout de photos aux annonces sans photos...");

  // Récupérer toutes les annonces actives
  const allListings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      photos: true,
    },
  });

  let updatedCount = 0;

  for (const listing of allListings) {
    // Si l'annonce n'a pas de photos, en ajouter une correspondante
    if (!listing.photos || listing.photos.length === 0) {
      const photoUrl = getPhotoForVehicle(listing.title, listing.make, listing.model, listing.category);
      
      await prisma.listingPhoto.create({
        data: {
          listingId: listing.id,
          url: photoUrl,
          order: 0,
        },
      });

      console.log(`✅ Photo ajoutée à: ${listing.title} (${listing.make || 'N/A'} ${listing.model || ''})`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 ${updatedCount} annonce(s) mise(s) à jour avec des photos !`);
  console.log(`📊 Total d'annonces vérifiées: ${allListings.length}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
