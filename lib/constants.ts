/** Nombre max d'annonces actives pour un compte particulier. Au-delà, création refusée et alerte admin (vente pro sans numéro de TVA). */
export const MAX_LISTINGS_PARTICULIER = 5;

/** Nombre minimum de caractères pour la description d'une annonce (déposer une annonce). */
export const LISTING_DESCRIPTION_MIN_LENGTH = 20;

/** CarVertical : prix affiché (réduction par rapport au prix public). */
export const CARVERTICAL_ORIGINAL_PRICE_EUR = 31.99;
export const CARVERTICAL_PRICE_EUR = 14.99;
export const CARVERTICAL_PRICE_CENTS = Math.round(CARVERTICAL_PRICE_EUR * 100);
export const CARVERTICAL_DISCOUNT_PERCENT = Math.round(
  ((CARVERTICAL_ORIGINAL_PRICE_EUR - CARVERTICAL_PRICE_EUR) / CARVERTICAL_ORIGINAL_PRICE_EUR) * 100
);

/** Promo lancement : professionnels gratuits jusqu'au 1er juillet 2026 (sauf rapport CarVertical). Top annonces et Boost restent toujours payants (Stripe). Après le 1er juil., les packs pro passent aussi par Stripe. */
export const PROMO_PRO_END_LABEL = "1er juillet 2026";
/** Fin de la promo : à partir de cette date (inclus), les packs pro sont payants via Stripe. */
export const PROMO_PRO_END_DATE = new Date("2026-07-01T00:00:00.000Z");

export function isProPromoActive(): boolean {
  return new Date() < PROMO_PRO_END_DATE;
}

export const PROMO_LANCEMENT_PRO =
  "Promo lancement : gratuit jusqu'au 1er juillet 2026 (sauf rapport CarVertical 14,99 €).";
