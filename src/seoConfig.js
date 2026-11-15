import { SITE } from "./config/site.js";
import { formaterDate } from "./projets.js";
import { ROUTES, cheminCategorie, cheminProjet } from "./routes.js";

/**
 * Métadonnées par page. Limites d'affichage Google : 60 caractères pour un
 * title, 160 pour une description — vérifiées par test/seo.test.jsx.
 */
export const LIMITES = { title: 60, description: 160 };

/** Coupe proprement au dernier mot entier, avec points de suspension. */
export function tronquer(texte, max) {
  const t = String(texte ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const coupe = t.slice(0, max - 1);
  const dernierEspace = coupe.lastIndexOf(" ");
  return `${(dernierEspace > max * 0.6 ? coupe.slice(0, dernierEspace) : coupe).replace(/[\s,;:.—–-]+$/, "")}…`;
}

export const OG_IMAGE = "/og-image.jpg"; // 1200×630, < 300 Ko

export const SEO = {
  accueil: {
    title: `${SITE.name} — ${SITE.metier}`,
    description: `${SITE.name}'s portfolio: 360° campaigns, social media advertising, content creation, and branded content.`,
    path: ROUTES.accueil,
  },
  projets: {
    title: `Projects — ${SITE.shortName}`,
    description: `All projects by ${SITE.name}: 360° campaigns, social media advertising, content creation, and branded content.`,
    path: ROUTES.projets,
  },
  contact: {
    title: `Contact — ${SITE.name}`,
    description: `Have a project or collaboration in mind? Contact ${SITE.name} using this form or by email.`,
    path: ROUTES.contact,
  },
  mentions: {
    title: `Legal Notice — ${SITE.shortName}`,
    description: `Legal Notice and Privacy Policy for the ${SITE.name} portfolio: publisher, hosting, personal data.`,
    path: ROUTES.mentions,
  },
  introuvable: {
    title: `Page Not Found — ${SITE.shortName}`,
    description: "This page does not exist or has been moved. See all projects on the home page.",
    path: null,
    robots: "noindex, follow",
  },
};

/** Métadonnées de la page collection filtrée sur une catégorie. */
export function seoCategorie(c) {
  return {
    title: tronquer(`${c.titre} — Projects — ${SITE.shortName}`, LIMITES.title),
    description: tronquer(`Projects by ${SITE.name} in the category ${c.titre}.`, LIMITES.description),
    path: cheminCategorie(c.slug),
  };
}

/** Métadonnées d'une page projet, dérivées du contenu du CMS. */
export function seoProjet(p) {
  const date = formaterDate(p.date);
  const resume = [p.mission, date].filter(Boolean).join(", ");
  const description =
    p.description ||
    `${p.titre}${resume ? ` — ${resume}` : ""}. A project from the portfolio of ${SITE.name}.`;
  return {
    title: tronquer(`${p.titre} — ${SITE.shortName}`, LIMITES.title),
    description: tronquer(description, LIMITES.description),
    path: cheminProjet(p.slug),
    image: p.medias.find((m) => m.type === "image")?.src,
    type: "article",
  };
}

/** Données structurées du site (index.html) : un site personnel, une personne. */
export function jsonLd(url = SITE.url) {
  const sameAs = Object.values(SITE.socials).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#site`,
        url,
        name: SITE.name,
        inLanguage: "fr-FR",
        publisher: { "@id": `${url}/#personne` },
      },
      {
        "@type": "Person",
        "@id": `${url}/#personne`,
        name: SITE.name,
        jobTitle: SITE.metier,
        email: `mailto:${SITE.email}`,
        url,
        ...(sameAs.length ? { sameAs } : {}),
      },
    ],
  };
}
