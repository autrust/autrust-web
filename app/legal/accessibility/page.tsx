import { LegalLayout } from "@/app/_components/LegalLayout";
import { getLegalMarkdown } from "@/lib/legal-content";

export const metadata = {
  title: "Déclaration d'accessibilité | AuTrust",
  description: "Déclaration d'accessibilité du site AuTrust.",
};

export default function AccessibilityPage() {
  const content = getLegalMarkdown("accessibility");
  return (
    <LegalLayout title="Déclaration d'accessibilité">
      <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{content}</pre>
    </LegalLayout>
  );
}
