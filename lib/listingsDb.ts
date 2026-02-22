import type { BodyType, Listing as DbListing, ListingCategory } from "@prisma/client";
import type { BodyTypeSlug, CategorySlug, ListingCardModel } from "@/lib/listings";

export function dbCategoryFromSlug(slug: CategorySlug): ListingCategory {
  if (slug === "auto") return "VOITURE";
  if (slug === "moto") return "MOTO";
  return "UTILITAIRE";
}

export function dbBodyTypeFromSlug(slug: BodyTypeSlug): BodyType {
  if (slug === "citadine") return "CITADINE";
  if (slug === "suv") return "SUV";
  if (slug === "pick-up") return "PICKUP";
  if (slug === "cabriolet") return "CABRIOLET";
  if (slug === "monospace") return "MONOSPACE";
  if (slug === "berline") return "BERLINE";
  if (slug === "break") return "BREAK";
  return "COUPE";
}

export function labelFromDbCategory(category: ListingCategory) {
  if (category === "VOITURE") return "Voiture";
  if (category === "MOTO") return "Moto";
  return "Utilitaire";
}

export function toListingCardModelFromDb(
  listing: Pick<DbListing, "id" | "title" | "category" | "mode" | "price" | "year" | "km" | "city" | "isSponsored" | "make" | "model" | "displacementL"> & {
    photos?: Array<{ url: string; order: number }>;
  }
): ListingCardModel {
  return {
    id: listing.id,
    title: listing.title,
    categoryLabel: labelFromDbCategory(listing.category),
    mode: listing.mode,
    price: listing.price,
    year: listing.year,
    km: listing.km,
    city: listing.city,
    isSponsored: listing.isSponsored ?? false,
    photoUrl: listing.photos && listing.photos.length > 0 
      ? listing.photos.sort((a, b) => a.order - b.order)[0].url 
      : undefined,
    make: listing.make ?? undefined,
    model: listing.model ?? undefined,
    displacementL: listing.displacementL ?? undefined,
  };
}

