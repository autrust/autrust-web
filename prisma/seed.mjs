import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  const demo = [
    {
      title: "BMW X3 xDrive 20d",
      category: "VOITURE",
      mode: "SALE",
      price: 28900,
      year: 2019,
      km: 98000,
      city: "Liège",
      description: "SUV diesel bien entretenu, première main, carnet complet.",
      contactName: "Vendeur démo",
      contactPhone: "+32 4 000 00 00",
      contactEmail: "demo@autrust.local",
      photoUrls: [],
    },
    {
      title: "Volkswagen Golf 7 1.6 TDI",
      category: "VOITURE",
      mode: "SALE",
      price: 12900,
      year: 2017,
      km: 156000,
      city: "Bruxelles",
      description: "Très économique, parfait pour la ville.",
      contactName: "Vendeur démo",
      contactPhone: "+32 2 000 00 00",
      contactEmail: "demo@autrust.local",
      photoUrls: [],
    },
    {
      title: "Yamaha MT-07",
      category: "MOTO",
      mode: "SALE",
      price: 6200,
      year: 2020,
      km: 18000,
      city: "Anvers",
      description: "Moto nerveuse et légère, idéale permis A2.",
      contactName: "Vendeur démo",
      contactPhone: "+32 3 000 00 00",
      contactEmail: "demo@autrust.local",
      photoUrls: [],
    },
    {
      title: "Renault Clio (Location)",
      category: "VOITURE",
      mode: "RENT",
      price: 45,
      year: 2021,
      km: 42000,
      city: "Bruxelles",
      description: "Location à la journée. Citadine économique, idéale pour la ville.",
      contactName: "Loueur démo",
      contactPhone: "+32 2 111 11 11",
      contactEmail: "location@autrust.local",
      photoUrls: [],
    },
    {
      title: "Ford Transit (Location)",
      category: "UTILITAIRE",
      mode: "RENT",
      price: 79,
      year: 2020,
      km: 88000,
      city: "Liège",
      description: "Utilitaire en location à la journée. Parfait pour un déménagement.",
      contactName: "Loueur démo",
      contactPhone: "+32 4 222 22 22",
      contactEmail: "location@autrust.local",
      photoUrls: [],
    },
  ];

  await prisma.listingPhoto.deleteMany();
  await prisma.listing.deleteMany();

  for (const l of demo) {
    await prisma.listing.create({
      data: {
        title: l.title,
        description: l.description,
        category: l.category,
        mode: l.mode,
        price: l.price,
        year: l.year,
        km: l.km,
        city: l.city,
        contactName: l.contactName,
        contactPhone: l.contactPhone,
        contactEmail: l.contactEmail,
        photos: l.photoUrls.length
          ? {
              create: l.photoUrls.map((url, i) => ({ url, order: i })),
            }
          : undefined,
      },
    });
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

