/**
 * Modèles par marque (nom exact de la marque = clé).
 * Utilisé pour le filtre Modèle dépendant de la Marque.
 */
export const CAR_MODELS_BY_MAKE: Record<string, readonly string[]> = {
  Abarth: ["124", "500", "500e", "595", "695"],
  Acura: ["ILX", "Integra", "MDX", "NSX", "RDX", "TLX", "ZDX"],
  "Alfa Romeo": ["147", "156", "159", "166", "Brera", "Giulia", "Giulietta", "GT", "GTV", "MiTo", "Spider", "Stelvio", "Tonale"],
  Alpine: ["A110", "A310", "A610", "GT"],
  "Aston Martin": ["DB11", "DB9", "DBS", "DBX", "Rapide", "Vantage", "Valkyrie"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "e-tron", "e-tron GT", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", "R8", "RS3", "RS4", "RS5", "RS6", "RS7", "RS Q8", "S3", "S4", "S5", "SQ5", "TT"],
  Bentley: ["Bentayga", "Continental GT", "Flying Spur", "Mulsanne"],
  BMW: ["1", "2", "3", "4", "5", "6", "7", "8", "i3", "i4", "i5", "i7", "iX", "iX3", "M2", "M3", "M4", "M5", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4"],
  Chevrolet: ["Camaro", "Captiva", "Corvette", "Cruze", "Equinox", "Malibu", "Spark", "Trax", "Volt"],
  Chrysler: ["300C", "Grand Voyager", "Pacifica", "Voyager", "Ypsilon"],
  Citroën: ["Ami", "Berlingo", "C1", "C3", "C3 Aircross", "C4", "C4 Cactus", "C4 X", "C5 Aircross", "C5 X", "DS3", "DS4", "DS5", "e-C4", "Grand C4 Spacetourer", "Jumpy", "SpaceTourer", "ë-C4"],
  Cupra: ["Born", "Formentor", "Leon", "Tavascan"],
  Dacia: ["Duster", "Jogger", "Sandero", "Spring", "Logan", "Lodgy"],
  Fiat: ["500", "500L", "500X", "Doblo", "Ducato", "Panda", "Punto", "Tipo", "Ulysse"],
  Ford: ["B-Max", "C-Max", "Ecosport", "Edge", "Fiesta", "Focus", "Galaxy", "Ka", "Kuga", "Mondeo", "Mustang", "Mustang Mach-E", "Puma", "Ranger", "S-Max", "Tourneo Connect", "Tourneo Custom", "Transit"],
  Honda: ["Africa Twin", "CBR", "CB", "Civic", "CR-V", "e", "Forza", "Gold Wing", "HR-V", "Jazz", "Legend", "NSX", "PCX", "SH", "Transalp", "ZR-V"],
  Hyundai: ["Bayon", "i10", "i20", "i30", "IONIQ 5", "IONIQ 6", "Kona", "Santa Fe", "Tucson", "ix20", "ix35"],
  Jaguar: ["E-Pace", "F-Pace", "F-Type", "I-Pace", "XE", "XF", "XJ"],
  Jeep: ["Avenger", "Compass", "Grand Cherokee", "Renegade", "Wrangler"],
  Kia: ["Carens", "cee'd", "EV6", "Niro", "Picanto", "ProCeed", "Rio", "Sorento", "Sportage", "Stonic", "Venga", "XCeed"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
  Lexus: ["CT", "ES", "IS", "LC", "LS", "NX", "RC", "RX", "UX"],
  Maserati: ["Ghibli", "GranTurismo", "Grecale", "Levante", "MC20", "Quattroporte"],
  Mazda: ["2", "3", "6", "CX-3", "CX-30", "CX-5", "CX-60", "MX-5", "MX-30"],
  "Mercedes-Benz": ["A", "B", "C", "CLA", "CLC", "CLK", "CLS", "E", "EQA", "EQB", "EQC", "EQE", "EQS", "G", "GLA", "GLB", "GLC", "GLE", "GLK", "GLS", "S", "SL", "SLC", "V", "Viano", "Vito", "AMG GT", "AMG One"],
  MG: ["3", "4", "5", "ZS", "Marvel R", "MG4"],
  Mini: ["Cabrio", "Clubman", "Countryman", "Hatch", "Paceman"],
  Mitsubishi: ["ASX", "Eclipse Cross", "L200", "Outlander", "Space Star"],
  Nissan: ["370Z", "Ariya", "GT-R", "Juke", "Leaf", "Micra", "Navara", "Note", "NV200", "Pathfinder", "Patrol", "Pulsar", "Qashqai", "X-Trail", "Z"],
  Opel: ["Adam", "Ampera", "Combo", "Corsa", "Crossland", "Grandland", "Insignia", "Mokka", "Vivaro", "Zafira"],
  Peugeot: ["108", "2008", "208", "3008", "308", "408", "5008", "508", "Partner", "Rifter", "Traveller", "e-208", "e-2008", "e-308", "e-3008", "e-5008"],
  Porsche: ["718", "911", "Boxster", "Cayenne", "Cayman", "Macan", "Panamera", "Taycan"],
  Renault: ["Arkana", "Austral", "Captur", "Clio", "Espace", "Express", "Kadjar", "Kangoo", "Koleos", "Master", "Megane", "Scenic", "Talisman", "Trafic", "Twingo", "Twizy", "Zoe"],
  Seat: ["Arona", "Ateca", "Cordoba", "Exeo", "Ibiza", "Leon", "Tarraco"],
  Skoda: ["Enyaq", "Fabia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Scala", "Superb"],
  Smart: ["Forfour", "Fortwo", "#1", "#3"],
  Subaru: ["BRZ", "Forester", "Impreza", "Legacy", "Levorg", "Outback", "Solterra", "WRX", "XV"],
  Suzuki: ["Across", "Address", "Baleno", "Burgman", "DR", "GSX-R", "GSX-S", "Hayabusa", "Ignis", "Jimny", "S-Cross", "Swace", "Swift", "V-Strom", "Vitara"],
  Tesla: ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck", "Roadster"],
  Toyota: ["Aygo", "bZ4X", "Camry", "Corolla", "C-HR", "GR86", "GR Yaris", "GT86", "Hilux", "Land Cruiser", "Mirai", "Prius", "Proace", "RAV4", "Supra", "Yaris", "Yaris Cross"],
  Volkswagen: ["Amarok", "Arteon", "Caddy", "California", "Caravelle", "Golf", "ID.3", "ID.4", "ID.5", "ID. Buzz", "Multivan", "Passat", "Polo", "T-Cross", "T-Roc", "Taigo", "Tiguan", "Touareg", "Touran", "Transporter", "Up"],
  Volvo: ["C40", "EX30", "EX90", "S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
  // Moto (marques principalement moto)
  Aprilia: ["RS 660", "RSV4", "Tuono", "Tuareg", "SR GT", "Mana", "Shiver", "Dorsoduro", "SXR", "Scarabeo"],
  Benelli: ["BN 125", "Leoncino", "TRK", "Imperiale", "TNT"],
  Ducati: ["Diavel", "Hypermotard", "Monster", "Multistrada", "Panigale", "Scrambler", "Streetfighter", "SuperSport"],
  "Harley-Davidson": ["Sportster", "Softail", "Touring", "Trike", "Street", "LiveWire"],
  Kawasaki: ["Ninja", "Z", "Versys", "Vulcan", "Eliminator", "Z900", "ZX-10R", "KX"],
  KTM: ["1290", "890", "790", "390", "250", "RC", "ADV", "SMC"],
  Yamaha: ["MT", "R", "XSR", "Tracer", "Ténéré", "Niken", "X-Max", "NMAX", "WR", "YZF"],
  Triumph: ["Bonneville", "Street Triple", "Speed Triple", "Tiger", "Scrambler", "Rocket", "Trident"],
  "Royal Enfield": ["Classic", "Meteor", "Himalayan", "Hunter", "Scram", "Interceptor", "Continental GT"],
};

/** Retourne les modèles pour une marque (tableau vide si marque inconnue). */
export function getModelsForMake(make: string): readonly string[] {
  if (!make?.trim()) return [];
  return CAR_MODELS_BY_MAKE[make.trim()] ?? [];
}

/** Indique si la marque a une liste de modèles prédéfinie. */
export function hasModelList(make: string): boolean {
  const list = CAR_MODELS_BY_MAKE[make?.trim() ?? ""];
  return Array.isArray(list) && list.length > 0;
}
