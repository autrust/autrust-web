import { LegalLayout } from "@/app/_components/LegalLayout";
import { getLegalMarkdown } from "@/lib/legal-content";

export const metadata = {
  title: "Conditions — Professionnels | AuTrust",
  description:
    "Conditions générales applicables aux professionnels sur la plateforme AuTrust.",
};

export default function TermsProPage() {
  const content = getLegalMarkdown("termsPro");
  return (
    <LegalLayout title="Conditions — Professionnels">
      <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{content}</pre>
    </LegalLayout>
  );
}
