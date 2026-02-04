export const CAR_BRANDS = [
  // Marques populaires
  { name: "Audi", slug: "audi" },
  { name: "BMW", slug: "bmw" },
  { name: "Mercedes-Benz", slug: "mercedes-benz" },
  { name: "Volkswagen", slug: "volkswagen" },
  { name: "Toyota", slug: "toyota" },
  { name: "Ford", slug: "ford" },
  { name: "Peugeot", slug: "peugeot" },
  { name: "Renault", slug: "renault" },
  { name: "Opel", slug: "opel" },
  { name: "Citroën", slug: "citroen" },
  { name: "Hyundai", slug: "hyundai" },
  { name: "Kia", slug: "kia" },
  { name: "Skoda", slug: "skoda" },
  { name: "Seat", slug: "seat" },
  { name: "Nissan", slug: "nissan" },
  { name: "Volvo", slug: "volvo" },
  { name: "Fiat", slug: "fiat" },
  { name: "Mazda", slug: "mazda" },
  { name: "Honda", slug: "honda" },
  { name: "Suzuki", slug: "suzuki" },
  { name: "Mitsubishi", slug: "mitsubishi" },
  { name: "Subaru", slug: "subaru" },
  { name: "Dacia", slug: "dacia" },
  { name: "Mini", slug: "mini" },
  { name: "Smart", slug: "smart" },
  { name: "Alfa Romeo", slug: "alfa-romeo" },
  { name: "Jeep", slug: "jeep" },
  { name: "Land Rover", slug: "land-rover" },
  { name: "Jaguar", slug: "jaguar" },
  { name: "Porsche", slug: "porsche" },
  { name: "Tesla", slug: "tesla" },
  { name: "Lexus", slug: "lexus" },
  { name: "DS Automobiles", slug: "ds-automobiles" },
  { name: "Cupra", slug: "cupra" },
  { name: "MG", slug: "mg" },
] as const;

export type CarBrandSlug = (typeof CAR_BRANDS)[number]["slug"];

export function getBrandNameFromSlug(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  const brand = CAR_BRANDS.find((b) => b.slug === slug);
  return brand?.name;
}

export function getBrandSlugFromName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  const brand = CAR_BRANDS.find((b) => b.name.toLowerCase() === name.toLowerCase());
  return brand?.slug;
}
