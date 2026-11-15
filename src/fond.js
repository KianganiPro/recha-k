import { COULEUR, encrePour, estHex } from "./theme.js";

/**
 * Change la couleur de fond « vivante » du site (--fond) et l'encre qui va
 * avec (--encre). Le body transitionne en CSS : survoler un projet colore
 * toute la page, et sa page s'ouvre déjà dans la bonne couleur.
 *
 * null / valeur invalide → fond par défaut du thème.
 */
export function appliquerFond(couleur) {
  if (typeof document === "undefined") return;
  const fond = estHex(couleur) ? couleur.trim() : COULEUR.fond.page;
  const root = document.documentElement;
  root.style.setProperty("--fond", fond);
  root.style.setProperty("--encre", encrePour(fond));
  // La barre d'adresse mobile suit la couleur de la page.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", fond);
}

/** Une transition de page est-elle en cours ? (ne pas réinitialiser le fond) */
export function transitionEnCours() {
  return typeof document !== "undefined" && document.documentElement.dataset.transition === "sortie";
}
