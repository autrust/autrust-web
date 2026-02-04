import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

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

  console.log("🎬 Création des données de démo...");

  // Créer un utilisateur de démo
  const passwordHash = await bcrypt.hash("demo123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@autrust.local" },
    update: {},
    create: {
      email: "demo@autrust.local",
      passwordHash,
      emailVerifiedAt: new Date(),
      phone: "+32 4 123 45 67",
      phoneVerifiedAt: new Date(),
      kyc: {
        create: {
          status: "VERIFIED",
          verifiedAt: new Date(),
        },
      },
    },
    include: { kyc: true },
  });

  console.log("✅ Utilisateur démo créé:", demoUser.email);

  // Créer un garage partenaire vérifié
  const garagePasswordHash = await bcrypt.hash("garage123", 10);
  const partnerGarage = await prisma.user.upsert({
    where: { email: "garage@autrust.local" },
    update: {},
    create: {
      email: "garage@autrust.local",
      passwordHash: garagePasswordHash,
      emailVerifiedAt: new Date(),
      phone: "+32 4 999 99 99",
      phoneVerifiedAt: new Date(),
      kyc: {
        create: {
          status: "VERIFIED",
          verifiedAt: new Date(),
        },
      },
    },
    include: { kyc: true },
  });

  console.log("✅ Garage partenaire créé:", partnerGarage.email);

  // Créer des annonces pour le garage
  const garageListings = await prisma.listing.findMany({
    where: { sellerId: partnerGarage.id },
  });

  // Créer 5 annonces sponsorisées de test
  const sponsoredListings = [
    {
      title: "Audi A4 Avant 2.0 TDI",
      category: "VOITURE",
      mode: "SALE",
      price: 24900,
      year: 2020,
      km: 65000,
      city: "Bruxelles",
      description: "Break premium en excellent état, toutes options, entretien chez Audi.",
      make: "Audi",
      model: "A4",
      fuel: "DIESEL",
      gearbox: "AUTOMATIC",
      bodyType: "BREAK",
      photoUrls: [
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format&q=80",
      ],
    },
    {
      title: "Mercedes-Benz Classe C 220d",
      category: "VOITURE",
      mode: "SALE",
      price: 32900,
      year: 2021,
      km: 42000,
      city: "Anvers",
      description: "Berline premium diesel, finition AMG Line, garantie constructeur.",
      make: "Mercedes-Benz",
      model: "Classe C",
      fuel: "DIESEL",
      gearbox: "AUTOMATIC",
      bodyType: "BERLINE",
      photoUrls: [
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&auto=format&q=80",
      ],
    },
    {
      title: "BMW Série 3 Touring 320d",
      category: "VOITURE",
      mode: "SALE",
      price: 28900,
      year: 2019,
      km: 78000,
      city: "Liège",
      description: "Break sportif, xDrive, équipement complet, première main.",
      make: "BMW",
      model: "Série 3",
      fuel: "DIESEL",
      gearbox: "AUTOMATIC",
      bodyType: "BREAK",
      photoUrls: [
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&auto=format&q=80",
      ],
    },
    {
      title: "Volkswagen Golf 8 GTI",
      category: "VOITURE",
      mode: "SALE",
      price: 34900,
      year: 2022,
      km: 18000,
      city: "Bruxelles",
      description: "GTI récente, très peu kilométrée, comme neuve, toutes options.",
      make: "Volkswagen",
      model: "Golf",
      fuel: "PETROL",
      gearbox: "MANUAL",
      bodyType: "CITADINE",
      photoUrls: [
        "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=600&fit=crop",
      ],
    },
    {
      title: "Tesla Model 3",
      category: "VOITURE",
      mode: "SALE",
      price: 38900,
      year: 2021,
      km: 35000,
      city: "Bruxelles",
      description: "Électrique, Autopilot inclus, superchargeur rapide, garantie Tesla.",
      make: "Tesla",
      model: "Model 3",
      fuel: "ELECTRIC",
      gearbox: "AUTOMATIC",
      bodyType: "BERLINE",
      photoUrls: [
        "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop&auto=format&q=80",
      ],
    },
  ];

  // Supprimer les anciennes annonces sponsorisées de test
  await prisma.listing.deleteMany({
    where: {
      isSponsored: true,
      title: { in: sponsoredListings.map(l => l.title) },
    },
  });

  // Créer les 5 annonces sponsorisées avec photos
  const now = new Date();
  for (const listing of sponsoredListings) {
    const { photoUrls, ...listingData } = listing;
    const sponsoredUntil = new Date(now);
    sponsoredUntil.setDate(sponsoredUntil.getDate() + 30); // 30 jours de sponsoring
    
    await prisma.listing.create({
      data: {
        ...listingData,
        sellerId: demoUser.id,
        isSponsored: true,
        sponsoredUntil: sponsoredUntil,
        status: "ACTIVE",
        contactName: "Vendeur sponsorisé",
        contactPhone: "+32 4 123 45 67",
        contactEmail: demoUser.email,
        photos: photoUrls && photoUrls.length > 0
          ? {
              create: photoUrls.map((url, i) => ({
                url,
                order: i,
              })),
            }
          : undefined,
      },
    });
  }

  console.log("✅ 5 annonces sponsorisées avec photos créées");

  if (garageListings.length === 0) {
    // Créer une annonce normale pour le garage
    await prisma.listing.create({
      data: {
        sellerId: partnerGarage.id,
        title: "Mercedes Classe A 180",
        category: "VOITURE",
        mode: "SALE",
        price: 18900,
        year: 2020,
        km: 45000,
        city: "Bruxelles",
        description: "Garage partenaire vérifié. Voiture en excellent état.",
        contactName: "Garage Auto",
        contactPhone: partnerGarage.phone,
        contactEmail: partnerGarage.email,
      },
    });
    console.log("✅ Annonce du garage créée");

    // Créer des annonces sponsorisées pour le garage
    const garageSponsoredListings = [
      {
        title: "BMW Série 3 320d",
        category: "VOITURE",
        mode: "SALE",
        price: 24900,
        year: 2021,
        km: 32000,
        city: "Bruxelles",
        description: "Annonce sponsorisée - Garage partenaire vérifié. BMW en parfait état, toutes options.",
        photoUrls: [
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
        ],
      },
      {
        title: "Audi A4 Avant 2.0 TDI",
        category: "VOITURE",
        mode: "SALE",
        price: 22900,
        year: 2020,
        km: 55000,
        city: "Bruxelles",
        description: "Annonce sponsorisée - Break Audi avec historique complet, carnet d'entretien à jour.",
        photoUrls: [
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
        ],
      },
      {
        title: "Volkswagen Transporter T6",
        category: "UTILITAIRE",
        mode: "SALE",
        price: 28900,
        year: 2019,
        km: 89000,
        city: "Bruxelles",
        description: "Annonce sponsorisée - Utilitaire professionnel, idéal pour entreprise.",
        photoUrls: [
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
        ],
      },
    ];

    const now = new Date();
    for (const listingData of garageSponsoredListings) {
      const { photoUrls, ...listingFields } = listingData;
      const sponsoredUntil = new Date(now);
      sponsoredUntil.setDate(sponsoredUntil.getDate() + 30); // 30 jours
      
      await prisma.listing.create({
        data: {
          ...listingFields,
          sellerId: partnerGarage.id,
          isSponsored: true,
          sponsoredUntil: sponsoredUntil,
          contactName: "Garage Auto",
          contactPhone: partnerGarage.phone,
          contactEmail: partnerGarage.email,
          photos: photoUrls && photoUrls.length > 0
            ? {
                create: photoUrls.map((url, i) => ({
                  url,
                  order: i,
                })),
              }
            : undefined,
        },
      });
    }
    console.log(`✅ ${garageSponsoredListings.length} annonces sponsorisées du garage créées`);
  }

  // Créer 5 annonces sponsorisées supplémentaires pour l'utilisateur démo
  const existingSponsored = await prisma.listing.findMany({
    where: {
      sellerId: demoUser.id,
      isSponsored: true,
    },
  });

  if (existingSponsored.length < 5) {
    const sponsoredListings = [
      {
        title: "Audi A4 Avant 2.0 TDI",
        category: "VOITURE",
        mode: "SALE",
        price: 24900,
        year: 2020,
        km: 65000,
        city: "Bruxelles",
        description: "Break premium en excellent état, toutes options, entretien chez Audi.",
        make: "Audi",
        model: "A4",
        fuel: "DIESEL",
        gearbox: "AUTOMATIC",
        bodyType: "BREAK",
        photoUrls: [
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop&auto=format&q=80",
        ],
      },
      {
        title: "Mercedes-Benz Classe C 220d",
        category: "VOITURE",
        mode: "SALE",
        price: 32900,
        year: 2021,
        km: 42000,
        city: "Anvers",
        description: "Berline premium diesel, finition AMG Line, garantie constructeur.",
        make: "Mercedes-Benz",
        model: "Classe C",
        fuel: "DIESEL",
        gearbox: "AUTOMATIC",
        bodyType: "BERLINE",
        photoUrls: [
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop&auto=format&q=80",
        ],
      },
      {
        title: "BMW Série 3 Touring 320d",
        category: "VOITURE",
        mode: "SALE",
        price: 28900,
        year: 2019,
        km: 78000,
        city: "Liège",
        description: "Break sportif, xDrive, équipement complet, première main.",
        make: "BMW",
        model: "Série 3",
        fuel: "DIESEL",
        gearbox: "AUTOMATIC",
        bodyType: "BREAK",
        photoUrls: [
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop&auto=format&q=80",
        ],
      },
      {
      title: "Volkswagen Golf 8 GTI",
      category: "VOITURE",
      mode: "SALE",
      price: 34900,
      year: 2022,
      km: 18000,
      city: "Bruxelles",
      description: "GTI récente, très peu kilométrée, comme neuve, toutes options.",
      make: "Volkswagen",
      model: "Golf",
      fuel: "PETROL",
      gearbox: "MANUAL",
      bodyType: "CITADINE",
        photoUrls: [
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
        ],
      },
      {
        title: "Tesla Model 3",
        category: "VOITURE",
        mode: "SALE",
        price: 38900,
        year: 2021,
        km: 35000,
        city: "Bruxelles",
        description: "Électrique, Autopilot inclus, superchargeur rapide, garantie Tesla.",
        make: "Tesla",
        model: "Model 3",
        fuel: "ELECTRIC",
        gearbox: "AUTOMATIC",
        bodyType: "BERLINE",
        photoUrls: [
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop&auto=format&q=80",
        ],
      },
    ];

    const now = new Date();
    for (const listingData of sponsoredListings) {
      const { photoUrls, ...listingFields } = listingData;
      const sponsoredUntil = new Date(now);
      sponsoredUntil.setDate(sponsoredUntil.getDate() + 30); // 30 jours de sponsoring
      
      await prisma.listing.create({
        data: {
          ...listingFields,
          sellerId: demoUser.id,
          isSponsored: true,
          sponsoredUntil: sponsoredUntil,
          status: "ACTIVE",
          contactName: "Vendeur sponsorisé",
          contactPhone: demoUser.phone,
          contactEmail: demoUser.email,
          photos: photoUrls && photoUrls.length > 0
            ? {
                create: photoUrls.map((url, i) => ({
                  url,
                  order: i,
                })),
              }
            : undefined,
        },
      });
    }
    console.log(`✅ 5 annonces sponsorisées créées pour l'utilisateur démo`);
  }

  // Récupérer toutes les annonces
  const allListings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    take: 10,
  });

  // Créer des favoris pour l'utilisateur démo
  const existingFavorites = await prisma.favorite.findMany({
    where: { userId: demoUser.id },
  });

  if (existingFavorites.length === 0 && allListings.length > 0) {
    // Ajouter les 2 premières annonces aux favoris
    for (const listing of allListings.slice(0, 2)) {
      await prisma.favorite.create({
        data: {
          userId: demoUser.id,
          listingId: listing.id,
        },
      });
    }
    console.log("✅ Favoris créés");
  }

  // Créer des recherches sauvegardées pour l'utilisateur démo
  const existingSearches = await prisma.savedSearch.findMany({
    where: { userId: demoUser.id },
  });

  if (existingSearches.length === 0) {
    // Recherche 1: BMW
    await prisma.savedSearch.create({
      data: {
        userId: demoUser.id,
        name: "BMW série 3",
        filters: {
          q: "BMW",
          category: "auto",
        },
        lastCheckedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 1 jour
        newListingsCount: 2, // 2 nouvelles annonces
      },
    });

    // Recherche 2: Voitures à Bruxelles
    await prisma.savedSearch.create({
      data: {
        userId: demoUser.id,
        name: "Voitures à Bruxelles",
        filters: {
          category: "auto",
          city: "Bruxelles",
        },
        lastCheckedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // Il y a 12h
        newListingsCount: 1, // 1 nouvelle annonce
      },
    });

    // Recherche 3: Location
    await prisma.savedSearch.create({
      data: {
        userId: demoUser.id,
        name: "Véhicules en location",
        filters: {
          mode: "rent",
        },
        lastCheckedAt: new Date(),
        newListingsCount: 0,
      },
    });

    console.log("✅ Recherches sauvegardées créées (3 recherches)");
  }

  console.log("\n🎉 Démo prête !");
  console.log("\n📝 Comptes de démo :");
  console.log("  👤 Utilisateur: demo@autrust.local / demo123");
  console.log("  🏢 Garage: garage@autrust.local / garage123");
  console.log("\n✨ Fonctionnalités à tester :");
  console.log("  ❤️  Favoris : Connecte-toi et va sur /favoris");
  console.log("  ⭐ Recherches : Va sur /recherches pour voir tes recherches sauvegardées");
  console.log("  🏢 Garages : Va sur /garages pour voir les garages partenaires");
  console.log("  🔍 Sauvegarder une recherche : Va sur /listings, filtre, puis clique sur 'Sauvegarder cette recherche'");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
