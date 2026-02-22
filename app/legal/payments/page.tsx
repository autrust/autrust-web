import { LegalLayout } from "@/app/_components/LegalLayout";
import { getLegalMarkdown } from "@/lib/legal-content";

export const metadata = {
  title: "Conditions de paiement / acompte | AuTrust",
  description:
    "Conditions de paiement et acompte sur la plateforme AuTrust.",
};

export default function PaymentsPage() {
  const content = getLegalMarkdown("payments");
  return (
    <LegalLayout title="Conditions de paiement / acompte">
      <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{content}</pre>
    </LegalLayout>
  );
}
