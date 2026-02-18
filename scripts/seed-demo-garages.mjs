import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const PLANS = ["START", "PRO", "ELITE", "ENTERPRISE"];
const CITIES = ["Bruxelles", "Liège", "Anvers", "Gand", "Charleroi", "Namur", "Mons", "Louvain", "Bruges", "Malines"];
const BODY_TYPES = ["BERLINE", "SUV", "CITADINE", "BREAK", "MONOSPACE"];
const FUELS = ["DIESEL", "PETROL", "HYBRID", "ELECTRIC"];
const GEARBOXES = ["MANUAL", "AUTOMATIC"];

const CAR_TEMPLATES = [
  { make: "Volkswagen", models: ["Golf", "Polo", "Passat", "T-Roc", "Tiguan"] },
  { make: "BMW", models: ["Série 1", "Série 3", "Série 5", "X1", "X3"] },
  { make: "Mercedes-Benz", models: ["Classe A", "Classe C", "Classe E", "GLA", "GLC"] },
  { make: "Audi", models: ["A3", "A4", "A6", "Q3", "Q5"] },
  { make: "Renault", models: ["Clio", "Megane", "Captur", "Kadjar", "Scenic"] },
  { make: "Peugeot", models: ["208", "308", "3008", "5008", "2008"] },
  { make: "Ford", models: ["Fiesta", "Focus", "Puma", "Kuga", "Mondeo"] },
  { make: "Toyota", models: ["Yaris", "Corolla", "C-HR", "RAV4", "Aygo"] },
  { make: "Opel", models: ["Corsa", "Astra", "Mokka", "Grandland", "Insignia"] },
  { make: "Hyundai", models: ["i20", "i30", "Tucson", "Kona", "Kauai"] },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  const dbPath = connectionString.startsWith("file:")
    ? connectionString.replace("file:", "")
    : connectionString;
  const sqlite = new Database(dbPath);
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  const prisma = new PrismaClient({ adapter });

  console.log("🏢 Création de 10 garages démo avec véhicules et ventes...\n");

  const passwordHash = await bcrypt.hash("demo123", 10);

  for (let i = 1; i <= 10; i++) {
    const email = `garage${i}@demo.autrust.local`;
    const phone = `+32 4 100 00 ${String(i).padStart(2, "0")}`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        emailVerifiedAt: new Date(),
        phone,
        phoneVerifiedAt: new Date(),
        profileType: "CONCESSIONNAIRE",
        vatNumber: `BE0${900000000 + i}${String(i).padStart(2, "0")}`,
        selectedPlan: pick(PLANS),
        maxListings: pick([14, 30, 60, 120]),
      },
    });

    const existingCount = await prisma.listing.count({ where: { sellerId: user.id } });
    if (existingCount > 0) {
      console.log(`  Garage ${i} (${email}) : déjà ${existingCount} annonces, ignoré.`);
      continue;
    }

    const numActive = rand(2, 5);
    const numSold = rand(1, 4);
    const totalListings = numActive + numSold;

    for (let j = 0; j < totalListings; j++) {
      const isSold = j < numSold;
      const tpl = pick(CAR_TEMPLATES);
      const model = pick(tpl.models);
      const year = rand(2018, 2024);
      const km = rand(15000, 180000);
      const price = rand(8000, 45000);
      const title = `${tpl.make} ${model} ${year}`;
      const description = `Véhicule d'exposition garage démo. ${tpl.make} ${model} en très bon état, entretien à jour. Première main.`;

      await prisma.listing.create({
        data: {
          sellerId: user.id,
          title,
          description,
          category: "VOITURE",
          mode: "SALE",
          price,
          year,
          km,
          city: pick(CITIES),
          status: isSold ? "SOLD" : "ACTIVE",
          bodyType: pick(BODY_TYPES),
          fuel: pick(FUELS),
          gearbox: pick(GEARBOXES),
          make: tpl.make,
          model,
          contactName: `Garage démo ${i}`,
          contactPhone: phone,
          contactEmail: email,
        },
      });
    }

    console.log(`  ✅ Garage ${i} : ${email} — ${numActive} en ligne, ${numSold} vendues`);
  }

  const totalGarages = await prisma.user.count({ where: { profileType: "CONCESSIONNAIRE" } });
  const totalListings = await prisma.listing.count();
  const activeListings = await prisma.listing.count({ where: { status: "ACTIVE" } });
  const soldListings = await prisma.listing.count({ where: { status: "SOLD" } });

  console.log("\n📊 Bilan :");
  console.log(`   ${totalGarages} garage(s) professionnel(s)`);
  console.log(`   ${totalListings} annonces au total (${activeListings} actives, ${soldListings} vendues)`);
  console.log("\n🔑 Connexion : garage1@demo.autrust.local … garage10@demo.autrust.local / demo123");
  console.log("   Page admin : onglet Garages pour voir le listing.\n");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
