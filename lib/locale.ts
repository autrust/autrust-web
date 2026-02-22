export const LOCALE_COOKIE = "NEXT_LOCALE";
export type Locale = "fr" | "en" | "nl" | "de";

export const LOCALES: Locale[] = ["fr", "en", "nl", "de"];

export function getLocaleFromCookie(cookieValue: string | undefined): Locale {
  if (cookieValue === "en" || cookieValue === "fr" || cookieValue === "nl" || cookieValue === "de") return cookieValue;
  return "fr";
}
