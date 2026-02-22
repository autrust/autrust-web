import { LegalLayout } from "@/app/_components/LegalLayout";
import { getLegalMarkdown } from "@/lib/legal-content";

export const metadata = {
  title: "Rapports d'historique véhicule (CarVertical) | AuTrust",
  description:
    "Clause spécifique relative aux rapports d'historique de véhicules fournis par CarVertical sur AuTrust.",
};

export default function ReportHistoryPage() {
  const content = getLegalMarkdown("reportHistory");
  return (
    <LegalLayout title="Rapports d'historique véhicule (CarVertical)">
      <pre style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{content}</pre>
    </LegalLayout>
  );
}
