"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CARVERTICAL_DISCOUNT_PERCENT, CARVERTICAL_ORIGINAL_PRICE_EUR, CARVERTICAL_PRICE_EUR, LISTING_DESCRIPTION_MIN_LENGTH } from "@/lib/constants";
import { CATEGORY_OPTIONS } from "@/lib/listings";
import { SELLER_OPTION_GROUPS } from "@/lib/sellerOptions";
import { MakeModelSearchFields } from "@/app/_components/MakeModelSearchFields";
import { chToKw } from "@/lib/powerUtils";

type VinDecoded = {
  vin: string;
  suggestedTitle?: string;
  categoryHint?: string;
  bodyTypeHint?: string;
  fuelHint?: string;
  gearboxHint?: string;
  make?: string;
  model?: string;
  trim?: string;
  year?: number;
  bodyClass?: string;
  vehicleType?: string;
  fuelType?: string;
  transmission?: string;
  transmissionSpeeds?: number;
  driveType?: string;
  doors?: number;
  seats?: number;
  engineCylinders?: number;
  engineHp?: number;
  engineKw?: number;
  engineModel?: string;
  displacementL?: string;
  plantCountry?: string;
  plantCity?: string;
  manufacturer?: string;
  options?: string[];
  raw?: Record<string, unknown>;
};

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; id: string; manageToken?: string }
  | { status: "error"; message: string };

