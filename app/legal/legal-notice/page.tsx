import { LegalLayout } from "@/app/_components/LegalLayout";
import { getLegalMarkdown } from "@/lib/legal-content";

export const metadata = {
  title: "Mentions légales | AuTrust",
  description:
    "Mentions légales et informations sur l'éditeur de la plateforme AuTrust.",
};

export default function LegalNoticePage() {
  const content = getLegalMarkdown("legalNotice");
  return (
    <LegalLayout title="Mentions légales">
      <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{content}</pre>
    </LegalLayout>
  );
}
