import { useEffect } from "react";
import LienTransition from "./LienTransition.jsx";
import Scramble from "./Scramble.jsx";
import Seo from "./Seo.jsx";
import { SEO } from "./seoConfig.js";
import { ROUTES } from "./routes.js";
import { appliquerFond } from "./fond.js";

/**
 * Page 404 « glitch » — port de be-ui-404-not-found (shadcn/motion/TS) en
 * React + CSS, sans dépendance :
 * - « 404 » qui se brouille puis se fixe (Scramble) ;
 * - au survol, deux copies colorées décalées de ±3 px (index.css, .glitch).
 *   Le fond du site étant clair, les copies se fondent en multiply et non en
 *   screen (prévu pour un fond sombre, invisible ici).
 * - Le h1 porte un texte lisible pour les lecteurs d'écran ; les chiffres
 *   animés sont aria-hidden (sinon le brouillage serait lu).
 */
export default function Page404({
  code = "404",
  titre = "Page introuvable",
  description = "La page que vous cherchez n'existe pas ou a été déplacée.",
}) {
  useEffect(() => {
    appliquerFond(null);
  }, []);

  return (
    <main id="contenu" tabIndex={-1} className="introuvable">
      <Seo {...SEO.introuvable} />
      <section className="introuvable__scene">
        <div className="glitch">
          <span className="glitch__fantome glitch__fantome--a" aria-hidden="true">
            <Scramble texte={code} />
          </span>
          <span className="glitch__fantome glitch__fantome--b" aria-hidden="true">
            <Scramble texte={code} />
          </span>
          <h1 className="glitch__code">
            <span className="sr-only">
              Erreur {code} : {titre}
            </span>
            <span aria-hidden="true">
              <Scramble texte={code} />
            </span>
          </h1>
        </div>

        <div className="introuvable__texte">
          <p className="introuvable__titre">{titre}</p>
          <p className="introuvable__description">{description}</p>
        </div>

        <div className="introuvable__actions">
          <LienTransition to={ROUTES.accueil} className="bouton">
            Retour à l'accueil
          </LienTransition>
          <LienTransition to={ROUTES.projets} className="bouton bouton--contour">
            Voir les projets
          </LienTransition>
        </div>
      </section>
    </main>
  );
}
