import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

async function testConnection() {
  console.log("🔍 Test de connexion à SQLite...\n");

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL n'est pas définie dans .env");
    process.exit(1);
  }

  try {
    // L'adapter attend l'URL directement
    const adapter = new PrismaBetterSqlite3({
      url: connectionString,
    });
    const prisma = new PrismaClient({ adapter });

    // Test simple de connexion
    await prisma.$connect();
    console.log("✅ Connexion réussie !\n");

    // Vérification des tables
    console.log("📊 Vérification des tables...");
    const tables = await prisma.$queryRaw`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;
    `;
    
    if (Array.isArray(tables) && tables.length > 0) {
      console.log(`✅ ${tables.length} table(s) trouvée(s):`);
      tables.forEach((table) => {
        console.log(`   - ${table.name}`);
      });
    } else {
      console.log("⚠️  Aucune table trouvée. Lance 'npm run db:push' pour créer les tables.");
    }

    await prisma.$disconnect();
    console.log("\n✅ Test terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur de connexion :\n");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("\n💡 Vérifie que:");
    console.error("   - Le fichier .env contient DATABASE_URL=\"file:./dev.db\"");
    console.error("   - Tu as les permissions d'écriture dans le dossier du projet");
    process.exit(1);
  }
}

testConnection();
