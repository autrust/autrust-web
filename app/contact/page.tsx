import Link from "next/link";
import { ContactForm } from "./ContactForm";

export const metadata = {
  title: "Contact | AuTrust",
  description:
    "Contactez l'équipe AuTrust pour toute question, problème technique ou demande concernant la plateforme.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Nous contacter
        </h1>
        <p className="mt-3 text-slate-600">
          Une question, un problème technique ou une demande ? Envoyez-nous un message, nous vous répondrons au plus vite.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ContactForm />
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Vous pouvez aussi consulter les{" "}
          <Link href="/legal/legal-notice" className="text-sky-600 hover:underline">
            mentions légales
          </Link>{" "}
          pour les coordonnées de l'éditeur.
        </p>
      </section>
    </main>
  );
}
