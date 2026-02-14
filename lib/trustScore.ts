/**
 * Score de confiance vendeur sur 100 points.
 * Répartition :
 * - Identité vérifiée : 25 pts (email + téléphone + KYC)
 * - Historique : 25 pts (nombre d’annonces publiées)
 * - Avis : 25 pts (moyenne des notes sur 5 → proportionnel)
 * - Compte ancien : 25 pts (ancienneté du compte AuTrust)
 */

export type TrustScoreBreakdown = {
  identite: number;   // 0–25
  historique: number; // 0–25
  avis: number;      // 0–25
  compteAncien: number; // 0–25
};

export type TrustScoreResult = {
  total: number;
  breakdown: TrustScoreBreakdown;
};

type SellerForScore = {
  createdAt: Date;
  emailVerifiedAt: Date | null;
  phoneVerifiedAt: Date | null;
  kyc?: { status: string } | null;
};

export function computeTrustScore(
  seller: SellerForScore | null,
  options: {
    listingsCount: number;
    ratingsAverage: number; // 0–5
    ratingsCount: number;
  }
): TrustScoreResult {
  const breakdown: TrustScoreBreakdown = {
    identite: 0,
    historique: 0,
    avis: 0,
    compteAncien: 0,
  };

  if (!seller) {
    return { total: 0, breakdown };
  }

  // Identité vérifiée : 25 pts (email + tél + KYC)
  const identityOk =
    Boolean(seller.emailVerifiedAt) &&
    Boolean(seller.phoneVerifiedAt) &&
    seller.kyc?.status === "VERIFIED";
  breakdown.identite = identityOk ? 25 : 0;

  // Historique : 25 pts (annonces publiées, 5 pts par annonce, max 25)
  breakdown.historique = Math.min(25, options.listingsCount * 5);

  // Avis : 25 pts (moyenne sur 5 → proportionnel à 25; pas d’avis = 0)
  breakdown.avis =
    options.ratingsCount > 0
      ? Math.round((options.ratingsAverage / 5) * 25)
      : 0;

  // Compte ancien : 25 pts (25 pts à 24 mois, proportionnel avant)
  const now = new Date();
  const months = Math.max(
    0,
    (now.getFullYear() - seller.createdAt.getFullYear()) * 12 +
      (now.getMonth() - seller.createdAt.getMonth())
  );
  breakdown.compteAncien = Math.min(25, Math.floor(months * (25 / 24)));

  const total = Math.min(
    100,
    breakdown.identite +
      breakdown.historique +
      breakdown.avis +
      breakdown.compteAncien
  );

  return { total, breakdown };
}
