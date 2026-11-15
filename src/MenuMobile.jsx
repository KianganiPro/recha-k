import { useEffect, useRef } from "react";
import IconeReseau from "./IconeReseau.jsx";
import Lettres from "./Lettres.jsx";
import LienTransition from "./LienTransition.jsx";
import { SOCIAL_LINKS } from "./config/site.js";
import { ROUTES } from "./routes.js";
import { LIENS_NAV, ID_MENU_MOBILE } from "./navigation.js";

/**
 * Panneau du menu mobile (< 768 px) : rideau plein écran qui descend.
 * - En haut : les liens en grand, qui montent lettre par lettre.
 * - En bas : Instagram à gauche, Contact à droite.
 * - Échap ferme et rend le focus au bouton ; Tab reste dans le menu.
 * - Défilement de la page bloqué (html[data-menu="ouvert"], index.css).
 * Le contenu n'est monté qu'à l'ouverture : l'animation rejoue à chaque fois.
 */
export default function MenuMobile({ ouvert, fermer, boutonRef, reseaux = SOCIAL_LINKS }) {
  const panneauRef = useRef(null);
  const annee = new Date().getFullYear();
  useEffect(() => {
    if (!ouvert) return undefined;
    const root = document.documentElement;
    root.dataset.menu = "ouvert";
    panneauRef.current?.querySelector("a")?.focus();

    const touche = (e) => {
      if (e.key === "Escape") {
        fermer();
        boutonRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const cibles = [boutonRef.current, ...(panneauRef.current?.querySelectorAll("a") ?? [])].filter(Boolean);
      const premier = cibles[0];
      const dernier = cibles[cibles.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };
    window.addEventListener("keydown", touche);
    return () => {
      delete root.dataset.menu;
      window.removeEventListener("keydown", touche);
    };
  }, [ouvert, fermer, boutonRef]);

  return (
    <div id={ID_MENU_MOBILE} ref={panneauRef} className="menu-mobile" data-ouvert={ouvert ? "" : undefined} aria-hidden={!ouvert}>
      {ouvert && (
        <>
          <ul className="menu-mobile__liens">
            {LIENS_NAV.map((l, i) => (
              <li key={l.to}>
                <LienTransition to={l.to} className="menu-mobile__lien" onClick={fermer}>
                  <Lettres texte={l.label} delai={0.25 + i * 0.1} pas={0.03} />
                </LienTransition>
              </li>
            ))}
          </ul>

          <div className="menu-mobile__pied apparait" style={{ "--d": "0.45s" }}>
            <div className="menu-mobile__reseaux">
              {reseaux.map((r) => (
                <IconeReseau key={r.id} reseau={r} />
              ))}
            </div>
            <Lettres texte={`©${annee}`} par="mots" />
          </div>
        </>
      )}
    </div>
  );
}
