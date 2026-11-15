/**
 * Design system du portfolio — la source unique.
 *
 * Trois familles : COULEUR, TYPO, ESPACE/GRILLE, plus le mouvement (EASE,
 * DUR) et les formes (RADIUS). Chaque jeton porte un nom de RÔLE.
 *
 * Ces jetons sortent aussi en variables CSS (--c-*, --ease-*, --dur-*) via
 * cssVariables() : le plugin de vite.config.js les injecte dans index.html
 * au build, donc le CSS et Tailwind lisent les mêmes valeurs que le JS,
 * sans flash au premier affichage.
 */

/* ------------------------------------------------------------------ */
/* 1. Couleurs                                                         */
/* ------------------------------------------------------------------ */

/** Palette brute — privée au fichier. Brief : #E0E2DB, #141414, #606060. */
const PALETTE = {
  encre: "#141414", // préchargeur, texte principal
  graphite: "#606060", // accent du brief — sert surtout de texte secondaire
  sauge: "#FFF", // surface du brief, fond de l'intro
  saugeClaire: "#ECEDE8", // champs de formulaire, ressort sur la surface
  saugeMoyenne: "#C9CBC3", // filets et séparateurs
  blanc: "#FFFFFF",

  rouge: "#8F1D1D",
  rouge50: "#F3E3E1",
  vert: "#2B5A37",
  vert50: "#E1EADF",
  ocre: "#6E4C0E",
  ocre50: "#EFE6D2",
  glitchRouge: "#FF0040",
  glitchCyan: "#00E5FF",
};

export const COULEUR = {
  texte: {
    principal: PALETTE.encre,
    secondaire: PALETTE.graphite, // dates, légendes, étiquettes
    inverse: PALETTE.sauge, // texte sur fond encre (préchargeur)
    surAccent: PALETTE.blanc,
  },
  fond: {
    page: PALETTE.sauge, // canevas par défaut (accueil, contact)
    carte: PALETTE.saugeClaire,
    doux: PALETTE.saugeMoyenne,
    encre: PALETTE.encre, // préchargeur
    accent: PALETTE.graphite,
    accentDoux: PALETTE.saugeMoyenne,
  },
  bordure: {
    douce: PALETTE.saugeMoyenne,
    marquee: PALETTE.encre,
  },
  marque: {
    accent: PALETTE.graphite,
    accentProfond: PALETTE.encre,
  },
  etat: {
    erreur: PALETTE.rouge,
    erreurFond: PALETTE.rouge50,
    succes: PALETTE.vert,
    succesFond: PALETTE.vert50,
    attention: PALETTE.ocre,
    attentionFond: PALETTE.ocre50,
  },
  effet: {
    glitchA: PALETTE.glitchRouge,
    glitchB: PALETTE.glitchCyan,
  },
};

