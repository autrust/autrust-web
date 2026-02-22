export const CATEGORY_OPTIONS = [
  { slug: "auto", label: "Auto", value: "Voiture" as const },
  { slug: "moto", label: "Moto", value: "Moto" as const },
  { slug: "utilitaire", label: "Utilitaire", value: "Utilitaire" as const },
] as const;

/** Pays pour le filtre recherche (code ISO) */
export const COUNTRY_OPTIONS = [
  { code: "BE", label: "Belgique" },
  { code: "FR", label: "France" },
  { code: "NL", label: "Pays-Bas" },
  { code: "LU", label: "Luxembourg" },
  { code: "DE", label: "Allemagne" },
  { code: "CH", label: "Suisse" },
] as const;

export const BODY_TYPE_OPTIONS = [
  { slug: "citadine", label: "Citadine" },
  { slug: "suv", label: "SUV" },
  { slug: "pick-up", label: "Pick-up" },
  { slug: "cabriolet", label: "Cabriolet" },
  { slug: "monospace", label: "Monospace" },
  { slug: "berline", label: "Berline" },
  { slug: "break", label: "Break" },
  { slug: "coupé", label: "Coupé" },
] as const;

export type CategorySlug = (typeof CATEGORY_OPTIONS)[number]["slug"];
export type VehicleCategory = (typeof CATEGORY_OPTIONS)[number]["value"];
export type BodyTypeSlug = (typeof BODY_TYPE_OPTIONS)[number]["slug"];

export type Listing = {
  id: string;
  title: string;
  category: VehicleCategory;
  mode?: "SALE" | "RENT";
  price: number;
  year: number;
  km: number;
  city: string;
  description: string;
  images?: string[];
  make?: string | null;
  model?: string | null;
  displacementL?: string | null;
};

export type ListingCardModel = {
  id: string;
  title: string;
  categoryLabel: string;
  mode?: "SALE" | "RENT";
  price: number;
  year: number;
  km: number;
  city: string;
  isSponsored?: boolean;
  photoUrl?: string; // URL de la première photo
  make?: string | null;
  model?: string | null;
  displacementL?: string | null;
};

export function toListingCardModel(listing: Listing): ListingCardModel {
  return {
    id: listing.id,
    title: listing.title,
    categoryLabel: listing.category,
    mode: listing.mode ?? "SALE",
    price: listing.price,
    year: listing.year,
    km: listing.km,
    city: listing.city,
    isSponsored: false,
    make: listing.make ?? undefined,
    model: listing.model ?? undefined,
    displacementL: listing.displacementL ?? undefined,
  };
}

export const demoListings: Listing[] = [
  {
    id: "1",
    title: "BMW X3 xDrive 20d",
    category: "Voiture",
    mode: "SALE",
    price: 28900,
    year: 2019,
    km: 98000,
    city: "Liège",
    description: "SUV diesel bien entretenu, première main, carnet complet.",
    images: [],
  },
  {
    id: "2",
    title: "Volkswagen Golf 7 1.6 TDI",
    category: "Voiture",
    mode: "SALE",
    price: 12900,
    year: 2017,
    km: 156000,
    city: "Bruxelles",
    description: "Très économique, parfait pour la ville.",
    images: [],
  },
  {
    id: "3",
    title: "Yamaha MT-07",
    category: "Moto",
    mode: "SALE",
    price: 6200,
    year: 2020,
    km: 18000,
    city: "Anvers",
    description: "Moto nerveuse et légère, idéale permis A2.",
    images: [],
  },
];

