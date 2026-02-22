import { LegalLayout } from "@/app/_components/LegalLayout";
import { getLegalMarkdown } from "@/lib/legal-content";

export const metadata = {
  title: "Cookies | AuTrust",
  description: "Informations sur l'utilisation des cookies sur le site AuTrust.",
};

export default function CookiesPage() {
  const content = getLegalMarkdown("cookies");
  return (
    <LegalLayout title="Politique cookies">
      <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{content}</pre>
    </LegalLayout>
  );
}
