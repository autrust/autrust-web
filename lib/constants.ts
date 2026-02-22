/** Nombre max d'annonces actives pour un compte particulier. Au-delà, création refusée et alerte admin (vente pro sans numéro de TVA). */
export const MAX_LISTINGS_PARTICULIER = 5;

/** CarVertical : prix affiché (réduction par rapport au prix public). */
export const CARVERTICAL_ORIGINAL_PRICE_EUR = 31.99;
export const CARVERTICAL_PRICE_EUR = 14.99;
export const CARVERTICAL_PRICE_CENTS = Math.round(CARVERTICAL_PRICE_EUR * 100);
export const CARVERTICAL_DISCOUNT_PERCENT = Math.round(
  ((CARVERTICAL_ORIGINAL_PRICE_EUR - CARVERTICAL_PRICE_EUR) / CARVERTICAL_ORIGINAL_PRICE_EUR) * 100
);
