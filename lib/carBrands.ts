/** Slugs des 10 marques voiture les plus populaires (marché BE/FR) */
export const POPULAR_CAR_BRAND_SLUGS = [
  "volkswagen",
  "peugeot",
  "renault",
  "bmw",
  "audi",
  "mercedes-benz",
  "toyota",
  "ford",
  "opel",
  "citroen",
] as const;

/** Slugs des marques moto uniquement (pas de voitures) — exclues de la catégorie Auto */
export const MOTO_ONLY_SLUGS = [
  "aprilia",
  "bajaj",
  "benelli",
  "beta",
  "bimota",
  "brixton",
  "buell",
  "cake",
  "cfmoto",
  "derbi",
  "ducati",
  "energica",
  "fantic",
  "gas-gas",
  "gpx",
  "harley-davidson",
  "hero",
  "husqvarna-motorcycles",
  "hyosung",
  "indian",
  "kawasaki",
  "keeway",
  "kove",
  "ktm",
  "kymco",
  "lexmoto",
  "lightning",
  "livewire",
  "loncin",
  "mash",
  "modenas",
  "montesa",
  "moto-guzzi",
  "mv-agusta",
  "niu",
  "norton",
  "piaggio",
  "qjmotor",
  "rieju",
  "royal-enfield",
  "sherco",
  "super-soco",
  "swm",
  "sym",
  "triumph",
  "tvs",
  "vespa",
  "voge",
  "voxan",
  "yamaha",
  "zero",
  "zontes",
] as const;

/** Slugs des marques auto qui ont aussi une gamme moto — affichées dans catégorie Moto */
export const CAR_BRANDS_ALSO_MOTO = [
  "bmw",       // BMW Motorrad
  "honda",
  "lifan",     // motos et voitures
  "peugeot",   // Peugeot Motocycles
  "suzuki",
  "vinfast",   // motos et voitures
] as const;

/** Slugs des 5 marques moto les plus populaires (pour optgroup Marques populaires) */
export const POPULAR_MOTO_BRAND_SLUGS = [
  "yamaha",
  "kawasaki",
  "honda",
  "bmw",    // BMW Motorrad
  "ducati",
  "ktm",
] as const;

