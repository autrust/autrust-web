import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { moderateListingInput } from "@/lib/moderation";
import { randomUUID } from "node:crypto";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { MAX_LISTINGS_PARTICULIER } from "@/lib/constants";

const CategorySchema = z.enum(["auto", "moto", "utilitaire", "VOITURE", "MOTO", "UTILITAIRE"]);
const FuelSchema = z.enum([
  "hybrid",
  "petrol",
  "diesel",
  "electric",
  "hydrogen",
  "lpg",
  "cng",
  "ethanol",
  "other",
]);
const GearboxSchema = z.enum(["manual", "automatic", "semi-automatic"]);
const ListingModeSchema = z.enum(["sale", "rent"]);

const VinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN invalide (17 caractères, sans I/O/Q).");

const VinDecodedSchema = z
  .object({
    vin: z.string().optional(),
    make: z.string().optional(),
    model: z.string().optional(),
    trim: z.string().optional(),
    year: z.number().int().optional(),
    bodyClass: z.string().optional(),
    vehicleType: z.string().optional(),
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
    transmissionSpeeds: z.number().int().optional(),
    driveType: z.string().optional(),
    doors: z.number().int().optional(),
    engineCylinders: z.number().int().optional(),
    engineHp: z.number().int().optional(),
    engineKw: z.number().int().optional(),
    engineModel: z.string().optional(),
    displacementL: z.string().optional(),
    plantCountry: z.string().optional(),
    plantCity: z.string().optional(),
    manufacturer: z.string().optional(),
    options: z.array(z.string()).optional(),
    raw: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

const CreateListingSchema = z.object({
  mode: ListingModeSchema.optional(),
  vin: VinSchema.optional(),
  bodyType: z
    .enum(["citadine", "suv", "pick-up", "cabriolet", "monospace", "berline", "break", "coupé"])
    .optional(),
  color: z.string().trim().min(2).max(40).optional(),
  fuel: FuelSchema.optional(),
  gearbox: GearboxSchema.optional(),
  powerKw: z.coerce.number().int().nonnegative().optional(),
  doors: z.coerce.number().int().nonnegative().optional(),
  seats: z.coerce.number().int().nonnegative().optional(),
  hasServiceBook: z.coerce.boolean().optional(),
  isNonSmoker: z.coerce.boolean().optional(),
  hasWarranty: z.coerce.boolean().optional(),
  isDamaged: z.coerce.boolean().optional(),
  hasCarVerticalVerification: z.coerce.boolean().optional(),
  title: z.string().min(8),
  description: z.string().min(20),
  category: CategorySchema,
  price: z.coerce.number().int().nonnegative(),
  year: z.coerce.number().int().min(1900).max(2100),
  km: z.coerce.number().int().nonnegative(),
  city: z.string().min(2),
  contactName: z.string().trim().min(2).max(80).optional(),
  contactPhone: z.string().trim().min(6).max(30).optional(),
  contactEmail: z.string().email().optional(),
  photoUrls: z.array(z.string().url()).max(15).optional(),
  vinDecoded: VinDecodedSchema.optional(),
  sellerOptions: z.array(z.string()).max(80).optional(),
  sellerOptionsNote: z.string().max(2000).optional(),
  firstRegistrationDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.null()])
    .optional(),
});

function toDbMode(input: z.infer<typeof ListingModeSchema> | undefined) {
  if (!input) return "SALE" as const;
  return input === "rent" ? ("RENT" as const) : ("SALE" as const);
}

function toDbCategory(input: z.infer<typeof CategorySchema>) {
  if (input === "auto") return "VOITURE";
  if (input === "moto") return "MOTO";
  if (input === "utilitaire") return "UTILITAIRE";
  return input;
}

function toDbBodyType(
  input:
    | "citadine"
    | "suv"
    | "pick-up"
    | "cabriolet"
    | "monospace"
    | "berline"
    | "break"
    | "coupé"
    | undefined
) {
  if (!input) return undefined;
  if (input === "citadine") return "CITADINE";
  if (input === "suv") return "SUV";
  if (input === "pick-up") return "PICKUP";
  if (input === "cabriolet") return "CABRIOLET";
  if (input === "monospace") return "MONOSPACE";
  if (input === "berline") return "BERLINE";
  if (input === "break") return "BREAK";
  return "COUPE";
}

