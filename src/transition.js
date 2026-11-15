import { createContext, useContext } from "react";
import { DUR } from "./theme.js";

/**
 * Transition entre pages : les lettres de la page quittée remontent sous
 * leur cache (data-transition="sortie" sur <html>), puis on navigue ; la
 * nouvelle page fait entrer ses lettres. La couleur de fond, elle, a déjà
 * basculé au survol : c'est ce qui rend le passage accueil → projet continu.
 */
export const SORTIE = {
  dur: DUR.base, // durée de la remontée d'une lettre
  pas: 18, // ms entre deux lettres (ordre aléatoire)
  attente: 700, // ms avant de changer de page
};

export const TransitionContext = createContext({
  aller: () => {},
});

export const useTransitionPage = () => useContext(TransitionContext);

/** Clic « ordinaire » ? Ctrl/Cmd/Maj/clic molette ouvrent un onglet : on laisse faire. */
export function clicOrdinaire(e) {
  return !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
}

export const IntroContext = createContext({ avecIntro: false });
export const useIntro = () => useContext(IntroContext);