/** Liste des marques automobiles (voitures, motos, utilitaires) — tri alphabétique */
export const CAR_BRANDS = [
  { name: "Abarth", slug: "abarth" },
  { name: "Acura", slug: "acura" },
  { name: "9ff", slug: "9ff" },
  { name: "Aixam", slug: "aixam" },
  { name: "Aiways", slug: "aiways" },
  { name: "Alfa Romeo", slug: "alfa-romeo" },
  { name: "Alpina", slug: "alpina" },
  { name: "Alpine", slug: "alpine" },
  { name: "Aston Martin", slug: "aston-martin" },
  { name: "Audi", slug: "audi" },
  { name: "Aurus", slug: "aurus" },
  { name: "Bentley", slug: "bentley" },
  { name: "Bestune", slug: "bestune" },
  { name: "BMW", slug: "bmw" },
  { name: "Bolloré", slug: "bollore" },
  { name: "Borgward", slug: "borgward" },
  { name: "Bugatti", slug: "bugatti" },
  { name: "Buick", slug: "buick" },
  { name: "BYD", slug: "byd" },
  { name: "Cadillac", slug: "cadillac" },
  { name: "Caterham", slug: "caterham" },
  { name: "Changan", slug: "changan" },
  { name: "Chery", slug: "chery" },
  { name: "Chevrolet", slug: "chevrolet" },
  { name: "Chrysler", slug: "chrysler" },
  { name: "Citroën", slug: "citroen" },
  { name: "Cupra", slug: "cupra" },
  { name: "Dacia", slug: "dacia" },
  { name: "DAF", slug: "daf" },
  { name: "Daewoo", slug: "daewoo" },
  { name: "Daihatsu", slug: "daihatsu" },
  { name: "Dangel", slug: "dangel" },
  { name: "Dodge", slug: "dodge" },
  { name: "Donkervoort", slug: "donkervoort" },
  { name: "DR Automobiles", slug: "dr-automobiles" },
  { name: "DS Automobiles", slug: "ds-automobiles" },
  { name: "Ferrari", slug: "ferrari" },
  { name: "Fiat", slug: "fiat" },
  { name: "Fisker", slug: "fisker" },
  { name: "Ford", slug: "ford" },
  { name: "FSO", slug: "fso" },
  { name: "GAC", slug: "gac" },
  { name: "Geely", slug: "geely" },
  { name: "Genesis", slug: "genesis" },
  { name: "GMC", slug: "gmc" },
  { name: "Great Wall", slug: "great-wall" },
  { name: "GWM", slug: "gwm" },
  { name: "Holden", slug: "holden" },
  { name: "Honda", slug: "honda" },
  { name: "Hongqi", slug: "hongqi" },
  { name: "Hummer", slug: "hummer" },
  { name: "Hyundai", slug: "hyundai" },
  { name: "Ineos", slug: "ineos" },
  { name: "Infiniti", slug: "infiniti" },
  { name: "Isuzu", slug: "isuzu" },
  { name: "Iveco", slug: "iveco" },
  { name: "JAC", slug: "jac" },
  { name: "Jaecoo", slug: "jaecoo" },
  { name: "Jaguar", slug: "jaguar" },
  { name: "Jeep", slug: "jeep" },
  { name: "Jetour", slug: "jetour" },
  { name: "Karma", slug: "karma" },
  { name: "KGM", slug: "kgm" },
  { name: "Kia", slug: "kia" },
  { name: "Koenigsegg", slug: "koenigsegg" },
  { name: "Lada", slug: "lada" },
  { name: "Lamborghini", slug: "lamborghini" },
  { name: "Lancia", slug: "lancia" },
  { name: "Land Rover", slug: "land-rover" },
  { name: "LDV", slug: "ldv" },
  { name: "Leapmotor", slug: "leapmotor" },
  { name: "LEVC", slug: "levc" },
  { name: "Lexus", slug: "lexus" },
  { name: "Li Auto", slug: "li-auto" },
  { name: "Lifan", slug: "lifan" },
  { name: "Ligier", slug: "ligier" },
  { name: "Lotus", slug: "lotus" },
  { name: "Lucid", slug: "lucid" },
  { name: "Lynk & Co", slug: "lynk-co" },
  { name: "MAN", slug: "man" },
  { name: "Maserati", slug: "maserati" },
  { name: "Maxus", slug: "maxus" },
  { name: "Maybach", slug: "maybach" },
  { name: "Mazda", slug: "mazda" },
  { name: "McLaren", slug: "mclaren" },
  { name: "Mercedes-Benz", slug: "mercedes-benz" },
  { name: "MG", slug: "mg" },
  { name: "Micro", slug: "micro" },
  { name: "Mini", slug: "mini" },
  { name: "Mitsubishi", slug: "mitsubishi" },
  { name: "Mitsuoka", slug: "mitsuoka" },
  { name: "Mobilize", slug: "mobilize" },
  { name: "Morgan", slug: "morgan" },
  { name: "NIO", slug: "nio" },
  { name: "Nissan", slug: "nissan" },
  { name: "Omoda", slug: "omoda" },
  { name: "Opel", slug: "opel" },
  { name: "ORA", slug: "ora" },
  { name: "Pagani", slug: "pagani" },
  { name: "PGO", slug: "pgo" },
  { name: "Peugeot", slug: "peugeot" },
  { name: "Polestar", slug: "polestar" },
  { name: "Porsche", slug: "porsche" },
  { name: "RAM", slug: "ram" },
  { name: "Renault", slug: "renault" },
  { name: "Rivian", slug: "rivian" },
  { name: "Rolls-Royce", slug: "rolls-royce" },
  { name: "Ruf", slug: "ruf" },
  { name: "Saab", slug: "saab" },
  { name: "Saic", slug: "saic" },
  { name: "Seat", slug: "seat" },
  { name: "Seres", slug: "seres" },
  { name: "Skoda", slug: "skoda" },
  { name: "Smart", slug: "smart" },
  { name: "Spyker", slug: "spyker" },
  { name: "SsangYong", slug: "ssangyong" },
  { name: "Subaru", slug: "subaru" },
  { name: "Suzuki", slug: "suzuki" },
  { name: "Talbot", slug: "talbot" },
  { name: "Tank", slug: "tank" },
  { name: "Tata", slug: "tata" },
  { name: "TECHART", slug: "techart" },
  { name: "Tesla", slug: "tesla" },
  { name: "Togg", slug: "togg" },
  { name: "Toyota", slug: "toyota" },
  { name: "VinFast", slug: "vinfast" },
  { name: "Volkswagen", slug: "volkswagen" },
  { name: "Volvo", slug: "volvo" },
  { name: "Voyah", slug: "voyah" },
  { name: "Wey", slug: "wey" },
  { name: "Wiesmann", slug: "wiesmann" },
  { name: "Xiaomi", slug: "xiaomi" },
  { name: "XPeng", slug: "xpeng" },
  { name: "Zeekr", slug: "zeekr" },
  // Marques moto
  { name: "Aprilia", slug: "aprilia" },
  { name: "Bajaj", slug: "bajaj" },
  { name: "Benelli", slug: "benelli" },
  { name: "Beta", slug: "beta" },
  { name: "Bimota", slug: "bimota" },
  { name: "Brixton", slug: "brixton" },
  { name: "Buell", slug: "buell" },
  { name: "Cake", slug: "cake" },
  { name: "CFMoto", slug: "cfmoto" },
  { name: "Derbi", slug: "derbi" },
  { name: "Ducati", slug: "ducati" },
  { name: "Energica", slug: "energica" },
  { name: "Fantic", slug: "fantic" },
  { name: "Gas Gas", slug: "gas-gas" },
  { name: "GPX", slug: "gpx" },
  { name: "Harley-Davidson", slug: "harley-davidson" },
  { name: "Hero", slug: "hero" },
  { name: "Husqvarna Motorcycles", slug: "husqvarna-motorcycles" },
  { name: "Hyosung", slug: "hyosung" },
  { name: "Indian", slug: "indian" },
  { name: "Kawasaki", slug: "kawasaki" },
  { name: "Keeway", slug: "keeway" },
  { name: "Kove", slug: "kove" },
  { name: "KTM", slug: "ktm" },
  { name: "Kymco", slug: "kymco" },
  { name: "Lexmoto", slug: "lexmoto" },
  { name: "Lightning", slug: "lightning" },
  { name: "LiveWire", slug: "livewire" },
  { name: "Loncin", slug: "loncin" },
  { name: "Mash", slug: "mash" },
  { name: "Modenas", slug: "modenas" },
  { name: "Montesa", slug: "montesa" },
  { name: "Moto Guzzi", slug: "moto-guzzi" },
  { name: "MV Agusta", slug: "mv-agusta" },
  { name: "NIU", slug: "niu" },
  { name: "Norton", slug: "norton" },
  { name: "Piaggio", slug: "piaggio" },
  { name: "QJMotor", slug: "qjmotor" },
  { name: "Rieju", slug: "rieju" },
  { name: "Royal Enfield", slug: "royal-enfield" },
  { name: "Sherco", slug: "sherco" },
  { name: "Super Soco", slug: "super-soco" },
  { name: "SWM", slug: "swm" },
  { name: "SYM", slug: "sym" },
  { name: "Triumph", slug: "triumph" },
  { name: "TVS", slug: "tvs" },
  { name: "Vespa", slug: "vespa" },
  { name: "Voge", slug: "voge" },
  { name: "Voxan", slug: "voxan" },
  { name: "Yamaha", slug: "yamaha" },
  { name: "Zero", slug: "zero" },
  { name: "Zontes", slug: "zontes" },
] as const;