/** alpha(COULEUR.fond.encre, 0.12) → "rgba(20, 20, 20, 0.12)" */
export function alpha(hex, opacity) {
  const value = String(hex).replace("#", "");
  const full =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/** Luminance relative WCAG 2.x d'une couleur hexadécimale. */
export function luminance(hex) {
  const v = String(hex).replace("#", "");
  const full = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const canal = (i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4);
}

/** Rapport de contraste WCAG entre deux couleurs (1 à 21). */
export function contraste(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Couleur valide « #RRGGBB » (ou « #RGB ») — sinon on retombe sur le fond par défaut. */
export function estHex(v) {
  return typeof v === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
}

/**
 * Encre à poser sur un fond de projet choisi dans le CMS.
 * Le client ne choisit que la couleur de fond : on en déduit l'encre (claire
 * ou sombre) qui contraste le mieux. Pas de second champ à remplir, et pas de
 * texte illisible si la couleur est foncée.
 */
export const ENCRES_PROJET = [PALETTE.encre, PALETTE.blanc];
export function encrePour(fond) {
  if (!estHex(fond)) return COULEUR.texte.principal;
  return ENCRES_PROJET.reduce((best, c) =>
    contraste(c, fond) > contraste(best, fond) ? c : best
  );
}

/* ------------------------------------------------------------------ */
/* 2. Typographie                                                      */
/* ------------------------------------------------------------------ */

export const TYPO = {
  famille: {
    display: '"Montserrat", "Helvetica Neue", Arial, sans-serif', // titres
    lecture: '"Lato", "Helvetica Neue", Arial, sans-serif', // paragraphes
    base: '"Lato", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
  },
  taille: {
    // Liste de l'accueil : la taille s'ajuste pour que TOUS les projets
    // tiennent dans la hauteur de l'écran (voir --titre-liste dans index.css).
    geant: "clamp(2.5rem, 12vw, 14rem)", // titre de projet, nom du préchargeur
    h1: "clamp(2.5rem, 8vw, 8rem)",
    h2: "clamp(1.75rem, 3vw, 2.75rem)",
    h3: "clamp(1.25rem, 2vw, 1.6rem)",
    corps: "clamp(1rem, 1.05vw, 1.15rem)",
    petit: "0.875rem",
    etiquette: "0.75rem",
  },
  /* Jamais moins de 1.25 sur un titre animé : sous ce seuil, les jambages
     (g, p, y) sont rognés par les caches. Les titres géants à 0.85 de
     l'intro d'origine ont été remontés pour cette raison. */
  interligne: { titre: 1.28, corps: 1.6, editorial: 1.75 },
  graisse: { leger: 300, normal: 400, demi: 500, fort: 600, gras: 700 },
  espacement: { etiquette: "0.16em", titre: "-0.02em" },
};

/* ------------------------------------------------------------------ */
/* 3. Espacements et grille                                            */
/* ------------------------------------------------------------------ */

export const ESPACE = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 96,
  sectionMobile: 64,
};

export const GRILLE = {
  conteneur: "72rem",
  conteneurEtroit: "48rem",
  gouttiere: "1.5rem",
  colonnes: 12,
  seuils: { sm: 640, md: 768, lg: 1024 },
};

/* ------------------------------------------------------------------ */
/* 4. Mouvement                                                        */
/* ------------------------------------------------------------------ */

export const EASE = {
  out: "cubic-bezier(0.215, 0.61, 0.355, 1)",
  soft: "cubic-bezier(0.16, 1, 0.3, 1)", // survols, roulement des lettres
  inOut: "cubic-bezier(0.76, 0, 0.24, 1)", // carrousel, couleur de fond
  revele: "cubic-bezier(0.8, 0, 0.2, 1)", // « hop » de l'intro : entrée des lettres
  rideau: "cubic-bezier(0.9, 0, 0.1, 1)", // « hop2 » : préchargeur, sorties
};

export const DUR = {
  fast: 200,
  base: 500,
  slow: 800,
  scene: 1000,
};

/* ------------------------------------------------------------------ */
/* 5. Formes                                                           */
/* ------------------------------------------------------------------ */

export const RADIUS = { field: 4, card: 6, panel: 8, pill: 9999 };

/* ------------------------------------------------------------------ */
/* 6. Sortie en variables CSS                                          */
/* ------------------------------------------------------------------ */

const kebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** Toutes les variables CSS du thème, prêtes à poser sur :root. */
export function cssVariables() {
  const lignes = [];
  for (const [groupe, roles] of Object.entries(COULEUR)) {
    for (const [role, v] of Object.entries(roles)) {
      lignes.push(`--c-${groupe}-${kebab(role)}: ${v};`);
    }
  }
  for (const [k, v] of Object.entries(EASE)) lignes.push(`--ease-${kebab(k)}: ${v};`);
  for (const [k, v] of Object.entries(DUR)) lignes.push(`--dur-${k}: ${v}ms;`);
  for (const [k, v] of Object.entries(TYPO.famille)) lignes.push(`--f-${k}: ${v};`);
  for (const [k, v] of Object.entries(TYPO.taille)) lignes.push(`--t-${k}: ${v};`);
  // Fond et encre « vivants » : changés au survol d'un projet et sur sa page.
  lignes.push(`--fond: ${COULEUR.fond.page};`, `--encre: ${COULEUR.texte.principal};`);
  return `:root{${lignes.join("")}}`;
}

/* ------------------------------------------------------------------ */
/* 7. Compatibilité — l'objet C historique                             */
/* ------------------------------------------------------------------ */

export const C = {
  ink: COULEUR.texte.principal,
  muted: COULEUR.texte.secondaire,
  line: COULEUR.bordure.douce,
  edge: COULEUR.bordure.marquee,
  surface: COULEUR.fond.page,
  cream: COULEUR.fond.doux,
  onInk: COULEUR.texte.inverse,
  onAccent: COULEUR.texte.surAccent,
  accent: COULEUR.marque.accent,
  accentDeep: COULEUR.marque.accentProfond,
  accentSoft: COULEUR.fond.accentDoux,
  danger: COULEUR.etat.erreur,
  dangerSoft: COULEUR.etat.erreurFond,
};

export default { COULEUR, TYPO, ESPACE, GRILLE, C, alpha, EASE, DUR, RADIUS };
