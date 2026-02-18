export const LOCALE_COOKIE = "NEXT_LOCALE";
export type Locale = "fr" | "en";

export const LOCALES: Locale[] = ["fr", "en"];

export function getLocaleFromCookie(cookieValue: string | undefined): Locale {
  if (cookieValue === "en" || cookieValue === "fr") return cookieValue;
  return "fr";
}
