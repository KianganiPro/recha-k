import { useEffect } from "react";
import FormulaireContact from "./FormulaireContact.jsx";
import Lettres from "./Lettres.jsx";
import Seo from "./Seo.jsx";
import { SITE, mailto } from "./config/site.js";
import { SEO } from "./seoConfig.js";
import { DELAI_SANS_INTRO } from "./intro.js";
import { appliquerFond } from "./fond.js";

export default function PageContact() {
  useEffect(() => {
    appliquerFond(null);
  }, []);

  const d = DELAI_SANS_INTRO;
  return (
    <main id="contenu" tabIndex={-1} className="contact">
      <Seo {...SEO.contact} />
      <h1 className="titre-geant">
        <Lettres texte="Contact" delai={d} pas={0.05} />
      </h1>

      <div className="contact__grille apparait" style={{ "--d": `${d + 0.45}s` }}>
        <div className="contact__intro">
          <p>A project, a campaign, a collaboration? Let's talk about it.</p>
          <a className="lien-souligne contact__email" href={mailto()}>
            {SITE.email}
          </a>
        </div>
        <FormulaireContact />
      </div>
    </main>
  );
}
