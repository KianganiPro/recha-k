/**
 * Met au propre les projets venus du CMS (ou du fichier de démonstration).
 * Fichier pur, sans import : il est aussi utilisé par scripts/fetch-content.mjs
 * côté Node.
 *
 * Forme de sortie d'un projet :
 * { slug, titre, couleur, date, mission, description, liens[], medias[] }
 */

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const COULEUR_PAR_DEFAUT = null; // null → le site applique le fond du thème

const texte = (v) => (typeof v === "string" ? v.trim() : "");

function lienValide(l) {
  const url = texte(l?.url);
  if (!/^https?:\/\//i.test(url)) return null;
  let libelle = texte(l?.libelle);
  if (!libelle) {
    // Sans libellé, on affiche le domaine : « behance.net » plutôt qu'une URL entière.
    try {
      libelle = new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  }
  return { libelle, url };
}

function mediaValide(m, titre, i) {
  const src = texte(m?.src);
  if (!src) return null;
  const alt = texte(m?.alt) || `${titre} — visuel ${i + 1}`;
  if (m.type === "video") {
    return { type: "video", src, alt, poster: texte(m.poster) || null };
  }
  return {
    type: "image",
    src,
    alt,
    largeur: Number(m.largeur) || null,
    hauteur: Number(m.hauteur) || null,
    lqip: texte(m.lqip) || null,
  };
}

function couvertureValide(c, titre) {
  const src = texte(c?.src);
  if (!src) return null;
  const h = c.hotspot;
  const dansCadre = (v) => typeof v === "number" && v >= 0 && v <= 1;
  return {
    src,
    alt: texte(c.alt) || titre,
    lqip: texte(c.lqip) || null,
    hotspot: h && dansCadre(h.x) && dansCadre(h.y) ? { x: h.x, y: h.y } : null,
  };
}

const slugCategorie = (c) => texte(typeof c === "string" ? c : c?.slug);

export function normaliserCategories(bruts) {
  if (!Array.isArray(bruts)) return [];
  const vus = new Set();
  return bruts
    .map((c) => ({ slug: slugCategorie(c), titre: texte(c?.titre) }))
    .filter((c) => c.slug && c.titre && !vus.has(c.slug) && vus.add(c.slug));
}

/** Accepte la réponse brute (video = URL) ou le JSON déjà normalisé (video = objet). */
export function normaliserAccueil(brut) {
  const v = brut?.video;
  const objet = v && typeof v === "object";
  const src = texte(objet ? v.src : v);
  return {
    bandeau: texte(brut?.bandeau),
    video: src
      ? { src, poster: texte(objet ? v.poster : brut?.poster) || null, alt: texte(objet ? v.alt : brut?.alt) }
      : null,
  };
}

export function normaliserProjets(bruts) {
  if (!Array.isArray(bruts)) return [];
  const vus = new Set();
  return bruts
    .map((p) => {
      const titre = texte(p?.titre);
      const slug = texte(p?.slug);
      if (!titre || !slug || vus.has(slug)) return null;
      vus.add(slug);
      const couleur = HEX.test(texte(p.couleur)) ? texte(p.couleur) : COULEUR_PAR_DEFAUT;
      return {
        slug,
        titre,
        couleur,
        date: texte(p.date) || null,
        mission: texte(p.mission),
        description: texte(p.description),
        categories: [...new Set((Array.isArray(p.categories) ? p.categories : []).map(slugCategorie).filter(Boolean))],
        couverture: couvertureValide(p.couverture, titre),
        liens: (Array.isArray(p.liens) ? p.liens : []).map(lienValide).filter(Boolean),
        medias: (Array.isArray(p.medias) ? p.medias : [])
          .map((m, i) => mediaValide(m, titre, i))
          .filter(Boolean),
      };
    })
    .filter(Boolean)
    .sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
}
