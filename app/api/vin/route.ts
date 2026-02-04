import { NextResponse } from "next/server";
import { z } from "zod";

const VinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/, "VIN invalide (17 caractères, sans I/O/Q).");

function pickString(v: unknown) {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s.length ? s : undefined;
}

function pickInt(v: unknown) {
  if (typeof v !== "string" && typeof v !== "number") return undefined;
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : undefined;
}

function isMeaningfulValue(v: unknown) {
  if (v === null || v === undefined) return false;
  const s = String(v).trim();
  if (!s) return false;
  const low = s.toLowerCase();
  if (
    low === "not applicable" ||
    low === "not available" ||
    low === "n/a" ||
    low === "na" ||
    low === "none" ||
    low === "no" ||
    low === "false" ||
    low === "0"
  ) {
    return false;
  }
  return true;
}

const OPTION_FIELDS: Array<{ key: string; label: string; mode?: "bool" | "value" }> = [
  { key: "ABS", label: "ABS", mode: "value" },
  { key: "ESC", label: "ESP/ESC", mode: "value" },
  { key: "TractionControl", label: "Antipatinage (Traction Control)", mode: "value" },
  { key: "DaytimeRunningLight", label: "Feux de jour", mode: "value" },
  { key: "TPMS", label: "Contrôle pression pneus (TPMS)", mode: "value" },
  { key: "ForwardCollisionWarning", label: "Alerte collision avant", mode: "value" },
  { key: "LaneDepartureWarning", label: "Alerte franchissement de ligne", mode: "value" },
  { key: "LaneKeepSystem", label: "Maintien dans la voie", mode: "value" },
  { key: "ParkAssist", label: "Aide au stationnement", mode: "value" },
  { key: "RearVisibilitySystem", label: "Caméra / système visibilité arrière", mode: "value" },
  { key: "BlindSpotMon", label: "Surveillance angle mort", mode: "value" },
  { key: "RearCrossTrafficAlert", label: "Alerte trafic arrière", mode: "value" },
  { key: "AdaptiveCruiseControl", label: "Régulateur adaptatif", mode: "value" },
  { key: "KeylessIgnition", label: "Démarrage sans clé", mode: "value" },
  { key: "AirBagLocFront", label: "Airbags avant", mode: "value" },
  { key: "AirBagLocSide", label: "Airbags latéraux", mode: "value" },
  { key: "AirBagLocCurtain", label: "Airbags rideaux", mode: "value" },
  { key: "Seats", label: "Nombre de places", mode: "value" },
  { key: "SeatBeltsAll", label: "Ceintures", mode: "value" },
];

function extractOptions(row: Record<string, unknown>) {
  const out: string[] = [];
  for (const f of OPTION_FIELDS) {
    const v = row[f.key];
    if (!isMeaningfulValue(v)) continue;
    const val = String(v).trim();
    if (f.mode === "bool") {
      out.push(f.label);
    } else {
      // "value": on garde la valeur quand elle apporte une info
      out.push(`${f.label}: ${val}`);
    }
  }
  // Dédup simple
  return Array.from(new Set(out));
}

function bodyTypeFromVpic(bodyClass: string | undefined) {
  const s = (bodyClass ?? "").toLowerCase();
  if (!s) return undefined;
  if (s.includes("suv") || s.includes("sport utility")) return "suv";
  if (s.includes("pickup") || s.includes("pick-up") || s.includes("pick up")) return "pick-up";
  if (s.includes("convertible") || s.includes("cabriolet")) return "cabriolet";
  if (s.includes("minivan") || s.includes("van")) return "monospace";
  if (s.includes("sedan")) return "berline";
  if (s.includes("wagon") || s.includes("station")) return "break";
  if (s.includes("coupe")) return "coupé";
  if (s.includes("hatchback") || s.includes("city") || s.includes("compact")) return "citadine";
  return undefined;
}

