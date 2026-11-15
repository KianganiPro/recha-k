/**
 * Valeurs du client — chaque valeur n'existe qu'ici.
 * Chaque entrée a un repli : le site fonctionne sans variable d'environnement.
 * Les variables ne servent qu'à faire varier une valeur entre production et
 * préversion (VITE_SITE_URL sur une préversion Vercel, par exemple).
 *
 * Ce fichier est aussi lu côté Node (vite.config.js) : import.meta.env y est
 * absent, d'où le try/catch de env().
 */
const env = (key, fallback) => {
  try {
    return import.meta.env?.[key] || fallback;
  } catch {
    return fallback;
  }
};

export const SITE = {
  name: "Recha K", // tel qu'il s'écrit dans la barre de navigation
  shortName: "Recha K", // tel qu'il apparaît dans un onglet
  // À CONFIRMER : intitulé du métier, utilisé dans le h1, le title et le
  // JSON-LD. Déduit des types de mission du brief, pas fourni par le client.
  metier: "Creative Director",
  lang: "en",
  locale: "en_US",
  since: 2026,
  // À CONFIRMER : domaine définitif. Utilisé pour canonical, Open Graph et
  // sitemap (scripts/generate-sitemap.mjs relit cette ligne).
  url: env("VITE_SITE_URL", "https://recha-k.com"),

  /* --- contacts --- */
  email: "kiangani.pro@gmail.com",

  /* --- réseaux : URL exactes à fournir (brief non rempli) --- */
  socials: {
    instagram: "https://www.instagram.com/rrrrrecha",
    // linkedin: "https://www.linkedin.com/in/…/",
  },

    editeur: {
    statut: "Sole Proprietor (SP)",
    adresse: "",   // adresse de domiciliation de l'entreprise
    telephone: "", // obligatoire pour une personne physique
    siret: "",
    immatriculation: "Registered with the National Business Registry (RNE)",
    tva: "",       // n° de TVA intracommunautaire, si applicable
  },

  /* --- formulaires ---
     Clé Web3Forms à créer sur web3forms.com avec kiangani.pro@gmail.com.
     Publique par conception : elle n'autorise que l'envoi vers cette adresse.
     Vide = le formulaire affiche directement le repli « écrivez-moi ». */
  forms: {
    contact: env("VITE_WEB3FORMS_KEY", "d097805f-9119-4da9-962c-d9fa161afb38"),
  },
};

/** Liste prête à l'emploi (vide tant que le brief ne donne pas les comptes). */
  export const SOCIAL_LINKS = Object.entries(SITE.socials)
    .filter(([, href]) => href)
    .map(([id, href]) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
      href,
      icone: `/icons/${id}.svg`,
    }));

export const mailto = (subject) =>
  `mailto:${SITE.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;

export default SITE;
