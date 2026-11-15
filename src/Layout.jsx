import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav.jsx";
import Pied from "./Pied.jsx";
import Prechargeur from "./Prechargeur.jsx";
import TransitionProvider from "./TransitionProvider.jsx";
import { IntroContext } from "./transition.js";
import { INTRO, DELAI_SANS_INTRO, introDoitJouer, marquerIntroPassee } from "./intro.js";
import { IMAGES_PRECHARGEUR } from "./assets/images.js";

/**
 * Cadre commun : préchargeur (premier chargement sur l'accueil), navigation,
 * page courante, pied de page. Nav et pied sont montés une fois : ils
 * n'entrent qu'une fois, la page change entre les deux.
 */
export default function Layout() {
  const { pathname } = useLocation();
  const [avecIntro] = useState(() => introDoitJouer(pathname));
  const [prechargeurVisible, setPrechargeurVisible] = useState(avecIntro);

  useEffect(() => {
    marquerIntroPassee();
  }, []);

  const delaiCadre = avecIntro ? INTRO.delai + INTRO.nav.debut : DELAI_SANS_INTRO;
  const intro = useMemo(() => ({ avecIntro }), [avecIntro]);

  return (
    <IntroContext.Provider value={intro}>
      <TransitionProvider>
        <a href="#contenu" className="lien-evitement">
          Aller au contenu
        </a>
        {prechargeurVisible && <Prechargeur images={IMAGES_PRECHARGEUR} onFin={() => setPrechargeurVisible(false)} />}
        <div className="cadre">
          <Nav delai={delaiCadre} />
          <Outlet />
          <Pied delai={delaiCadre} />
        </div>
      </TransitionProvider>
    </IntroContext.Provider>
  );
}
