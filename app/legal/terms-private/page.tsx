import { LegalLayout } from "@/app/_components/LegalLayout";
import { getLegalMarkdown } from "@/lib/legal-content";

export const metadata = {
  title: "Conditions d'utilisation — Utilisateur privé | AuTrust",
  description:
    "Conditions générales d'utilisation de la plateforme AuTrust pour les utilisateurs privés.",
};

export default function TermsPrivatePage() {
  const content = getLegalMarkdown("termsPrivate");
  return (
    <LegalLayout title="Conditions d'utilisation — Utilisateur privé">
      <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{content}</pre>
    </LegalLayout>
  );
}
