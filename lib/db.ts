import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Détecte automatiquement SQLite ou PostgreSQL selon l'URL
  const isPostgres = connectionString.startsWith("postgresql://") || connectionString.startsWith("postgres://");
  
  if (isPostgres) {
    try {
      const { PrismaPg } = require("@prisma/adapter-pg");
      const adapter = new PrismaPg({ connectionString });
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    } catch (error) {
      console.error("PostgreSQL adapter not found. Install: npm install @prisma/adapter-pg");
      throw error;
    }
  } else {
    // SQLite (développement local)
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    
    const adapter = new PrismaBetterSqlite3({
      url: connectionString,
    });

    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

