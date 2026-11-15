/**
 * Flèche en SVG : les sous-ensembles latin de Montserrat et Lato ne
 * contiennent pas ← → ↗, le navigateur irait les chercher dans une autre
 * police. Hérite de la couleur et de la taille du texte (1em).
 */
const ANGLES = { droite: 0, bas: 90, gauche: 180, haut: 270, diagonale: -45 };

export default function Fleche({ sens = "droite", className = "" }) {
  return (
    <svg
      className={`fleche ${className}`}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `rotate(${ANGLES[sens] ?? 0}deg)` }}
    >
      <path d="M3 12h17M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" />
    </svg>
  );
}
