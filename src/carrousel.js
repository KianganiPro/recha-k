/**
 * Logique pure du carrousel, testée à part.
 */

/** Index suivant / précédent en bouclant. */
export const boucler = (i, n) => ((i % n) + n) % n;

/** État d'une diapositive par rapport à l'index actif. */
export function etatDiapo(i, { actif, precedent, demarre }) {
  if (i === actif) return demarre ? "actif" : "initial";
  if (i === precedent) return "precedent";
  return "cache";
}

/** La diapositive i est-elle voisine de l'active (à charger en avance) ? */
export function estProche(i, actif, n) {
  return i === actif || i === boucler(actif + 1, n) || i === boucler(actif - 1, n);
}

/** Compteur « [01/07] ». */
export const compteur = (i, n) => `[${String(i + 1).padStart(2, "0")}/${String(n).padStart(2, "0")}]`;

/** Seuil de glissement tactile, en px. */
export const SEUIL_GLISSER = 40;
