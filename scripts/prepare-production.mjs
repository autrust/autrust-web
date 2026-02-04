#!/usr/bin/env node
/**
 * Script pour préparer le projet pour la production (PostgreSQL)
 * 
 * Usage:
 *   node scripts/prepare-production.mjs
 * 
 * Ce script:
 * 1. Vérifie que DATABASE_URL pointe vers PostgreSQL
 * 2. Met à jour prisma/schema.prisma pour utiliser postgresql
 * 3. Génère le client Prisma
 */

import { readFileSync, writeFileSync } from "fs";
import "dotenv/config";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL n'est pas défini dans .env");
  process.exit(1);
}

const isPostgres = DATABASE_URL.startsWith("postgresql://") || DATABASE_URL.startsWith("postgres://");

if (!isPostgres) {
  console.log("ℹ️  DATABASE_URL pointe vers SQLite (développement local)");
  console.log("   Pour la production, configure DATABASE_URL avec une URL PostgreSQL");
  console.log("   Exemple: postgresql://user:password@host:5432/dbname");
  process.exit(0);
}

console.log("✅ DATABASE_URL pointe vers PostgreSQL");

// Lire schema.prisma
const schemaPath = "prisma/schema.prisma";
let schema = readFileSync(schemaPath, "utf-8");

// Vérifier si c'est déjà PostgreSQL
if (schema.includes('provider = "postgresql"')) {
  console.log("✅ schema.prisma est déjà configuré pour PostgreSQL");
} else if (schema.includes('provider = "sqlite"')) {
  console.log("📝 Mise à jour de schema.prisma pour PostgreSQL...");
  schema = schema.replace(
    /datasource db \{\s*provider = "sqlite"\s*\}/s,
    `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`
  );
  schema = schema.replace(/\/\/ SQLite pour le développement local/g, "// PostgreSQL (production)");
  writeFileSync(schemaPath, schema);
  console.log("✅ schema.prisma mis à jour");
} else {
  console.warn("⚠️  Provider de base de données non détecté dans schema.prisma");
}

console.log("\n✅ Schema prêt pour PostgreSQL.");
console.log("   La commande 'npm run build' fera prisma generate + next build.");
