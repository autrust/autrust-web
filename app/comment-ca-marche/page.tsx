import Link from "next/link";

export const metadata = {
  title: "Comment ça marche | AuTrust",
  description:
    "Découvrez comment acheter et vendre un véhicule en toute confiance sur AuTrust : vendeurs vérifiés, acompte sécurisé, transparence VIN.",
};

export default function CommentCaMarchePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/70 via-white to-white">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-10 sm:pt-20">
        <div className="rounded-3xl border bg-white/70 backdrop-blur-md p-8 sm:p-12 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Transparence • Sécurité • Confiance
          </div>

          <h1 className="mt-5 text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900">
            Comment fonctionne AuTrust ?
          </h1>

          <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-600">
            Achetez et vendez en toute confiance, en{" "}
            <span className="font-medium text-slate-900">4 étapes simples</span>.
            AuTrust protège les acheteurs et réduit les fraudes grâce à la
            vérification des vendeurs, l’acompte sécurisé et la transparence des
            informations.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/listings"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-white font-medium shadow-sm hover:bg-emerald-700 transition"
            >
              Explorer les véhicules
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-900 hover:bg-slate-50 transition"
            >
              Déposer une annonce
            </Link>
          </div>

          {/* Trust chips */}
          <div className="mt-8 flex flex-wrap gap-2">
            <Chip>Vendeurs vérifiés</Chip>
            <Chip>Acompte sécurisé</Chip>
            <Chip>VIN & transparence</Chip>
            <Chip>Garages partenaires</Chip>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sellers */}
          <Card
            title="Pour les vendeurs"
            subtitle="Publiez plus vite, avec plus de confiance."
            badge="Vendeur"
          >
            <Steps>
              <Step
                n="1"
                title="Créez votre compte"
                text="Inscription obligatoire pour publier. AuTrust vérifie chaque vendeur pour garantir un environnement fiable."
              />
              <Step
                n="2"
                title="Publiez votre véhicule"
                text="Ajoutez infos, photos et VIN. Vous pouvez activer l’option historique véhicule si disponible."
              />
              <Step
                n="3"
                title="Recevez des acheteurs qualifiés"
                text="Les acheteurs peuvent réserver via acompte sécurisé pour limiter les demandes non sérieuses."
              />
              <Step
                n="4"
                title="Finalisez en toute sécurité"
                text="L’acompte est protégé jusqu’à validation de la transaction. Support AuTrust en cas de souci."
              />
            </Steps>
          </Card>

          {/* Buyers */}
          <Card
            title="Pour les acheteurs"
            subtitle="Achetez sereinement, avec des preuves."
            badge="Acheteur"
          >
            <Steps>
              <Step
                n="1"
                title="Trouvez un véhicule"
                text="Filtrez, comparez, et repérez les badges de confiance sur les annonces."
              />
              <Step
                n="2"
                title="Vérifiez l’historique"
                text="Consultez le rapport véhicule lorsqu’il est proposé (VIN, événements, cohérence des infos)."
              />
              <Step
                n="3"
                title="Réservez via acompte sécurisé"
                text="Bloquez le véhicule en versant un acompte protégé. Plus de sécurité, moins d’arnaques."
              />
              <Step
                n="4"
                title="Finalisez sans stress"
                text="Rendez-vous, contrôle, paiement final. AuTrust peut assister en cas de litige."
              />
            </Steps>

            <div className="mt-6 rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Astuce AuTrust</p>
              <p className="mt-1">
                Privilégiez les annonces{" "}
                <span className="font-medium">Vendeur vérifié</span> et{" "}
                <span className="font-medium">Garage partenaire</span> pour une
                expérience encore plus fiable.
              </p>
            </div>
          </Card>
        </div>

        {/* CTA strip */}
        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Prêt à passer à la nouvelle norme du marché automobile ?
            </h2>
            <p className="mt-1 text-slate-600">
              Rejoignez AuTrust et profitez d’une marketplace plus sûre.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-900 hover:bg-slate-50 transition"
            >
              Créer un compte
            </Link>
            <Link
              href="/sell"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-white font-medium hover:bg-slate-800 transition"
            >
              Je suis le vendeur
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
      {children}
    </span>
  );
}

function Card({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-slate-600">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full bg-sky-600/10 text-sky-700 border border-sky-200 px-3 py-1 text-sm font-medium">
          {badge}
        </span>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>;
}

function Step({
  n,
  title,
  text,
}: {
  n: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 text-sm font-semibold">
        {n}
      </span>
      <div>
        <h3 className="font-medium text-slate-900">{title}</h3>
        <p className="mt-0.5 text-sm text-slate-600">{text}</p>
      </div>
    </div>
  );
}
