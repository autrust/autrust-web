import { LegalLayout } from "@/app/_components/LegalLayout";
import { getLegalMarkdown } from "@/lib/legal-content";

export const metadata = {
  title: "Politique de confidentialité | AuTrust",
  description:
    "Politique de confidentialité et protection des données personnelles sur AuTrust.",
};

export default function PrivacyPage() {
  const content = getLegalMarkdown("privacy");
  return (
    <LegalLayout title="Protection des données (RGPD)">
      <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{content}</pre>
    </LegalLayout>
  );
}
