/**
 * Prestataires cités dans les mentions légales et la politique de
 * confidentialité. Informations relevées le 11/11/2026 sur leurs pages
 * légales — à revérifier une fois par an.
 *
 * Base rédigée à partir de la fiche service-public.fr F37351 et des DPA des
 * prestataires : ce n'est pas une consultation juridique.
 *
 * Vercel ne publie pas de numéro de téléphone (la LCEN en demande un pour
 * l'hébergeur) : on renvoie à sa page de contact, pratique courante.
 */
export const HEBERGEUR = {
  nom: "Vercel Inc.",
  adresse: "440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis",
  contact: "https://vercel.com/contact",
};

export const PRESTATAIRES = [
  {
    id: "web3forms",
    nom: "Web3Forms (Web3Creative)",
    role: "transmission des messages du formulaire de contact",
    lieu: "Inde ; serveurs dans l'Union européenne et aux États-Unis",
    garanties: "clauses contractuelles types de la Commission européenne",
    conservation: "3 ans maximum chez le prestataire",
  },
  {
    id: "sanity",
    nom: "Sanity",
    role: "stockage et diffusion des images et vidéos des projets",
    lieu: "Google Cloud, Belgique et États-Unis",
    garanties: "garanties de son accord de traitement des données (DPA)",
    conservation: "journaux techniques uniquement (adresse IP)",
  },
  {
    id: "vercel",
    nom: "Vercel Inc.",
    role: "hébergement du site",
    lieu: "États-Unis",
    garanties: "garanties de son accord de traitement des données (DPA)",
    conservation: "journaux techniques uniquement (adresse IP)",
  },
];

/** Durée de conservation des messages reçus (recommandation CNIL pour un contact commercial). */
export const DUREE_CONSERVATION = "3 ans à compter du dernier échange";