export function SellForm() {
  const router = useRouter();
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const [vin, setVin] = useState("");
  const [vinState, setVinState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: VinDecoded }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [customModelText, setCustomModelText] = useState("");
  const [displacementL, setDisplacementL] = useState("");
  const [mode, setMode] = useState<"sale" | "rent">("sale");
  const [category, setCategory] = useState("auto");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [vinOptions, setVinOptions] = useState<string[]>([]);
  const [color, setColor] = useState("");
  const [bodyType, setBodyType] = useState<
    "" | "citadine" | "suv" | "pick-up" | "cabriolet" | "monospace" | "berline" | "break" | "coupé"
  >("");
  const [bodyTypeTouched, setBodyTypeTouched] = useState(false);

  const [fuel, setFuel] = useState<
    "" | "hybrid" | "petrol" | "diesel" | "electric" | "hydrogen" | "lpg" | "cng" | "ethanol" | "other"
  >("");
  const [gearbox, setGearbox] = useState<"" | "manual" | "automatic" | "semi-automatic">("");
  const [powerKw, setPowerKw] = useState("");
  const [powerUnit, setPowerUnit] = useState<"kw" | "ch">("kw");
  const [doors, setDoors] = useState("");
  const [seats, setSeats] = useState("");
  const [hasServiceBook, setHasServiceBook] = useState(false);
  const [isNonSmoker, setIsNonSmoker] = useState(false);
  const [hasWarranty, setHasWarranty] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);
  const [hasMinorDamage, setHasMinorDamage] = useState(false);
  const [hasCarVerticalVerification, setHasCarVerticalVerification] = useState(false);
  const [fuelTouched, setFuelTouched] = useState(false);
  const [gearboxTouched, setGearboxTouched] = useState(false);

  const [hasBeenRegistered, setHasBeenRegistered] = useState<boolean | null>(null);
  const [firstRegistrationMonth, setFirstRegistrationMonth] = useState("");
  const [firstRegistrationYear, setFirstRegistrationYear] = useState("");

  const [sellerOptions, setSellerOptions] = useState<string[]>([]);
  const [sellerOptionsNote, setSellerOptionsNote] = useState("");

  function toggleSellerOption(opt: string) {
    setSellerOptions((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt]
    );
  }

  function normalizeForMatch(s: string) {
    return s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }

  function autoSelectFromVinOptions(vinOpts: string[]) {
    const hay = vinOpts.map(normalizeForMatch).join(" ");
    const matches: Record<string, RegExp> = {
      ABS: /\babs\b/,
      "ESP/ESC": /\besc\b|\besp\b/,
      "Contrôle pression pneus (TPMS)": /\btpms\b/,
      "Alerte collision avant": /forward collision/,
      "Aide au maintien dans la voie": /lane keep|lane departure|lane center/,
      "Surveillance angle mort": /blind spot/,
      "Capteurs de stationnement": /park assist|park/,
      "Caméra de recul": /rear visibility|camera/,
      "Régulateur adaptatif": /adaptive cruise/,
      "Démarrage sans clé": /keyless ignition/,
      Airbags: /airbag/,
    };

    const suggested: string[] = [];
    for (const group of SELLER_OPTION_GROUPS) {
      for (const opt of group.options) {
        const rx = matches[opt];
        if (rx && rx.test(hay)) suggested.push(opt);
      }
    }
    if (suggested.length) {
      setSellerOptions((prev) => Array.from(new Set([...prev, ...suggested])));
    }
  }

  function isBodyTypeSlug(
    v: string
  ): v is
    | "citadine"
    | "suv"
    | "pick-up"
    | "cabriolet"
    | "monospace"
    | "berline"
    | "break"
    | "coupé" {
    return (
      v === "citadine" ||
      v === "suv" ||
      v === "pick-up" ||
      v === "cabriolet" ||
      v === "monospace" ||
      v === "berline" ||
      v === "break" ||
      v === "coupé"
    );
  }

  function isFuelSlug(v: string): v is
    | "hybrid"
    | "petrol"
    | "diesel"
    | "electric"
    | "hydrogen"
    | "lpg"
    | "cng"
    | "ethanol"
    | "other" {
    return (
      v === "hybrid" ||
      v === "petrol" ||
      v === "diesel" ||
      v === "electric" ||
      v === "hydrogen" ||
      v === "lpg" ||
      v === "cng" ||
      v === "ethanol" ||
      v === "other"
    );
  }

  function isGearboxSlug(v: string): v is "manual" | "automatic" | "semi-automatic" {
    return v === "manual" || v === "automatic" || v === "semi-automatic";
  }

  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function uploadPhotos(files: FileList | null) {
    if (!files) return;
    setPhotoError(null);
    const picked = Array.from(files).slice(0, 15);
    if (!picked.length) return;

    setPhotoBusy(true);
    const fd = new FormData();
    for (const f of picked) fd.append("files", f);

    const res = await fetch("/api/photos/upload", { method: "POST", body: fd });
    const body = (await res.json().catch(() => null)) as
      | { ok?: boolean; urls?: string[] }
      | { error?: string }
      | null;
    setPhotoBusy(false);

    if (!res.ok || !body || !("ok" in body) || !Array.isArray(body.urls)) {
      setPhotoError("Upload des photos impossible.");
      return;
    }

    setPhotoUrls((prev) => {
      const merged = [...prev, ...body.urls!];
      return merged.slice(0, 15);
    });
  }

  async function decodeVin() {
    const cleaned = vin.trim().toUpperCase();
    if (!cleaned) return;
    setVinState({ status: "loading" });

    const res = await fetch(`/api/vin?vin=${encodeURIComponent(cleaned)}`);
    const body = (await res.json().catch(() => null)) as VinDecoded | { message?: string } | null;
    if (!res.ok) {
      const msg =
        body && typeof body === "object" && "message" in body && body.message
          ? String(body.message)
          : "Impossible de décoder ce VIN.";
      setVinState({ status: "error", message: msg });
      return;
    }

    const data = body as VinDecoded & { bodyTypeHint?: string };
    setVinState({ status: "success", data });
    setVinOptions(Array.isArray(data.options) ? data.options : []);
    if (Array.isArray(data.options) && data.options.length) {
      autoSelectFromVinOptions(data.options);
    }
    if (!bodyTypeTouched && typeof data.bodyTypeHint === "string") {
      const v = data.bodyTypeHint;
      if (isBodyTypeSlug(v)) setBodyType(v);
    }
    if (!fuelTouched && typeof data.fuelHint === "string") {
      const v = data.fuelHint;
      if (isFuelSlug(v)) setFuel(v);
    }
    if (!gearboxTouched && typeof data.gearboxHint === "string") {
      const v = data.gearboxHint;
      if (isGearboxSlug(v)) setGearbox(v);
    }
    if (!powerKw.trim()) {
      if (typeof data.engineKw === "number") {
        setPowerKw(String(data.engineKw));
        setPowerUnit("kw");
      } else if (typeof data.engineHp === "number") {
        setPowerKw(String(data.engineHp));
        setPowerUnit("ch");
      }
    }
    if (!doors.trim() && typeof data.doors === "number") setDoors(String(data.doors));
    if (!seats.trim() && typeof data.seats === "number") setSeats(String(data.seats));

    // Auto-fill (on n’écrase pas ce que l’utilisateur a déjà rempli)
    if (!make.trim() && data.make) setMake(data.make);
    if (!model.trim() && data.model) setModel(data.model);
    if (!displacementL.trim() && data.displacementL) setDisplacementL(data.displacementL ?? "");
    if (!year.trim() && data.year) setYear(String(data.year));
    if (!categoryTouched && data.categoryHint) setCategory(data.categoryHint);
    if (!description.trim()) {
      const desc = [
        data.vin ? `VIN: ${data.vin}` : null,
        data.make || data.model ? `Véhicule: ${[data.make, data.model, data.trim].filter(Boolean).join(" ")}` : null,
        data.fuelType ? `Carburant: ${data.fuelType}` : null,
        data.transmission ? `Transmission: ${data.transmission}` : null,
        data.transmissionSpeeds ? `Vitesses: ${data.transmissionSpeeds}` : null,
        data.driveType ? `Transmission (roues): ${data.driveType}` : null,
        data.engineCylinders ? `Cylindres: ${data.engineCylinders}` : null,
        data.engineHp ? `Puissance: ${data.engineHp} ch (VIN)` : null,
        data.engineModel ? `Moteur (code): ${data.engineModel}` : null,
        data.displacementL ? `Cylindrée: ${data.displacementL} L` : null,
        data.bodyClass ? `Carrosserie: ${data.bodyClass}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      if (desc) setDescription(desc);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      hasBeenRegistered === true &&
      (!firstRegistrationMonth || !firstRegistrationYear.trim())
    ) {
      setState({
        status: "error",
        message: "Indiquez le mois et l'année de première immatriculation.",
      });
      return;
    }
    const fd = new FormData(e.currentTarget);
    const desc = String(fd.get("description") ?? "").trim();
    if (desc.length < LISTING_DESCRIPTION_MIN_LENGTH) {
      setState({
        status: "error",
        message: `La description doit contenir au moins ${LISTING_DESCRIPTION_MIN_LENGTH} caractères (actuellement ${desc.length}).`,
      });
      return;
    }

    setState({ status: "submitting" });

    const vinDecoded = vinState.status === "success" ? vinState.data : undefined;

    const payload = {
      mode: String(fd.get("mode") ?? "") || undefined,
      vin: String(fd.get("vin") ?? "").trim().toUpperCase() || undefined,
      bodyType: String(fd.get("bodyType") ?? "") || undefined,
      color: String(fd.get("color") ?? "") || undefined,
      fuel: String(fd.get("fuel") ?? "") || undefined,
      gearbox: String(fd.get("gearbox") ?? "") || undefined,
      powerKw: (() => {
        const raw = String(fd.get("powerKw") ?? "").trim();
        if (!raw) return undefined;
        const num = Number.parseFloat(raw);
        if (!Number.isFinite(num)) return undefined;
        const kw = powerUnit === "ch" ? chToKw(num) : num;
        return Math.round(kw);
      })(),
      doors: String(fd.get("doors") ?? "") || undefined,
      seats: String(fd.get("seats") ?? "") || undefined,
      hasServiceBook: Boolean(fd.get("hasServiceBook")),
      isNonSmoker: Boolean(fd.get("isNonSmoker")),
      hasWarranty: Boolean(fd.get("hasWarranty")),
      isDamaged: Boolean(fd.get("isDamaged")),
      hasMinorDamage: Boolean(fd.get("hasMinorDamage")),
      hasCarVerticalVerification: hasCarVerticalVerification,
      title: (() => {
        const t = [make.trim(), model.trim(), year.trim()].filter(Boolean).join(" ").trim();
        return t.length >= 8 ? t : mode === "rent" ? "Véhicule à louer" : "Véhicule à vendre";
      })(),
      make: (make === "other" ? "Autre" : make.trim()) || undefined,
      model: (model === "other" ? customModelText.trim() : model.trim()) || undefined,
      displacementL: displacementL.trim() || undefined,
      category: String(fd.get("category") ?? ""),
      price: String(fd.get("price") ?? ""),
      year: String(fd.get("year") ?? ""),
      km: String(fd.get("km") ?? ""),
      city: String(fd.get("city") ?? ""),
      description: String(fd.get("description") ?? ""),
      contactName: String(fd.get("contactName") ?? "") || undefined,
      contactPhone: String(fd.get("contactPhone") ?? "") || undefined,
      contactEmail: String(fd.get("contactEmail") ?? "") || undefined,
      photoUrls: photoUrls.length ? photoUrls : undefined,
      sellerOptions: sellerOptions.length ? sellerOptions : undefined,
      sellerOptionsNote: sellerOptionsNote.trim() ? sellerOptionsNote.trim() : undefined,

      firstRegistrationDate:
        hasBeenRegistered === true && firstRegistrationYear && firstRegistrationMonth
          ? `${firstRegistrationYear}-${String(firstRegistrationMonth).padStart(2, "0")}-01`
          : hasBeenRegistered === false
            ? null
            : undefined,

      // infos décodées (optionnel)
      vinDecoded: vinDecoded
        ? {
            vin: vinDecoded.vin,
            make: vinDecoded.make,
            model: vinDecoded.model,
            trim: vinDecoded.trim,
            year: vinDecoded.year,
            bodyClass: vinDecoded.bodyClass,
            vehicleType: vinDecoded.vehicleType,
            fuelType: vinDecoded.fuelType,
            transmission: vinDecoded.transmission,
            transmissionSpeeds: vinDecoded.transmissionSpeeds,
            driveType: vinDecoded.driveType,
            doors: vinDecoded.doors,
            engineCylinders: vinDecoded.engineCylinders,
            engineHp: vinDecoded.engineHp,
            engineModel: vinDecoded.engineModel,
            displacementL: vinDecoded.displacementL,
            plantCountry: vinDecoded.plantCountry,
            plantCity: vinDecoded.plantCity,
            manufacturer: vinDecoded.manufacturer,
            options: vinOptions.length ? vinOptions : undefined,
            raw: vinDecoded.raw,
          }
        : undefined,
    };

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const body = (await res.json().catch(() => null)) as
      | { id: string; manageToken?: string | null }
      | { error: string; reason?: string }
      | null;

    if (!res.ok) {
      const msg =
        body && "reason" in body && body.reason
          ? body.reason
          : "Impossible de publier l’annonce. Vérifie les champs.";
      setState({ status: "error", message: msg });
      return;
    }

    if (!body || !("id" in body)) {
      setState({ status: "error", message: "Réponse serveur inattendue." });
      return;
    }

    const token =
      typeof body.manageToken === "string" && body.manageToken.length ? body.manageToken : undefined;
    setState({ status: "success", id: body.id, manageToken: token });
    router.push(`/sell/success?id=${encodeURIComponent(body.id)}&token=${encodeURIComponent(token ?? "")}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      <div className="rounded-2xl border border-sky-200/80 bg-white/75 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-800">
              VIN (numéro de châssis) — remplit automatiquement les infos
            </label>
            <input
              name="vin"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              placeholder="Ex: WBA... (17 caractères)"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
          </div>

          <button
            type="button"
            onClick={decodeVin}
            disabled={vinState.status === "loading"}
            className="rounded-xl bg-sky-600 px-4 py-3 font-medium text-white hover:bg-sky-500 transition disabled:opacity-60"
          >
            {vinState.status === "loading" ? "Recherche..." : "Remplir via VIN"}
          </button>
        </div>

        {vinState.status === "error" ? (
          <div className="mt-3 text-sm text-red-700">{vinState.message}</div>
        ) : null}

        {vinState.status === "success" ? (
          <div className="mt-3 text-sm text-slate-700">
            VIN reconnu: <span className="font-semibold">{vinState.data.vin}</span>
            {vinState.data.make || vinState.data.model || vinState.data.year ? (
              <span>
                {" "}
                — {vinState.data.make ?? "?"} {vinState.data.model ?? ""}{" "}
                {vinState.data.year ? `(${vinState.data.year})` : ""}
              </span>
            ) : null}
            {vinOptions.length ? (
              <div className="mt-3">
                <div className="text-xs font-medium text-slate-600">Options détectées</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {vinOptions.slice(0, 16).map((o) => (
                    <span
                      key={o}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-800"
                    >
                      {o}
                    </span>
                  ))}
                </div>
                {vinOptions.length > 16 ? (
                  <div className="mt-2 text-xs text-slate-500">
                    +{vinOptions.length - 16} autres…
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className="mt-2 text-xs text-slate-500">
              Astuce: clique “Remplir via VIN”, puis vérifie les champs (certaines infos peuvent être
              manquantes selon le véhicule).
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm text-slate-700">Type d’annonce</label>
          <select
            name="mode"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            value={mode}
            onChange={(e) => {
              const v = e.target.value === "rent" ? "rent" : "sale";
              setMode(v);
              // Location: uniquement voitures + utilitaires
              if (v === "rent" && category === "moto") {
                setCategoryTouched(true);
                setCategory("auto");
              }
            }}
          >
            <option value="sale">Vente</option>
            <option value="rent">Location</option>
          </select>
          <div className="mt-1 text-xs text-slate-500">
            {mode === "rent"
              ? "Location (MVP): le prix est interprété comme un prix / jour."
              : "Vente: prix total du véhicule."}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:col-span-2">
          <MakeModelSearchFields
            make={make}
            model={model}
            onMakeChange={(v) => {
              setMake(v);
              setModel("");
              setCustomModelText("");
            }}
            onModelChange={setModel}
            category={category}
            idPrefix="sell"
          />
        </div>
        {model === "other" && (
          <div>
            <label className="text-sm text-slate-700">Précisez le modèle</label>
            <input
              type="text"
              placeholder="Ex: Golf 7, Série 3…"
              value={customModelText}
              onChange={(e) => setCustomModelText(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            />
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm text-slate-700">Catégorie</label>
          <select
            name="category"
            required
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            value={category}
            onChange={(e) => {
              setCategoryTouched(true);
              setCategory(e.target.value);
            }}
          >
            {(mode === "rent"
              ? CATEGORY_OPTIONS.filter((c) => c.slug !== "moto")
              : CATEGORY_OPTIONS
            ).map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
          {mode === "rent" ? (
            <div className="mt-1 text-xs text-slate-500">Location disponible pour Auto & Utilitaire.</div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div>
          <label className="text-sm text-slate-700">Carrosserie</label>
          <select
            name="bodyType"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            value={bodyType}
            onChange={(e) => {
              setBodyTypeTouched(true);
              const v = e.target.value;
              setBodyType(isBodyTypeSlug(v) ? v : "");
            }}
          >
            <option value="">—</option>
            <option value="citadine">Citadine</option>
            <option value="suv">SUV</option>
            <option value="pick-up">Pick-up</option>
            <option value="cabriolet">Cabriolet</option>
            <option value="monospace">Monospace</option>
            <option value="berline">Berline</option>
            <option value="break">Break</option>
            <option value="coupé">Coupé</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-700">Carburant</label>
          <select
            name="fuel"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            value={fuel}
            onChange={(e) => {
              setFuelTouched(true);
              const v = e.target.value;
              setFuel(isFuelSlug(v) ? v : "");
            }}
          >
            <option value="">—</option>
            <option value="hybrid">Hybride</option>
            <option value="petrol">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Électrique</option>
            <option value="hydrogen">Hydrogène</option>
            <option value="lpg">GPL</option>
            <option value="cng">CNG</option>
            <option value="ethanol">Ethanol</option>
            <option value="other">Autres</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-700">Boîte</label>
          <select
            name="gearbox"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            value={gearbox}
            onChange={(e) => {
              setGearboxTouched(true);
              const v = e.target.value;
              setGearbox(isGearboxSlug(v) ? v : "");
            }}
          >
            <option value="">—</option>
            <option value="manual">Manuelle</option>
            <option value="automatic">Automatique</option>
            <option value="semi-automatic">Semi-automatique</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-slate-700">Couleur</label>
          <input
            name="color"
            placeholder="Ex: Bleu"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <div className="mt-1 text-xs text-slate-500">
            La couleur n’est pas fiable via VIN, donc on la renseigne manuellement.
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-700">
            {mode === "rent" ? "Prix / jour (€)" : "Prix (€)"}
          </label>
          <input
            name="price"
            required
            inputMode="numeric"
            placeholder="Ex: 12900"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        <div>
          <label className="text-sm text-slate-700">Puissance (kW ou ch)</label>
          <div className="mt-2 flex gap-2">
            <input
              name="powerKw"
              inputMode="numeric"
              placeholder={powerUnit === "kw" ? "Ex: 85" : "Ex: 115"}
              className="flex-1 rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
              value={powerKw}
              onChange={(e) => setPowerKw(e.target.value)}
            />
            <select
              aria-label="Unité puissance"
              value={powerUnit}
              onChange={(e) => setPowerUnit(e.target.value as "kw" | "ch")}
              className="w-16 rounded-xl border border-slate-200 bg-white/85 px-2 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            >
              <option value="kw">kW</option>
              <option value="ch">ch</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm text-slate-700">Portes</label>
          <input
            name="doors"
            inputMode="numeric"
            placeholder="Ex: 5"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            value={doors}
            onChange={(e) => setDoors(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-slate-700">Sièges</label>
          <input
            name="seats"
            inputMode="numeric"
            placeholder="Ex: 5"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-slate-700">Année</label>
          <input
            name="year"
            required
            inputMode="numeric"
            placeholder="Ex: 2017"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm text-slate-700">Kilométrage</label>
          <input
            name="km"
            required
            inputMode="numeric"
            placeholder="Ex: 156000"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm text-slate-700">Ville</label>
          <input
            name="city"
            required
            placeholder="Ex: Bruxelles"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/75 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Immatriculation</h3>
        <p className="mt-1 text-xs text-slate-600">Le véhicule a-t-il déjà été immatriculé ?</p>
        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input
              type="radio"
              name="hasBeenRegistered"
              checked={hasBeenRegistered === true}
              onChange={() => setHasBeenRegistered(true)}
              className="h-4 w-4 accent-sky-600"
            />
            Oui, déjà immatriculé
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input
              type="radio"
              name="hasBeenRegistered"
              checked={hasBeenRegistered === false}
              onChange={() => setHasBeenRegistered(false)}
              className="h-4 w-4 accent-sky-600"
            />
            Non, pas encore été immatriculé
          </label>
        </div>
        {hasBeenRegistered === true && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-600">Mois de première immatriculation</label>
              <select
                value={firstRegistrationMonth}
                onChange={(e) => setFirstRegistrationMonth(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60"
              >
                <option value="">—</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1, 1).toLocaleDateString("fr-BE", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600">Année de première immatriculation</label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                placeholder="Ex: 2019"
                value={firstRegistrationYear}
                onChange={(e) => setFirstRegistrationYear(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-2.5 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            name="hasServiceBook"
            checked={hasServiceBook}
            onChange={(e) => setHasServiceBook(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          Carnet d’entretien
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            name="isNonSmoker"
            checked={isNonSmoker}
            onChange={(e) => setIsNonSmoker(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          Non-fumeur
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            name="hasWarranty"
            checked={hasWarranty}
            onChange={(e) => setHasWarranty(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          Garantie
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            name="isDamaged"
            checked={isDamaged}
            onChange={(e) => setIsDamaged(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          A été accidenté
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            name="hasMinorDamage"
            checked={hasMinorDamage}
            onChange={(e) => setHasMinorDamage(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          A été accroché ou petit accident
        </label>
      </div>

      <div className="rounded-2xl border-2 border-amber-200/80 bg-amber-50/75 p-5 shadow-sm backdrop-blur">
        <h3 className="text-sm font-semibold text-slate-900">Certificat CarVertical</h3>
        <p className="mt-2 text-xs text-slate-700 leading-relaxed">
          CarVertical vérifie l’historique du véhicule via le VIN (plus de 900 sources : dommages, kilométrage réel, vols, immatriculations). Tu peux obtenir un rapport via notre site puis l’associer à ton annonce pour rassurer les acheteurs.
        </p>
        <p className="mt-2 text-xs text-slate-600">
          Prix du rapport sur AuTrust : <strong>{CARVERTICAL_PRICE_EUR} €</strong> <span className="text-slate-500">(au lieu de {CARVERTICAL_ORIGINAL_PRICE_EUR.toFixed(2).replace(".", ",")} €, sur Carvertical −{CARVERTICAL_DISCOUNT_PERCENT} %)</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          <a
            href="https://www.carvertical.com/be/fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-sky-600 hover:text-sky-700 underline"
          >
            Obtenir un rapport CarVertical (FR) →
          </a>
          <a
            href="https://youtu.be/LBaaF2YA1bY"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-sky-600 hover:text-sky-700 underline"
          >
            Vidéo explicative →
          </a>
        </div>
        <label className="mt-4 flex items-center gap-3 text-sm text-slate-900">
          <input
            type="checkbox"
            checked={hasCarVerticalVerification}
            onChange={(e) => setHasCarVerticalVerification(e.target.checked)}
            className="h-4 w-4 accent-amber-600"
          />
          <span>Je souhaite le rapport *</span>
        </label>
      </div>

      <div>
        <label className="text-sm text-slate-700">Description</label>
        <textarea
          name="description"
          required
          minLength={LISTING_DESCRIPTION_MIN_LENGTH}
          rows={7}
          placeholder="État, entretien, options, défauts, etc."
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">
          Minimum {LISTING_DESCRIPTION_MIN_LENGTH} caractères.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
        <div className="text-sm font-semibold text-slate-900">Options (à cocher)</div>
        <div className="mt-1 text-sm text-slate-600">
          Coche les équipements présents. Certaines options peuvent être suggérées après décodage VIN.
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {SELLER_OPTION_GROUPS.map((g) => (
            <div key={g.title}>
              <div className="text-xs font-medium text-slate-500">{g.title}</div>
              <div className="mt-2 grid gap-2">
                {g.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-slate-800">
                    <input
                      type="checkbox"
                      checked={sellerOptions.includes(opt)}
                      onChange={() => toggleSellerOption(opt)}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <label className="text-sm text-slate-700">Autres options (texte libre)</label>
          <textarea
            value={sellerOptionsNote}
            onChange={(e) => setSellerOptionsNote(e.target.value)}
            rows={3}
            placeholder="Ex: Pack sport, intérieur cuir, etc."
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
          />
        </div>

        {sellerOptions.length ? (
          <div className="mt-4 text-xs text-slate-600">
            {sellerOptions.length} option(s) sélectionnée(s).
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm text-slate-700">Nom (optionnel)</label>
          <input
            name="contactName"
            placeholder="Ex: Mehdi"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
          />
        </div>
        <div>
          <label className="text-sm text-slate-700">Téléphone (optionnel)</label>
          <input
            name="contactPhone"
            placeholder="Ex: +32 4 123 45 67"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
          />
        </div>
        <div>
          <label className="text-sm text-slate-700">Email (optionnel)</label>
          <input
            name="contactEmail"
            type="email"
            placeholder="Ex: vendeur@email.com"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white/85 px-4 py-3 text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:border-sky-300"
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-slate-700">Photos (jusqu’à 15) — optionnel</label>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={photoBusy}
          onChange={(e) => {
            uploadPhotos(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("ring-2", "ring-sky-400", "bg-sky-50");
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-sky-400", "bg-sky-50");
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove("ring-2", "ring-sky-400", "bg-sky-50");
            if (!photoBusy && e.dataTransfer.files.length) uploadPhotos(e.dataTransfer.files);
          }}
          disabled={photoBusy}
          className="mt-2 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 py-8 text-slate-600 transition hover:border-sky-400 hover:bg-sky-50/50 disabled:opacity-60 disabled:pointer-events-none"
        >
          <span className="text-3xl" aria-hidden>📷</span>
          <span className="mt-2 text-sm font-medium text-slate-700">
            {photoBusy ? "Envoi en cours…" : "Cliquez ici ou déposez vos photos"}
          </span>
          <span className="mt-1 text-xs text-slate-500">Jusqu'à 15 images</span>
        </button>

        {photoError ? <div className="mt-2 text-sm text-red-700">{photoError}</div> : null}

        {photoUrls.length ? (
          <div className="mt-3">
            <div className="text-xs text-slate-600">{photoUrls.length}/15 photo(s) ajoutée(s)</div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {photoUrls.map((u) => (
                <div key={u} className="relative">
                  <Image
                    src={u}
                    alt=""
                    width={400}
                    height={300}
                    className="h-20 w-full rounded-lg object-cover border border-slate-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotoUrls((prev) => prev.filter((x) => x !== u))}
                    className="absolute right-1 top-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/75"
                    aria-label="Supprimer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {state.status === "error" ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={state.status === "submitting"}
        className="rounded-xl bg-emerald-600 px-5 py-3 font-medium text-white hover:bg-emerald-500 transition disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60"
      >
        {state.status === "submitting" ? "Publication..." : "Publier l’annonce"}
      </button>

      {state.status === "success" ? (
        <div className="text-sm text-emerald-700">Annonce publiée (id: {state.id}).</div>
      ) : null}
    </form>
  );
}