function fuelFromVpic(fuelType: string | undefined) {
  const s = (fuelType ?? "").toLowerCase();
  if (!s) return undefined;
  if (s.includes("gasoline") || s.includes("petrol")) return "petrol";
  if (s.includes("diesel")) return "diesel";
  if (s.includes("electric")) return "electric";
  if (s.includes("hybrid")) return "hybrid";
  if (s.includes("hydrogen")) return "hydrogen";
  if (s.includes("ethanol")) return "ethanol";
  if (s.includes("cng")) return "cng";
  if (s.includes("lpg")) return "lpg";
  return "other";
}

function gearboxFromVpic(transmissionStyle: string | undefined) {
  const s = (transmissionStyle ?? "").toLowerCase();
  if (!s) return undefined;
  if (s.includes("manual")) return "manual";
  if (s.includes("automatic")) return "automatic";
  if (s.includes("semi")) return "semi-automatic";
  return undefined;
}

// Réponse vPIC (NHTSA)
const VpicResponseSchema = z.object({
  Results: z.array(z.record(z.string(), z.unknown())).min(1),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const vinRaw = url.searchParams.get("vin");
  const parsedVin = VinSchema.safeParse(vinRaw);

  if (!parsedVin.success) {
    return NextResponse.json(
      { error: "INVALID_VIN", message: parsedVin.error.issues[0]?.message ?? "VIN invalide." },
      { status: 400 }
    );
  }

  const vin = parsedVin.data;

  // Service gratuit (données surtout orientées US; utile aussi en EU mais parfois incomplet)
  const endpoint = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${encodeURIComponent(
    vin
  )}?format=json`;

  const res = await fetch(endpoint, {
    // on évite le cache pour un VIN
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "VIN_LOOKUP_FAILED", status: res.status },
      { status: 502 }
    );
  }

  const json = (await res.json().catch(() => null)) as unknown;
  const parsed = VpicResponseSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "VIN_BAD_RESPONSE" }, { status: 502 });
  }

  const row = parsed.data.Results[0] ?? {};

  const make = pickString(row.Make);
  const model = pickString(row.Model);
  const trim = pickString(row.Trim) ?? pickString(row.Series);
  const year = pickInt(row.ModelYear);
  const bodyClass = pickString(row.BodyClass);
  const bodyTypeHint = bodyTypeFromVpic(bodyClass);
  const vehicleType = pickString(row.VehicleType);
  const fuelType = pickString(row.FuelTypePrimary);
  const fuelHint = fuelFromVpic(fuelType);
  const transmission = pickString(row.TransmissionStyle);
  const gearboxHint = gearboxFromVpic(transmission);
  const driveType = pickString(row.DriveType);
  const doors = pickInt(row.Doors);
  const seats = pickInt(row.Seats);
  const engineCylinders = pickInt(row.EngineCylinders);
  const engineHp = pickInt(row.EngineHP);
  const engineKw = pickInt(row.EngineKW);
  const engineModel = pickString(row.EngineModel);
  const displacementL = pickString(row.DisplacementL);
  const transmissionSpeeds = pickInt(row.TransmissionSpeeds);
  const plantCountry = pickString(row.PlantCountry);
  const plantCity = pickString(row.PlantCity);
  const manufacturer = pickString(row.Manufacturer) ?? pickString(row.ManufacturerName);
  const options = extractOptions(row);

  const titleParts = [make, model, trim].filter(Boolean);
  const suggestedTitle = titleParts.length ? titleParts.join(" ") : undefined;

  // Heuristique simple pour catégorie
  const categoryHint =
    vehicleType && /motorcycle/i.test(vehicleType)
      ? "moto"
      : vehicleType && /(truck|incomplete)/i.test(vehicleType)
        ? "utilitaire"
        : "auto";

  return NextResponse.json({
    vin,
    suggestedTitle,
    categoryHint,
    bodyTypeHint,
    make,
    model,
    trim,
    year,
    bodyClass,
    vehicleType,
    fuelType,
    fuelHint,
    transmission,
    gearboxHint,
    transmissionSpeeds,
    driveType,
    doors,
    seats,
    engineCylinders,
    engineHp,
    engineKw,
    engineModel,
    displacementL,
    plantCountry,
    plantCity,
    manufacturer,
    options,
    // On renvoie aussi la ligne brute pour pouvoir afficher plus d’infos si besoin
    raw: row,
  });
}

