import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Lettres from "./Lettres.jsx";
import LienTransition from "./LienTransition.jsx";
import MenuMobile from "./MenuMobile.jsx";
import { SITE } from "./config/site.js";
import { ROUTES } from "./routes.js";
import { LIENS_NAV, ID_MENU_MOBILE } from "./navigation.js";
import { INTRO } from "./intro.js";

/**
 * Barre de navigation : le nom à gauche (retour à l'accueil).
 * - Ordinateur (≥ 768 px) : Projets et Contact à droite.
 * - Mobile : bouton hamburger qui ouvre le menu plein écran (MenuMobile).
 * Les mots montent sous leur cache, comme dans l'intro d'origine.
 * `delai` : moment d'entrée en secondes.
 */
export default function Nav({ delai = 0 }) {
  const pas = INTRO.nav.decalage;
  const [ouvert, setOuvert] = useState(false);
  const boutonRef = useRef(null);
  const { pathname } = useLocation();
  const fermer = useCallback(() => setOuvert(false), []);

  // Changement de page = menu refermé.
  useEffect(() => {
    setOuvert(false);
  }, [pathname]);

  return (
    <header className="nav" data-menu={ouvert ? "ouvert" : undefined}>
      <LienTransition to={ROUTES.accueil} className="nav__lien nav__logo" aria-label={`${SITE.name} — accueil`}>
        <Lettres texte={SITE.name} par="mots" aleatoire={false} delai={delai} pas={pas} lireTexte={false} />
      </LienTransition>

      <nav aria-label="Navigation principale" className="nav__liens">
        {LIENS_NAV.map((l, i) => (
          <LienTransition key={l.to} to={l.to} className="nav__lien">
            <Lettres texte={l.label} par="mots" aleatoire={false} delai={delai + (i + 1) * pas} pas={pas} />
          </LienTransition>
        ))}
      </nav>

      <button
        ref={boutonRef}
        type="button"
        className="nav__burger apparait"
        style={{ "--d": `${delai + pas}s` }}
        aria-expanded={ouvert}
        aria-controls={ID_MENU_MOBILE}
        onClick={() => setOuvert((o) => !o)}
      >
        <span className="sr-only">{ouvert ? "Fermer le menu" : "Ouvrir le menu"}</span>
        <span className="nav__burger-trait" aria-hidden="true" />
        <span className="nav__burger-trait" aria-hidden="true" />
      </button>

      <MenuMobile ouvert={ouvert} fermer={fermer} boutonRef={boutonRef} />
    </header>
  );
}
