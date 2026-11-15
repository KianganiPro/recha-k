import Lettres from "./Lettres.jsx";
import LienTransition from "./LienTransition.jsx";
import { cheminProjet } from "./routes.js";
import { imagesDe, numero } from "./projets.js";
import { urlImage } from "./media.js";
import { appliquerFond } from "./fond.js";
import { LISTE } from "./intro.js";

/**
 * Une ligne de la liste d'accueil : [01] Nom du projet [Type de mission],
 * plus deux vignettes qui s'ouvrent à droite au survol (écrans larges).
 *
 * Survol / focus : toute la page prend la couleur du projet (appliquerFond),
 * les lettres roulent (text-shadow + translate, index.css .ligne).
 */
export default function LigneProjet({ projet, index, delai, entree = true }) {
  const vignettes = imagesDe(projet, 2);
  const activer = () => appliquerFond(projet.couleur);

  return (
    <li>
      <LienTransition
        to={cheminProjet(projet.slug)}
        couleur={projet.couleur}
        className="ligne"
        onMouseEnter={activer}
        onFocus={activer}
        data-couleur={projet.couleur ?? ""}
      >
        <span className="ligne__n" aria-hidden="true">
          <Lettres texte={numero(index)} par="mots" delai={delai} lireTexte={false} entree={entree} />
        </span>
        <span className="ligne__nom">
          <Lettres texte={projet.titre} delai={delai} pas={LISTE.decalageLettre} entree={entree} />
        </span>
        {projet.mission && (
          <span className="ligne__type">
            <span className="sr-only">, </span>
            <Lettres texte={`[${projet.mission}]`} par="mots" aleatoire={false} pas={0.02} delai={delai + 0.1} entree={entree} />
          </span>
        )}
        {vignettes.length > 0 && (
          <span className="ligne__vignettes" aria-hidden="true">
            {vignettes.map((img, i) => (
              <span key={i} className="vignette" style={{ "--i": i }}>
                <img src={urlImage(img.src, 320)} alt="" loading="eager" fetchPriority="low" decoding="async" />
              </span>
            ))}
          </span>
        )}
      </LienTransition>
    </li>
  );
}
