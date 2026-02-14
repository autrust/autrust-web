import Link from "next/link";

export const metadata = {
  title: "Conditions générales – Utilisateur privé | AuTrust",
  description:
    "Conditions générales applicables aux utilisateurs privés de la plateforme AuTrust conformément au droit belge et européen.",
};

export default function ConditionsUtilisateurPrive() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">
          Conditions générales – Utilisateur privé
        </h1>

        <p className="mt-4 text-slate-600">
          Date effective : [À compléter]
        </p>

        <div className="mt-10 space-y-10 text-slate-700 leading-relaxed">

          <Section title="1. Identification">
            <p>
              AuTrust<br />
              Dénomination sociale : [À compléter]<br />
              Siège social : [À compléter]<br />
              Numéro d'entreprise : [À compléter]<br />
              Email : [À compléter]<br />
              Téléphone : [À compléter]
            </p>
          </Section>

          <Section title="2. Objet">
            <p>
              Les présentes conditions régissent l'utilisation de la plateforme
              AuTrust par un utilisateur privé (personne physique agissant à des
              fins non professionnelles).
            </p>
            <p className="mt-3">
              AuTrust est une plateforme numérique permettant :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>La consultation d'annonces de véhicules</li>
              <li>La publication d'annonces</li>
              <li>La mise en relation entre acheteurs et vendeurs</li>
              <li>L'utilisation éventuelle d'un service d'acompte sécurisé</li>
              <li>Des services de vérification et de transparence</li>
            </ul>
            <p className="mt-3">
              AuTrust agit exclusivement comme prestataire technique de mise en relation.
              AuTrust n'est ni vendeur, ni acheteur, ni intermédiaire contractuel.
            </p>
          </Section>

          <Section title="3. Portée territoriale">
            <p>
              La plateforme est accessible dans l'Union européenne.
              Les transactions peuvent être conclues entre utilisateurs situés
              dans différents États membres.
            </p>
            <p className="mt-3">
              Il appartient aux utilisateurs de respecter la législation applicable
              à leur pays, notamment en matière d'immatriculation, fiscalité,
              TVA et import/export.
            </p>
          </Section>

          <Section title="4. Inscription">
            <p>
              La publication d'annonces nécessite la création d'un compte.
            </p>
            <p className="mt-3">
              L'utilisateur garantit :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Être majeur</li>
              <li>Être juridiquement capable</li>
              <li>Fournir des informations exactes</li>
              <li>Maintenir ces informations à jour</li>
            </ul>
            <p className="mt-3">
              AuTrust peut suspendre un compte en cas d'informations inexactes
              ou frauduleuses.
            </p>
          </Section>

          <Section title="5. Publication d'annonces">
            <p>
              Le vendeur privé garantit :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Être propriétaire du véhicule ou autorisé à le vendre</li>
              <li>L'exactitude des informations publiées</li>
              <li>La véracité du kilométrage</li>
              <li>La conformité des photos</li>
              <li>L'authenticité du prix affiché</li>
            </ul>
            <p className="mt-3">
              Il est interdit de publier des annonces fictives, multiples,
              trompeuses ou illégales.
            </p>
            <p>
              AuTrust peut supprimer toute annonce non conforme.
            </p>
          </Section>

          <Section title="6. Service d'acompte sécurisé">
            <p>
              AuTrust peut proposer un service permettant de sécuriser une
              réservation via le versement d'un acompte.
            </p>
            <p className="mt-3">
              Les fonds peuvent être gérés par un prestataire de services de paiement
              agréé ou un établissement bancaire partenaire.
            </p>
            <p className="mt-3">
              AuTrust n'agit pas en qualité d'établissement de paiement et n'est
              pas partie au contrat de vente.
            </p>
            <p>
              Les modalités de libération ou restitution des fonds sont définies
              au moment de la transaction.
            </p>
          </Section>

          <Section title="7. Responsabilité du contenu">
            <p>
              L'utilisateur est seul responsable du contenu qu'il publie.
              AuTrust n'effectue pas de vérification exhaustive des annonces.
            </p>
            <p>
              L'utilisateur garantit AuTrust contre toute réclamation liée au contenu publié.
            </p>
          </Section>

          <Section title="8. Modération et signalement">
            <p>
              AuTrust peut supprimer, limiter ou bloquer tout contenu non conforme.
              En cas de violation répétée, le compte peut être définitivement suspendu.
            </p>
            <p>
              AuTrust respecte les obligations prévues par le Digital Services Act (DSA).
            </p>
          </Section>

          <Section title="9. Droits d'utilisation">
            <p>
              En publiant une annonce, l'utilisateur accorde à AuTrust un droit
              non exclusif, mondial, gratuit et transférable de reproduction,
              modification et diffusion du contenu.
            </p>
          </Section>

          <Section title="10. Droits sur la base de données">
            <p>
              La structure et le contenu de la base de données sont protégés.
              Toute extraction massive ou reproduction commerciale est interdite.
            </p>
          </Section>

          <Section title="11. Limitation de responsabilité">
            <p>
              AuTrust n'est pas responsable :
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Des défauts des véhicules</li>
              <li>Des informations inexactes publiées</li>
              <li>Des fraudes entre utilisateurs</li>
              <li>Des obligations fiscales liées à la vente</li>
            </ul>
            <p>
              La responsabilité d'AuTrust est limitée aux cas de faute intentionnelle
              ou grave.
            </p>
          </Section>

          <Section title="12. Sécurité">
            <p>
              Les utilisateurs doivent vérifier la réception effective des paiements
              avant toute remise du véhicule.
            </p>
            <p>
              AuTrust ne peut être tenu responsable en cas de fraude entre utilisateurs.
            </p>
          </Section>

          <Section title="13. Protection des données">
            <p>
              Les données personnelles sont traitées conformément au RGPD
              (Règlement UE 2016/679) et au droit belge applicable.
            </p>
          </Section>

          <Section title="14. Droit de rétractation">
            <p>
              Pour les services payants, le consommateur dispose d'un délai de
              14 jours pour exercer son droit de rétractation.
            </p>
          </Section>

          <Section title="15. Droit applicable">
            <p>
              Les présentes conditions sont régies par le droit belge,
              dans le respect des règles impératives du droit européen.
            </p>
            <p>
              Les tribunaux compétents sont ceux de [Ville à compléter].
            </p>
          </Section>

        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-900 underline underline-offset-2"
          >
            Retour à l'accueil
          </Link>
        </div>
      </section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
