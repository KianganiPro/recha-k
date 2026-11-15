/**
 * Récupère les projets publiés dans Sanity et les écrit dans
 * src/content/projets.json, AVANT le build : le contenu est embarqué dans le
 * site (rapide, indexable, aucun appel au CMS pendant la visite).
 *
 * Chaque publication dans le Studio déclenche un nouveau build Vercel via un
 * webhook (voir README.md, « Brancher le CMS »).
 *
 * - Projet Sanity non configuré → on garde le fichier existant (démo) et on
 *   continue : le site fonctionne sans CMS.
 * - Projet configuré mais requête en échec → on ARRÊTE le build : Vercel
 *   garde alors la version en ligne précédente, plutôt que d'en publier une
 *   avec un contenu périmé sans que personne ne le voie.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { normaliserAccueil, normaliserCategories, normaliserProjets } from "../src/content/normaliser.js";

const cfg = JSON.parse(readFileSync("studio/cms.config.json", "utf8"));
const projectId = process.env.SANITY_PROJECT_ID || cfg.projectId;
const dataset = process.env.SANITY_DATASET || cfg.dataset || "production";
const apiVersion = cfg.apiVersion || "2025-02-19";

if (!projectId) {
  console.warn("⚠  CMS non configuré (studio/cms.config.json) : contenu de démonstration conservé.");
  process.exit(0);
}

// GROQ : uniquement les documents publiés, du plus récent au plus ancien.
const REQUETE = `{
  "projets": *[_type == "projet" && defined(slug.current)] | order(date desc) {
    "slug": slug.current,
    titre,
    "couleur": couleur.hex,
    date,
    mission,
    description,
    "categories": categories[]->{ "slug": slug.current, titre },
    "couverture": couverture{ "src": asset->url, alt, "lqip": asset->metadata.lqip, hotspot },
    "liens": liens[]{ libelle, url },
    "medias": medias[]{
      _type == "image" => {
        "type": "image",
        "src": asset->url,
        alt,
        "largeur": asset->metadata.dimensions.width,
        "hauteur": asset->metadata.dimensions.height,
        "lqip": asset->metadata.lqip
      },
      _type == "video" => {
        "type": "video",
        "src": fichier.asset->url,
        alt,
        "poster": poster.asset->url
      }
    }
  },
  "categories": *[_type == "categorie" && defined(slug.current)] | order(ordre asc, titre asc) {
    "slug": slug.current,
    titre
  },
  "accueil": *[_id == "accueil"][0] {
    bandeau,
    "video": video.asset->url,
    "poster": poster.asset->url,
    alt
  }
}`;

const url =
  `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}` +
  `?query=${encodeURIComponent(REQUETE)}&perspective=published`;

const ecrire = (fichier, donnees) =>
  writeFileSync(fichier, `${JSON.stringify({ source: "sanity", genere: new Date().toISOString(), ...donnees }, null, 2)}\n`);

try {
  const rep = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!rep.ok) throw new Error(`HTTP ${rep.status} — ${await rep.text()}`);
  const { result } = await rep.json();

  const categories = normaliserCategories(result.categories);
  const projets = normaliserProjets(result.projets);
  ecrire("src/content/projets.json", { categories, projets });
  ecrire("src/content/accueil.json", normaliserAccueil(result.accueil));

  console.log(`Sanity (${projectId}/${dataset}) : ${projets.length} projet(s), ${categories.length} catégorie(s), accueil ${result.accueil ? "OK" : "absent"}`);
} catch (e) {
  console.error(`✖  Lecture du CMS impossible : ${e.message}`);
  process.exit(1);
}