export type CarBrandSlug = (typeof CAR_BRANDS)[number]["slug"];

/** Filtre les marques selon la catégorie : auto = voitures, moto = motos, utilitaire ou "" = toutes */
export function getBrandsForCategory(category: string): ReadonlyArray<{ name: string; slug: string }> {
  if (category === "moto") {
    const motorcycleBrands = CAR_BRANDS.filter(
      (b) =>
        (MOTO_ONLY_SLUGS as readonly string[]).includes(b.slug) ||
        (CAR_BRANDS_ALSO_MOTO as readonly string[]).includes(b.slug)
    );
    return [...motorcycleBrands].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (category === "auto") {
    return CAR_BRANDS.filter(
      (b) => !(MOTO_ONLY_SLUGS as readonly string[]).includes(b.slug)
    );
  }
  return CAR_BRANDS;
}

/** Marques populaires + autres marques, filtrées par catégorie (auto / moto / utilitaire ou "") */
export function getPopularAndOtherBrands(category?: string): {
  popular: ReadonlyArray<{ name: string; slug: string }>;
  other: ReadonlyArray<{ name: string; slug: string }>;
} {
  const list = getBrandsForCategory(category ?? "");
  const isMoto = category === "moto";
  const popularSlugs = isMoto
    ? (POPULAR_MOTO_BRAND_SLUGS as readonly string[])
    : (POPULAR_CAR_BRAND_SLUGS as readonly string[]);
  const popular = list.filter((b) => popularSlugs.includes(b.slug));
  const other = list.filter((b) => !popularSlugs.includes(b.slug));
  return { popular, other };
}

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
