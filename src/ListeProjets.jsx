import LigneProjet from "./LigneProjet.jsx";
import { LISTE } from "./intro.js";
import { appliquerFond, transitionEnCours } from "./fond.js";

/**
 * Liste des projets au centre de l'accueil — remplace le titre ARCHIVE de
 * l'intro d'origine, avec la même entrée par lettres.
 *
 * --n (nombre de projets) sert au calcul de la taille du texte : la liste
 * entière tient dans la hauteur de l'écran, quel que soit le nombre de
 * projets (voir --titre-liste dans index.css).
 */
export default function ListeProjets({ projets, delai = 0, entree = true }) {
  // Quitter la liste rend le fond par défaut… sauf si l'on vient de cliquer :
  // la page projet doit s'ouvrir dans la couleur du projet.
  const reinitialiser = () => {
    if (!transitionEnCours()) appliquerFond(null);
  };
  const quandFocusSort = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) reinitialiser();
  };

  if (projets.length === 0) {
    return <p className="liste-vide">Les projets arrivent bientôt.</p>;
  }

  return (
    <section className="liste" aria-label="Projets">
      <ol className="liste__indice" style={{ "--n": projets.length }} onMouseLeave={reinitialiser} onBlur={quandFocusSort}>
        {projets.map((p, i) => (
          <LigneProjet key={p.slug} projet={p} index={i} delai={delai + i * LISTE.decalageLigne} entree={entree} />
        ))}
      </ol>
    </section>
  );
}
