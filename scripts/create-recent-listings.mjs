import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";

// Fonction pour obtenir une photo selon le véhicule
function getPhotoForVehicle(title, make, model, category) {
  const titleLower = (title || "").toLowerCase();
  const makeLower = (make || "").toLowerCase();

  // Photos locales disponibles
  if (titleLower.includes("golf 8") && titleLower.includes("gti")) {
    return "/uploads/golf-8-gti.png";
  }
  if (titleLower.includes("golf 7") || (titleLower.includes("golf") && titleLower.includes("7"))) {
    return "/uploads/golf-7.png";
  }
  if (titleLower.includes("x3") || (makeLower.includes("bmw") && titleLower.includes("x3"))) {
    return "/uploads/bmw-x3.png";
  }
  if (titleLower.includes("classe c") || (makeLower.includes("mercedes") && titleLower.includes("classe c"))) {
    return "/uploads/mercedes-classe-c.png";
  }
  if (titleLower.includes("a4") || (makeLower.includes("audi") && titleLower.includes("a4"))) {
    return "/uploads/audi-a4.png";
  }
  if (titleLower.includes("clio") || (makeLower.includes("renault") && titleLower.includes("clio"))) {
    return "/uploads/renault-clio.png";
  }
  if (titleLower.includes("transit") || (makeLower.includes("ford") && titleLower.includes("transit"))) {
    return "/uploads/ford-transit.png";
  }

  // Photos Unsplash par défaut selon la marque
  if (makeLower.includes("bmw")) {
    return "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop";
  }
  if (makeLower.includes("mercedes") || makeLower.includes("benz")) {
    return "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop";
  }
  if (makeLower.includes("audi")) {
    return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop";
  }
  if (makeLower.includes("volkswagen")) {
    return "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop";
  }
  if (makeLower.includes("tesla")) {
    return "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop";
  }
  if (makeLower.includes("renault")) {
    return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop";
  }
  if (makeLower.includes("peugeot")) {
    return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop";
  }
  if (makeLower.includes("ford")) {
    return "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop";
  }

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

  console.log("🚗 Création de 20 annonces de voitures récentes (2024-2026)...");

  // Récupérer l'utilisateur démo ou créer un utilisateur par défaut
  let demoUser = await prisma.user.findUnique({
    where: { email: "demo@autrust.local" },
  });

  if (!demoUser) {
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash("demo123", 10);
    demoUser = await prisma.user.create({
      data: {
        email: "demo@autrust.local",
        passwordHash,
        emailVerifiedAt: new Date(),
        phone: "+32 4 123 45 67",
        phoneVerifiedAt: new Date(),
      },
    });
  }

  // Liste de 20 voitures récentes (2024-2026)
  const recentCars = [
    {
      title: "BMW Série 1 118i",
      category: "VOITURE",
      mode: "SALE",
      price: 28900,
      year: 2024,
      km: 12000,
      city: "Bruxelles",
      description: "BMW Série 1 récente, très peu kilométrée, toutes options, garantie constructeur.",
      make: "BMW",
      model: "Série 1",
      fuel: "PETROL",
      gearbox: "AUTOMATIC",
      bodyType: "CITADINE",
    },
    {
      title: "Mercedes-Benz Classe A 200",
      category: "VOITURE",
      mode: "SALE",
      price: 32900,
      year: 2024,
      km: 15000,
      city: "Anvers",
      description: "Mercedes Classe A premium, finition AMG Line, garantie constructeur.",
      make: "Mercedes-Benz",
      model: "Classe A",
      fuel: "PETROL",
      gearbox: "AUTOMATIC",
      bodyType: "CITADINE",
    },
    {
      title: "Audi A3 Sportback 35 TFSI",
      category: "VOITURE",
      mode: "SALE",
      price: 31900,
      year: 2024,
      km: 18000,
      city: "Liège",
      description: "Audi A3 Sportback récente, équipement complet, S Line.",
      make: "Audi",
      model: "A3",
      fuel: "PETROL",
      gearbox: "AUTOMATIC",
      bodyType: "CITADINE",
    },
    {
      title: "Volkswagen Golf 8 1.5 TSI",
      category: "VOITURE",
      mode: "SALE",
      price: 26900,
      year: 2024,
      km: 20000,
      city: "Bruxelles",
      description: "Golf 8 récente, très bien équipée, toutes options, comme neuve.",
      make: "Volkswagen",
      model: "Golf",
      fuel: "PETROL",
      gearbox: "AUTOMATIC",
      bodyType: "CITADINE",
    },
    {
      title: "Tesla Model Y",
      category: "VOITURE",
      mode: "SALE",
      price: 45900,
      year: 2024,
      km: 25000,
      city: "Bruxelles",
      description: "Tesla Model Y électrique, Autopilot inclus, superchargeur rapide.",
      make: "Tesla",
      model: "Model Y",
      fuel: "ELECTRIC",
      gearbox: "AUTOMATIC",
      bodyType: "SUV",
    },
    {
      title: "BMW X1 xDrive20d",
      category: "VOITURE",
      mode: "SALE",
      price: 38900,
      year: 2024,
      km: 22000,
      city: "Gand",
      description: "BMW X1 SUV récent, diesel économique, xDrive, toutes options.",
      make: "BMW",
      model: "X1",
      fuel: "DIESEL",
      gearbox: "AUTOMATIC",
      bodyType: "SUV",
    },
    {
      title: "Mercedes-Benz Classe C 220d",
      category: "VOITURE",
      mode: "SALE",
      price: 42900,
      year: 2024,
      km: 19000,
      city: "Bruxelles",
      description: "Mercedes Classe C premium, diesel, finition AMG Line, garantie.",
      make: "Mercedes-Benz",
      model: "Classe C",
      fuel: "DIESEL",
      gearbox: "AUTOMATIC",
      bodyType: "BERLINE",
    },
    {
      title: "Audi Q3 35 TDI",
      category: "VOITURE",
      mode: "SALE",
      price: 39900,
      year: 2024,
      km: 21000,
      city: "Anvers",
      description: "Audi Q3 SUV compact, diesel, quattro, équipement complet.",
      make: "Audi",
      model: "Q3",
      fuel: "DIESEL",
      gearbox: "AUTOMATIC",
      bodyType: "SUV",
    },
    {
      title: "Peugeot 308 SW",
      category: "VOITURE",
      mode: "SALE",
      price: 24900,
      year: 2024,
      km: 28000,
      city: "Liège",
      description: "Peugeot 308 SW break récent, diesel économique, très bien équipé.",
      make: "Peugeot",
      model: "308",
      fuel: "DIESEL",
      gearbox: "MANUAL",
      bodyType: "BREAK",
    },
    {
      title: "Renault Clio E-Tech",
      category: "VOITURE",
      mode: "SALE",
      price: 22900,
      year: 2024,
      km: 15000,
      city: "Bruxelles",
      description: "Renault Clio hybride E-Tech, très économique, récente, garantie.",
      make: "Renault",
      model: "Clio",
      fuel: "HYBRID",
      gearbox: "AUTOMATIC",
      bodyType: "CITADINE",
    },
    {
      title: "BMW Série 3 320d",
      category: "VOITURE",
      mode: "SALE",
      price: 44900,
      year: 2025,
      km: 8000,
      city: "Bruxelles",
      description: "BMW Série 3 2025, très récente, très peu kilométrée, toutes options.",
      make: "BMW",
      model: "Série 3",
      fuel: "DIESEL",
      gearbox: "AUTOMATIC",
      bodyType: "BERLINE",
    },
    {
      title: "Mercedes-Benz GLA 200",
      category: "VOITURE",
      mode: "SALE",
      price: 36900,
      year: 2025,
      km: 10000,
      city: "Anvers",
      description: "Mercedes GLA SUV compact 2025, très récent, finition AMG Line.",
      make: "Mercedes-Benz",
      model: "GLA",
      fuel: "PETROL",
      gearbox: "AUTOMATIC",
      bodyType: "SUV",
    },
    {
      title: "Audi A4 Avant 40 TDI",
      category: "VOITURE",
      mode: "SALE",
      price: 41900,
      year: 2025,
      km: 12000,
      city: "Liège",
      description: "Audi A4 Avant break 2025, diesel, quattro, équipement premium.",
      make: "Audi",
      model: "A4",
      fuel: "DIESEL",
      gearbox: "AUTOMATIC",
      bodyType: "BREAK",
    },
    {
      title: "Volkswagen Tiguan 2.0 TDI",
      category: "VOITURE",
      mode: "SALE",
      price: 38900,
      year: 2025,
      km: 14000,
      city: "Bruxelles",
      description: "Volkswagen Tiguan SUV 2025, diesel, 4Motion, très bien équipé.",
      make: "Volkswagen",
      model: "Tiguan",
      fuel: "DIESEL",
      gearbox: "AUTOMATIC",
      bodyType: "SUV",
    },
    {
      title: "Tesla Model 3 Performance",
      category: "VOITURE",
      mode: "SALE",
      price: 49900,
      year: 2025,
      km: 9000,
      city: "Bruxelles",
      description: "Tesla Model 3 Performance 2025, électrique, très récente, Autopilot.",
      make: "Tesla",
      model: "Model 3",
      fuel: "ELECTRIC",
      gearbox: "AUTOMATIC",
      bodyType: "BERLINE",
    },
    {
      title: "BMW X5 xDrive30d",
      category: "VOITURE",
      mode: "SALE",
      price: 69900,
      year: 2025,
      km: 11000,
      city: "Gand",
      description: "BMW X5 SUV premium 2025, diesel, xDrive, toutes options, très récent.",
      make: "BMW",
      model: "X5",
      fuel: "DIESEL",
      gearbox: "AUTOMATIC",
      bodyType: "SUV",
    },
    {
      title: "Mercedes-Benz EQC 400",
      category: "VOITURE",
      mode: "SALE",
      price: 54900,
      year: 2025,
      km: 13000,
      city: "Bruxelles",
      description: "Mercedes EQC électrique 2025, SUV premium, très récent, garantie.",
      make: "Mercedes-Benz",
      model: "EQC",
      fuel: "ELECTRIC",
      gearbox: "AUTOMATIC",
      bodyType: "SUV",
    },
    {
      title: "Audi e-tron GT",
      category: "VOITURE",
      mode: "SALE",
      price: 89900,
      year: 2026,
      km: 5000,
      city: "Anvers",
      description: "Audi e-tron GT 2026, électrique premium, très récent, très peu kilométré.",
      make: "Audi",
      model: "e-tron GT",
      fuel: "ELECTRIC",
      gearbox: "AUTOMATIC",
      bodyType: "BERLINE",
    },
    {
      title: "Volkswagen ID.4",
      category: "VOITURE",
      mode: "SALE",
      price: 42900,
      year: 2026,
      km: 6000,
      city: "Liège",
      description: "Volkswagen ID.4 électrique 2026, SUV compact, très récent, garantie.",
      make: "Volkswagen",
      model: "ID.4",
      fuel: "ELECTRIC",
      gearbox: "AUTOMATIC",
      bodyType: "SUV",
    },
    {
      title: "Peugeot 3008 Hybrid",
      category: "VOITURE",
      mode: "SALE",
      price: 34900,
      year: 2026,
      km: 7000,
      city: "Bruxelles",
      description: "Peugeot 3008 hybride 2026, SUV compact, très récent, économique.",
      make: "Peugeot",
      model: "3008",
      fuel: "HYBRID",
      gearbox: "AUTOMATIC",
      bodyType: "SUV",
    },
  ];

  let createdCount = 0;

  for (const car of recentCars) {
    const photoUrl = getPhotoForVehicle(car.title, car.make, car.model, car.category);
    
    await prisma.listing.create({
      data: {
        ...car,
        sellerId: demoUser.id,
        status: "ACTIVE",
        contactName: "Vendeur démo",
        contactPhone: demoUser.phone,
        contactEmail: demoUser.email,
        photos: {
          create: [{
            url: photoUrl,
            order: 0,
          }],
        },
      },
    });

    console.log(`✅ Annonce créée: ${car.title} (${car.year}) - ${car.price}€`);
    createdCount++;
  }

  console.log(`\n🎉 ${createdCount} annonce(s) créée(s) avec succès !`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
