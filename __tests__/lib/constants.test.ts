import { describe, it, expect } from "vitest";
import {
  CARVERTICAL_ORIGINAL_PRICE_EUR,
  CARVERTICAL_PRICE_EUR,
  CARVERTICAL_DISCOUNT_PERCENT,
  MAX_LISTINGS_PARTICULIER,
  PROMO_PRO_END_DATE,
  isProPromoActive,
} from "@/lib/constants";

describe("constants CarVertical", () => {
  it("prix original et prix AuTrust sont cohérents", () => {
    expect(CARVERTICAL_ORIGINAL_PRICE_EUR).toBe(31.99);
    expect(CARVERTICAL_PRICE_EUR).toBe(14.99);
  });

  it("le pourcentage de réduction est calculé correctement", () => {
    const expected = Math.round(
      ((CARVERTICAL_ORIGINAL_PRICE_EUR - CARVERTICAL_PRICE_EUR) /
        CARVERTICAL_ORIGINAL_PRICE_EUR) *
        100
    );
    expect(CARVERTICAL_DISCOUNT_PERCENT).toBe(expected);
    expect(CARVERTICAL_DISCOUNT_PERCENT).toBe(53);
  });
});

describe("MAX_LISTINGS_PARTICULIER", () => {
  it("définit la limite pour les particuliers", () => {
    expect(MAX_LISTINGS_PARTICULIER).toBe(5);
  });
});

describe("promo pro", () => {
  it("PROMO_PRO_END_DATE est le 1er juillet 2026", () => {
    expect(PROMO_PRO_END_DATE.toISOString()).toBe("2026-07-01T00:00:00.000Z");
  });

  it("isProPromoActive retourne un booléen", () => {
    expect(typeof isProPromoActive()).toBe("boolean");
  });
});
