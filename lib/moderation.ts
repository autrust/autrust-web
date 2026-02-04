export type ModerationResult =
  | { ok: true }
  | {
      ok: false;
      reason: string;
    };

const BANNED_TERMS = [
  "whatsapp uniquement",
  "crypto",
  "bitcoin",
  "escrow",
  "western union",
  "arnaque",
];

export function moderateListingInput(input: {
  title: string;
  description: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
}): ModerationResult {
  const title = input.title.trim();
  const description = input.description.trim();

  if (title.length < 8) return { ok: false, reason: "Titre trop court." };
  if (description.length < 20) return { ok: false, reason: "Description trop courte." };

  const hay = `${title}\n${description}`.toLocaleLowerCase("fr-BE");
  const hit = BANNED_TERMS.find((t) => hay.includes(t));
  if (hit) return { ok: false, reason: `Contenu bloqué (mot-clé détecté: "${hit}").` };

  // MVP: on ne valide pas les photos ici.
  // Plus tard: brancher une vraie modération IA (texte + image) et stocker un statut (PENDING/APPROVED/REJECTED).
  return { ok: true };
}

