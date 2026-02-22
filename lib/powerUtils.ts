/** 1 kW = 1.35962 ch (chevaux, metric horsepower) */
const KW_TO_CH = 1.35962;

export function kwToCh(kw: number): number {
  return Math.round(kw * KW_TO_CH);
}

export function chToKw(ch: number): number {
  return Math.round((ch / KW_TO_CH) * 10) / 10;
}

/** Affiche la puissance en "X kW (Y ch)" */
export function formatPower(kw: number | null | undefined): string {
  if (kw == null || !Number.isFinite(kw)) return "";
  const ch = kwToCh(kw);
  return `${kw} kW (${ch} ch)`;
}
