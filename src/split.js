/**
 * Découpe d'un texte pour les animations lettre par lettre ou mot par mot.
 * Remplace SplitText (plugin GSAP) : on produit la structure, le CSS anime.
 */

/**
 * "Safe Creative" → [{ lettres: [{c:"S",k:0}, …] }, { lettres: [{c:"C",k:5}, …] }]
 * k est l'index global du caractère (espaces compris, comme dans le site de
 * référence) : il sert au décalage du roulement au survol.
 */
export function decouper(texte) {
  const mots = [];
  let k = 0;
  for (const mot of String(texte ?? "").split(" ")) {
    if (mot === "") {
      k += 1;
      continue;
    }
    // Array.from découpe correctement les caractères hors BMP (émojis, etc.).
    mots.push({ mot, lettres: Array.from(mot).map((c) => ({ c, k: k++ })) });
    k += 1; // l'espace qui suit
  }
  return mots;
}

/** Petit générateur pseudo-aléatoire à graine (mulberry32). */
function generateur(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Empreinte numérique d'une chaîne, pour dériver une graine stable. */
export function empreinte(chaine) {
  let h = 2166136261;
  for (const ch of String(chaine)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Ordre d'apparition « au hasard » (stagger from: "random" de GSAP), mais
 * déterministe : la même graine donne toujours le même ordre. Le rendu est
 * donc identique d'un rendu React à l'autre, et testable.
 * Renvoie un tableau ordre[i] = rang d'apparition de l'élément i.
 */
export function ordreAleatoire(n, graine = 1) {
  const rangs = Array.from({ length: n }, (_, i) => i);
  const alea = generateur(graine);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [rangs[i], rangs[j]] = [rangs[j], rangs[i]];
  }
  return rangs;
}
