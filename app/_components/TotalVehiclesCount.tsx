import { prisma } from "@/lib/db";
import type { Locale } from "@/lib/locale";
import { getTranslations } from "@/lib/translations";

export async function TotalVehiclesCount({
  locale = "fr",
  variant = "default",
}: {
  locale?: Locale;
  variant?: "default" | "light";
}) {
  const total = await prisma.listing
    .count({
      where: { status: "ACTIVE" },
    })
    .catch(() => 0);
  const t = getTranslations(locale);
  const label = total === 1 ? t.common.vehiclesSingular : t.common.vehiclesPlural;

  const localeTag = locale === "nl" ? "nl-BE" : locale === "de" ? "de-DE" : locale === "en" ? "en-GB" : "fr-BE";
  return (
    <span className={variant === "light" ? "text-xs text-white/90" : "text-xs text-slate-500"}>
      {total.toLocaleString(localeTag)} {label}
    </span>
  );
}
