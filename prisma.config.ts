import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mjs",
  },
  // Prisma ORM v7: l’URL est configurée ici (pas dans schema.prisma)
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});

