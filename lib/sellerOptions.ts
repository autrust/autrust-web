export const SELLER_OPTION_GROUPS: Array<{ title: string; options: string[] }> = [
  {
    title: "Confort",
    options: [
      "Climatisation",
      "Climatisation automatique",
      "Sièges chauffants",
      "Volant chauffant",
      "Toit ouvrant / panoramique",
      "Vitres électriques",
      "Rétroviseurs électriques",
      "Démarrage sans clé",
      "Accès sans clé",
    ],
  },
  {
    title: "Multimédia",
    options: [
      "GPS / Navigation",
      "Bluetooth",
      "USB",
      "Apple CarPlay",
      "Android Auto",
      "Écran tactile",
      "Système audio premium",
    ],
  },
  {
    title: "Sécurité & Aides",
    options: [
      "ABS",
      "ESP/ESC",
      "Airbags",
      "Régulateur de vitesse",
      "Régulateur adaptatif",
      "Limiteur de vitesse",
      "Aide au maintien dans la voie",
      "Alerte collision avant",
      "Surveillance angle mort",
      "Capteurs de stationnement",
      "Caméra de recul",
      "Détecteur de pluie",
      "Détecteur de luminosité",
      "Contrôle pression pneus (TPMS)",
    ],
  },
  {
    title: "Extérieur",
    options: ["Jantes alliage", "Feux LED", "Phares xénon", "Barres de toit", "Crochet d’attelage"],
  },
];

export const ALL_SELLER_OPTIONS = SELLER_OPTION_GROUPS.flatMap((g) => g.options);
