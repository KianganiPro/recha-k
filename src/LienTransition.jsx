import { Link } from "react-router-dom";
import { clicOrdinaire, useTransitionPage } from "./transition.js";

/**
 * Lien interne qui joue la transition de page avant de naviguer.
 * `couleur` : fond à appliquer pendant la sortie (celui de la page visée).
 * Le onClick du parent est appelé d'abord, et n'écrase pas le nôtre.
 */
export default function LienTransition({ to, couleur, onClick, children, ...reste }) {
  const { aller } = useTransitionPage();
  return (
    <Link
      to={to}
      {...reste}
      onClick={(e) => {
        onClick?.(e);
        if (!clicOrdinaire(e)) return;
        e.preventDefault();
        aller(to, { couleur });
      }}
    >
      {children}
    </Link>
  );
}
