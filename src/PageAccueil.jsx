import { useEffect, useState } from "react";
import HeroAccueil from "./HeroAccueil.jsx";
import Seo from "./Seo.jsx";
import { SITE } from "./config/site.js";
import { SEO } from "./seoConfig.js";
import { INTRO, premierAffichageAccueil, marquerAccueilAffiche } from "./intro.js";
import { useIntro } from "./transition.js";
import { appliquerFond } from "./fond.js";

/** Ancien hero (liste) en stock : ListeProjets.jsx / LigneProjet.jsx. */
export default function PageAccueil() {
  const { avecIntro } = useIntro();
  const [entree] = useState(() => avecIntro && premierAffichageAccueil());

  useEffect(() => {
    appliquerFond(null);
    marquerAccueilAffiche();
  }, []);

  return (
    <main id="contenu" tabIndex={-1} className="accueil">
      <Seo {...SEO.accueil} />
      <h1 className="sr-only">
        {SITE.name} — {SITE.metier}
      </h1>
      <HeroAccueil entree={entree} delai={INTRO.delai + INTRO.hero.debut} />
    </main>
  );
}