function toDbFuel(input: z.infer<typeof FuelSchema> | undefined) {
  if (!input) return undefined;
  if (input === "hybrid") return "HYBRID";
  if (input === "petrol") return "PETROL";
  if (input === "diesel") return "DIESEL";
  if (input === "electric") return "ELECTRIC";
  if (input === "hydrogen") return "HYDROGEN";
  if (input === "lpg") return "LPG";
  if (input === "cng") return "CNG";
  if (input === "ethanol") return "ETHANOL";
  return "OTHER";
}

function toDbGearbox(input: z.infer<typeof GearboxSchema> | undefined) {
  if (!input) return undefined;
  if (input === "manual") return "MANUAL";
  if (input === "automatic") return "AUTOMATIC";
  return "SEMI_AUTOMATIC";
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() || undefined;
  const city = url.searchParams.get("city")?.trim() || undefined;
  const category = url.searchParams.get("category")?.trim() || undefined;

  function intParam(key: string) {
    const raw = url.searchParams.get(key);
    if (!raw) return undefined;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : undefined;
  }

  const minPrice = intParam("minPrice");
  const maxPrice = intParam("maxPrice");
  const minYear = intParam("minYear");
  const maxYear = intParam("maxYear");
  const maxKm = intParam("maxKm");

  const take = Math.min(Number.parseInt(url.searchParams.get("take") ?? "30", 10) || 30, 100);
  const skip = Number.parseInt(url.searchParams.get("skip") ?? "0", 10) || 0;

  const where: Prisma.ListingWhereInput = {
    status: "ACTIVE",
    ...(city ? { city: { contains: city } } : {}),
    ...(q
      ? {
          OR: [{ title: { contains: q } }, { description: { contains: q } }],
        }
      : {}),
  };

  if (category) {
    const parsed = CategorySchema.safeParse(category);
    if (parsed.success) {
      where.category = toDbCategory(parsed.data);
    }
  }

  const price: Prisma.IntFilter = {};
  if (minPrice !== undefined) price.gte = minPrice;
  if (maxPrice !== undefined) price.lte = maxPrice;
  if (Object.keys(price).length) where.price = price;

  const year: Prisma.IntFilter = {};
  if (minYear !== undefined) year.gte = minYear;
  if (maxYear !== undefined) year.lte = maxYear;
  if (Object.keys(year).length) where.year = year;

  if (maxKm !== undefined) where.km = { lte: maxKm };

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { photos: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({ items, total, take, skip });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { kyc: true },
  });
  if (!dbUser) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const okToSell =
    Boolean(dbUser.emailVerifiedAt) &&
    Boolean(dbUser.phoneVerifiedAt) &&
    dbUser.kyc?.status === "VERIFIED";
  if (!okToSell) return NextResponse.json({ error: "SELLER_NOT_VERIFIED" }, { status: 403 });

  // Contrôle particuliers : limite d'annonces pour éviter vente "pro" sans numéro de TVA
  const isParticulier = dbUser.profileType !== "CONCESSIONNAIRE";
  if (isParticulier && !isAdmin(user)) {
    const activeCount = await prisma.listing.count({
      where: {
        sellerId: user.id,
        status: "ACTIVE",
      },
    });
    if (activeCount >= MAX_LISTINGS_PARTICULIER) {
      await prisma.adminAlert.create({
        data: {
          type: "PARTICULIER_TOO_MANY_LISTINGS",
          userId: user.id,
          userEmail: dbUser.email,
          message: `Particulier a tenté de dépasser la limite (${activeCount} annonces actives, max ${MAX_LISTINGS_PARTICULIER}). Vérifier si activité pro sans numéro de TVA.`,
          metadata: { listingCount: activeCount, limit: MAX_LISTINGS_PARTICULIER },
        },
      });
      return NextResponse.json(
        {
          error: "PARTICULIER_LISTING_LIMIT",
          reason: `En tant que particulier, vous ne pouvez pas publier plus de ${MAX_LISTINGS_PARTICULIER} annonces actives. Pour vendre plus de véhicules, passez en compte professionnel (avec numéro de TVA) depuis Mon compte.`,
        },
        { status: 403 }
      );
    }
  }

  const json = await req.json().catch(() => null);
  const parsed = CreateListingSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "INVALID_INPUT", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const moderation = moderateListingInput({
    title: data.title,
    description: data.description,
    contactEmail: data.contactEmail ?? null,
    contactPhone: data.contactPhone ?? null,
  });
  if (!moderation.ok) {
    return NextResponse.json(
      { error: "REJECTED_BY_MODERATION", reason: moderation.reason },
      { status: 400 }
    );
  }

  const vin = data.vin;
  const decoded = data.vinDecoded;
  const decodedMatchesVin =
    !!vin && !!decoded?.vin ? decoded.vin.toUpperCase().trim() === vin.toUpperCase().trim() : true;
  const vinData =
    decoded && decodedMatchesVin && decoded.raw
      ? (JSON.parse(JSON.stringify(decoded.raw)) as Prisma.InputJsonValue)
      : undefined;
  const vinOptions =
    decoded && decodedMatchesVin && decoded.options?.length
      ? (decoded.options as unknown as Prisma.InputJsonValue)
      : undefined;

  const created = await prisma.listing.create({
    data: {
      manageToken: randomUUID(),
      sellerId: dbUser.id,
      title: data.title,
      description: data.description,
      category: toDbCategory(data.category),
      mode: toDbMode(data.mode),
      price: data.price,
      year: data.year,
      km: data.km,
      city: data.city,
      bodyType: toDbBodyType(data.bodyType),
      color: data.color,
      fuel: toDbFuel(data.fuel),
      gearbox: toDbGearbox(data.gearbox),
      powerKw: data.powerKw,
      doors: data.doors,
      seats: data.seats,
      hasServiceBook: data.hasServiceBook ?? false,
      isNonSmoker: data.isNonSmoker ?? false,
      hasWarranty: data.hasWarranty ?? false,
      isDamaged: data.isDamaged ?? false,
      hasCarVerticalVerification: data.hasCarVerticalVerification ?? false,
      sellerOptions: data.sellerOptions
        ? (data.sellerOptions as unknown as Prisma.InputJsonValue)
        : undefined,
      sellerOptionsNote: data.sellerOptionsNote,
      contactName: data.contactName,
      contactPhone: data.contactPhone,
      contactEmail: data.contactEmail ?? dbUser.email,
      vin,
      firstRegistrationDate:
        data.firstRegistrationDate != null && data.firstRegistrationDate !== ""
          ? new Date(data.firstRegistrationDate)
          : null,
      ...(decoded && decodedMatchesVin
        ? {
            make: decoded.make,
            model: decoded.model,
            trim: decoded.trim,
            bodyClass: decoded.bodyClass,
            vehicleType: decoded.vehicleType,
            fuelType: decoded.fuelType,
            transmission: decoded.transmission,
            transmissionSpeeds: decoded.transmissionSpeeds,
            driveType: decoded.driveType,
            doors: decoded.doors,
            engineCylinders: decoded.engineCylinders,
            engineHp: decoded.engineHp,
            engineModel: decoded.engineModel,
            displacementL: decoded.displacementL,
            plantCountry: decoded.plantCountry,
            plantCity: decoded.plantCity,
            manufacturer: decoded.manufacturer,
            vinData,
            vinOptions,
            vinDecodedAt: new Date(),
          }
        : {}),
      photos: data.photoUrls?.length
        ? {
            create: data.photoUrls.map((url, i) => ({
              url,
              order: i,
            })),
          }
        : undefined,
    },
    include: { photos: true },
  });

  return NextResponse.json(
    { id: created.id, manageToken: created.manageToken, listing: created },
    { status: 201 }
  );
}