export function formatPriceEUR(n: number) {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export type SearchParams = Record<string, string | string[] | undefined>;

function firstString(v: string | string[] | undefined) {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

function allStrings(v: string | string[] | undefined) {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v;
  return [];
}

function toInt(v: string | undefined) {
  if (!v) return undefined;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

function normalize(s: string) {
  return s
    .trim()
    .toLocaleLowerCase("fr-BE")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export type ListingFilters = {
  q?: string;
  categorySlug?: CategorySlug;
  category?: VehicleCategory;
  bodyTypeSlug?: BodyTypeSlug;
  options?: string[];
  fuel?: string;
  gearbox?: string;
  minPowerKw?: number;
  maxPowerKw?: number;
  doors?: number;
  seats?: number;
  hasServiceBook?: boolean;
  isNonSmoker?: boolean;
  hasWarranty?: boolean;
  isDamaged?: boolean;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minKm?: number;
  maxKm?: number;
  sellerId?: string;
  sponsored?: boolean;
  make?: string;
  model?: string;
  country?: string;
  mode?: "SALE" | "RENT" | "ALL";
  sort?: string;
  page?: number;
  perPage?: number;
  radiusKm?: number;
  /** yes = déjà immatriculé, no = pas encore immatriculé */
  registered?: "yes" | "no";
  minRegistrationYear?: number;
  maxRegistrationYear?: number;
};

export function categoryFromSlug(slug: string | undefined): VehicleCategory | undefined {
  if (!slug) return undefined;
  const found = CATEGORY_OPTIONS.find((c) => c.slug === slug);
  return found?.value;
}

export function parseListingFilters(searchParams: SearchParams): ListingFilters {
  const categorySlugRaw = firstString(searchParams.category);
  const categorySlug = CATEGORY_OPTIONS.some((c) => c.slug === categorySlugRaw)
    ? (categorySlugRaw as CategorySlug)
    : undefined;
  const category = categoryFromSlug(categorySlug);

  const bodyTypeSlugRaw = firstString(searchParams.bodyType);
  const bodyTypeSlug = BODY_TYPE_OPTIONS.some((b) => b.slug === bodyTypeSlugRaw)
    ? (bodyTypeSlugRaw as BodyTypeSlug)
    : undefined;

  const q = firstString(searchParams.q)?.trim();
  const city = firstString(searchParams.city)?.trim();
  const options = allStrings(searchParams.option)
    .map((s) => s.trim())
    .filter(Boolean);

  const electricOnly = firstString(searchParams.electric);
  const fuelFromSelect = firstString(searchParams.fuel)?.trim();
  const fuel = electricOnly ? "electric" : (fuelFromSelect ? fuelFromSelect : undefined);
  const gearbox = firstString(searchParams.gearbox)?.trim();
  const doors = toInt(firstString(searchParams.doors));
  const seats = toInt(firstString(searchParams.seats));

  function toBool(v: string | undefined) {
    if (!v) return undefined;
    const s = v.trim().toLowerCase();
    if (s === "1" || s === "true" || s === "on" || s === "yes") return true;
    if (s === "0" || s === "false" || s === "off" || s === "no") return false;
    return undefined;
  }

  const sellerId = firstString(searchParams.sellerId)?.trim();
  const sponsored = toBool(firstString(searchParams.sponsored));
  const make = firstString(searchParams.make)?.trim();
  const model = firstString(searchParams.model)?.trim();
  const country = firstString(searchParams.country)?.trim();
  const modeRaw = firstString(searchParams.mode)?.trim().toUpperCase();
  const mode = modeRaw === "SALE" || modeRaw === "RENT" || modeRaw === "ALL" ? modeRaw : undefined;
  const sort = firstString(searchParams.sort)?.trim() || undefined;
  const pageRaw = toInt(firstString(searchParams.page));
  const page = pageRaw !== undefined && pageRaw >= 1 ? pageRaw : 1;
  const perPageRaw = toInt(firstString(searchParams.perPage));
  const perPage = perPageRaw !== undefined && perPageRaw >= 1 && perPageRaw <= 50 ? perPageRaw : 12;
  const radiusKmRaw = toInt(firstString(searchParams.radiusKm));
  const radiusKm = radiusKmRaw !== undefined && [10, 25, 50, 100].includes(radiusKmRaw) ? radiusKmRaw : undefined;

  const registeredRaw = firstString(searchParams.registered)?.trim().toLowerCase();
  const registered =
    registeredRaw === "yes" ? "yes" : registeredRaw === "no" ? "no" : undefined;

  const minRegistrationYear = toInt(firstString(searchParams.minRegistrationYear));
  const maxRegistrationYear = toInt(firstString(searchParams.maxRegistrationYear));

  return {
    q: q ? q : undefined,
    categorySlug,
    category,
    bodyTypeSlug,
    options: options.length ? options : undefined,
    fuel: fuel ? fuel : undefined,
    gearbox: gearbox ? gearbox : undefined,
    minPowerKw: toInt(firstString(searchParams.minPowerKw)),
    maxPowerKw: toInt(firstString(searchParams.maxPowerKw)),
    doors,
    seats,
    hasServiceBook: toBool(firstString(searchParams.hasServiceBook)),
    isNonSmoker: toBool(firstString(searchParams.isNonSmoker)),
    hasWarranty: toBool(firstString(searchParams.hasWarranty)),
    isDamaged: toBool(firstString(searchParams.isDamaged)),
    city: city ? city : undefined,
    minPrice: toInt(firstString(searchParams.minPrice)),
    maxPrice: toInt(firstString(searchParams.maxPrice)),
    minYear: toInt(firstString(searchParams.minYear)),
    maxYear: toInt(firstString(searchParams.maxYear)),
    minKm: toInt(firstString(searchParams.minKm)),
    maxKm: toInt(firstString(searchParams.maxKm)),
    sellerId: sellerId ? sellerId : undefined,
    sponsored: sponsored !== undefined ? sponsored : undefined,
    make: make ? make : undefined,
    model: model ? model : undefined,
    country: country ? country : undefined,
    mode,
    sort,
    page,
    perPage,
    radiusKm,
    registered,
    minRegistrationYear,
    maxRegistrationYear,
  };
}

export function filterListings(listings: Listing[], filters: ListingFilters) {
  const q = filters.q ? normalize(filters.q) : undefined;
  const city = filters.city ? normalize(filters.city) : undefined;

  return listings.filter((l) => {
    if (filters.category && l.category !== filters.category) return false;
    if (filters.minPrice !== undefined && l.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && l.price > filters.maxPrice) return false;
    if (filters.minYear !== undefined && l.year < filters.minYear) return false;
    if (filters.maxYear !== undefined && l.year > filters.maxYear) return false;
    if (filters.minKm !== undefined && l.km < filters.minKm) return false;
    if (filters.maxKm !== undefined && l.km > filters.maxKm) return false;

    if (city && normalize(l.city) !== city) return false;

    if (q) {
      const hay = normalize([l.title, l.description, l.city, l.category].join(" "));
      if (!hay.includes(q)) return false;
    }

    return true;
  });
}

export function getListingById(id: string) {
  return demoListings.find((l) => l.id === String(id));
}

