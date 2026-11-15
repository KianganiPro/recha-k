import donnees from "./content/projets.json" with { type: "json" };
import { normaliserCategories, normaliserProjets } from "./content/normaliser.js";

/**
 * Accès aux projets. Le fichier content/projets.json est réécrit à chaque
 * build par scripts/fetch-content.mjs à partir du CMS : le contenu est donc
 * embarqué dans le site (rapide, indexable, aucun appel réseau au chargement).
 */
export const PROJETS = normaliserProjets(donnees.projets);

export const CATEGORIES = normaliserCategories(donnees.categories);

export const projetsDeCategorie = (slug, liste = PROJETS) =>
  slug ? liste.filter((p) => p.categories.includes(slug)) : liste;

/** "demo" tant que le CMS n'est pas branché, "sanity" ensuite. */
export const SOURCE_CONTENU = donnees.source;

export const trouverProjet = (slug) => PROJETS.find((p) => p.slug === slug) ?? null;

/** Projet suivant dans la liste, en bouclant sur le premier. */
export function projetSuivant(slug, liste = PROJETS) {
  if (liste.length < 2) return null;
  const i = liste.findIndex((p) => p.slug === slug);
  return liste[(i + 1) % liste.length];
}

/** Les n premières images d'un projet (vignettes de survol, préchargeur). */
export const imagesDe = (projet, n = 2) =>
  (projet?.medias ?? []).filter((m) => m.type === "image").slice(0, n);

/** Numéro affiché « [01] ». */
export const numero = (i) => `[${String(i + 1).padStart(2, "0")}]`;

/** "2025-03-01" → "Mars 2025" */
export function formaterDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  const s = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Jusqu'à 6 images pour le préchargeur : la première de chaque projet. */
export function imagesPrechargeur(liste = PROJETS, n = 6) {
  const premieres = liste.map((p) => imagesDe(p, 1)[0]).filter(Boolean);
  // Moins de 6 projets illustrés : on complète avec les images suivantes.
  const reste = liste.flatMap((p) => imagesDe(p, 6).slice(1));
  return [...premieres, ...reste].slice(0, n);
}
