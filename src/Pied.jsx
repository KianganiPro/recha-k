import IconeReseau from "./IconeReseau.jsx";
import Lettres from "./Lettres.jsx";
import LienTransition from "./LienTransition.jsx";
import { SOCIAL_LINKS } from "./config/site.js";
import { ROUTES } from "./routes.js";
import { INTRO } from "./intro.js";

/**
 * Pied de page en trois emplacements, comme l'intro d'origine :
 * - gauche : icônes des réseaux renseignés (Instagram) ;
 * - centre : laissé vide à la demande du client, prêt pour plus tard ;
 * - droite : lien vers les mentions légales, puis ©année en gras moyen
 *   (l'année suit l'horloge).
 */
export default function Pied({ delai = 0, className = "", reseaux = SOCIAL_LINKS }) {
  const annee = new Date().getFullYear();
  const pas = INTRO.nav.decalage;
  return (
    <footer className={`pied ${className}`}>
      <div className="pied__emplacement pied__reseaux apparait" data-emplacement="gauche" style={{ "--d": `${delai}s` }}>
        {reseaux.map((r) => (
          <IconeReseau key={r.id} reseau={r} />
        ))}
      </div>
      <span className="pied__emplacement" data-emplacement="centre" />
      <div className="pied__emplacement pied__droite" data-emplacement="droite">
        <LienTransition to={ROUTES.mentions} className="pied__mentions">
          <Lettres texte="Legal Notice" par="mots" aleatoire={false} delai={delai + pas} pas={pas} />
        </LienTransition>
        <p className="pied__copyright">
          <Lettres texte={`©${annee}`} par="mots" delai={delai + 2 * pas} />
        </p>
      </div>
    </footer>
  );
}
