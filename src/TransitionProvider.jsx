import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SORTIE, TransitionContext } from "./transition.js";
import { appliquerFond } from "./fond.js";
import { mouvementReduit } from "./intro.js";

/**
 * Fournit aller(to, { couleur }) : applique le fond de la page visée, fait
 * sortir les lettres de la page courante, puis navigue.
 */
export default function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const minuteur = useRef(0);

  const aller = useCallback(
    (to, { couleur } = {}) => {
      if (couleur !== undefined) appliquerFond(couleur);
      const root = document.documentElement;
      if (to === pathname || mouvementReduit()) {
        navigate(to);
        return;
      }
      if (root.dataset.transition === "sortie") return; // double clic
      root.dataset.transition = "sortie";
      window.clearTimeout(minuteur.current);
      minuteur.current = window.setTimeout(() => navigate(to), SORTIE.attente);
    },
    [navigate, pathname]
  );

  // Nouvelle page : on lève le drapeau AVANT le premier affichage, sinon les
  // lettres de la page qui arrive joueraient l'animation de sortie.
  useLayoutEffect(() => {
    delete document.documentElement.dataset.transition;
    window.clearTimeout(minuteur.current);
    window.scrollTo(0, 0);
  }, [pathname]);

  const valeur = useMemo(() => ({ aller }), [aller]);
  return <TransitionContext.Provider value={valeur}>{children}</TransitionContext.Provider>;
}
