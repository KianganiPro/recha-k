/**
 * Effet « scramble » du 404 : les caractères défilent au hasard puis se
 * fixent de gauche à droite. Logique pure, testée à part.
 */
export const GLYPHES = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/\\";
export const SCRAMBLE = { duree: 700, pas: 45 }; // ms

/**
 * Texte à afficher à l'avancement `progression` (0 → 1) : les caractères
 * déjà « posés » restent, les autres sont tirés au hasard. Les espaces ne
 * bougent jamais.
 */
export function melanger(texte, progression, alea = Math.random) {
  const chars = Array.from(texte);
  const poses = Math.floor(Math.min(Math.max(progression, 0), 1) * chars.length);
  return chars
    .map((c, i) => (i < poses || c === " " ? c : GLYPHES[Math.floor(alea() * GLYPHES.length)]))
    .join("");
}
