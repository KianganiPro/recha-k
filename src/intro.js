/**
 * Chronologie de l'intro — reprise à l'identique de la timeline GSAP
 * d'origine (script.js du zip), en secondes. Chaque phase est jouée par une
 * animation CSS dont le délai est calculé ici.
 *
 * Temps absolu d'une phase = INTRO.delai + phase.debut
 */
export const INTRO = {
  delai: 0.5, // gsap.timeline({ delay: 0.5 })
  rotations: [7.5, -2.5, -10, 12.5, -5, 5], // inclinaison de départ des 6 images
  images: { debut: 0, dur: 1, decalage: 0.2 },
  lettres: { debut: 0.35, dur: 1, decalage: 0.125 },
  compteur: { debut: 0.35, dur: 1, compteDebut: 0.85, compteDur: 2 },
  sortie: { debut: 3.25, dur: 0.75 }, // lettres et compteur remontent
  imagesSortie: { debut: 3.5, dur: 1, decalage: 0.075 },
  rideau: { debut: 4.35, dur: 1 }, // le préchargeur se replie vers le haut
  hero: { debut: 4.65, dur: 1, decalage: 0.075 },
  nav: { debut: 4.75, dur: 1, decalage: 0.075 },
};

/** Fin totale du préchargeur, en secondes. */
export const FIN_PRECHARGEUR = INTRO.delai + INTRO.rideau.debut + INTRO.rideau.dur;

/** Délai d'entrée de la page quand l'intro ne joue pas (navigation interne). */
export const DELAI_SANS_INTRO = 0.1;

/** Décalages de la liste d'accueil : une ligne après l'autre, lettres au hasard. */
export const LISTE = { decalageLigne: 0.08, decalageLettre: 0.035 };

/** power2.inOut de GSAP, pour le compteur 000 → 100. */
export const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** L'utilisateur a-t-il demandé de réduire les animations ? */
export function mouvementReduit() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/*
 * L'intro ne joue qu'une fois par chargement de l'application, et seulement
 * si l'on arrive sur l'accueil. Revenir d'un projet vers l'accueil ne rejoue
 * pas cinq secondes de préchargeur.
 */
let introDejaPassee = false;

/* Lecture et marquage séparés : en StrictMode, React appelle deux fois
   l'initialiseur d'un useState. Marquer dans l'initialiseur ferait répondre
   « non » au second appel, et l'intro ne jouerait jamais en développement. */
export function introDoitJouer(chemin) {
  return !introDejaPassee && chemin === "/" && !mouvementReduit();
}

export function marquerIntroPassee() {
  introDejaPassee = true;
}

let accueilDejaAffiche = false;
export const premierAffichageAccueil = () => !accueilDejaAffiche;
export function marquerAccueilAffiche() {
  accueilDejaAffiche = true;
}

/** Réservé aux tests. */
export function reinitialiserIntro() {
  introDejaPassee = false;
  accueilDejaAffiche = false;
}
