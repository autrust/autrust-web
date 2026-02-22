import sanitizeHtml from "sanitize-html";

/**
 * Options strictes : aucun tag HTML autorisé, uniquement du texte.
 * Protège contre les injections XSS dans les champs utilisateur.
 */
const STRIP_ALL_OPTIONS = {
  allowedTags: [] as string[],
  allowedAttributes: {} as Record<string, string[]>,
  disallowedTagsMode: "discard" as const,
};

/**
 * Sanitize un texte utilisateur : supprime tout HTML et normalise les espaces.
 * À utiliser avant stockage pour description, titre, message contact, etc.
 */
export function sanitizeText(input: string, maxLength?: number): string {
  if (typeof input !== "string") return "";
  const stripped = sanitizeHtml(input.trim(), STRIP_ALL_OPTIONS);
  const normalized = stripped.replace(/\s+/g, " ").trim();
  if (maxLength != null && maxLength > 0) {
    return normalized.slice(0, maxLength);
  }
  return normalized;
}

/**
 * Vérifie qu'une URL de redirection est sûre (chemin relatif same-origin).
 * À utiliser pour le paramètre ?next= après login/register.
 */
export function isSafeRedirectPath(path: string | null | undefined): boolean {
  if (path == null || typeof path !== "string") return false;
  const trimmed = path.trim();
  // Doit commencer par / mais pas par // (protocol-relative)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return false;
  // Pas de backslash, pas de : (évite javascript: ou autre scheme)
  if (trimmed.includes("\\") || trimmed.includes(":")) return false;
  // Longueur raisonnable
  if (trimmed.length > 500) return false;
  return true;
}
