import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Carrousel from "./Carrousel.jsx";
import Fleche from "./Fleche.jsx";
import Lettres from "./Lettres.jsx";
import LienTransition from "./LienTransition.jsx";
import Page404 from "./Page404.jsx";
import Seo from "./Seo.jsx";
import { cheminProjet } from "./routes.js";
import { formaterDate, projetSuivant, trouverProjet } from "./projets.js";
import { seoProjet } from "./seoConfig.js";
import { DELAI_SANS_INTRO } from "./intro.js";
import { appliquerFond, transitionEnCours } from "./fond.js";

/**
 * Page d'un projet : fond à la couleur choisie dans le CMS, titre en
 * lettres, [type de mission], date, liens (masqués s'il n'y en a pas),
 * carrousel des médias, puis le projet suivant — dont la couleur s'annonce
 * au survol, comme sur l'accueil.
 */
export default function PageProjet() {
  const { slug } = useParams();
  const projet = trouverProjet(slug);
  const suivant = projet ? projetSuivant(projet.slug) : null;

  useEffect(() => {
    if (projet) appliquerFond(projet.couleur);
  }, [projet]);

  if (!projet) return <Page404 />;

  const d = DELAI_SANS_INTRO;
  const date = formaterDate(projet.date);

  return (
    <main id="contenu" tabIndex={-1} className="projet">
      <Seo {...seoProjet(projet)} />

      <header className="projet__entete">
        {projet.mission && (
          <p className="etiquette">
            <Lettres texte={`[${projet.mission}]`} par="mots" aleatoire={false} pas={0.03} delai={d} />
          </p>
        )}
        <h1 className="titre-geant">
          <Lettres texte={projet.titre} delai={d} pas={0.05} />
        </h1>

        <dl className="projet__meta apparait" style={{ "--d": `${d + 0.5}s` }}>
          {date && (
            <div>
              <dt>Date</dt>
              <dd>
                <time dateTime={projet.date}>{date}</time>
              </dd>
            </div>
          )}
          {projet.liens.length > 0 && (
            <div>
              <dt>{projet.liens.length > 1 ? "Liens" : "Lien"}</dt>
              <dd>
                <ul className="projet__liens">
                  {projet.liens.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="lien-souligne">
                        {l.libelle}
                        <Fleche sens="diagonale" />
                        <span className="sr-only"> (nouvel onglet)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>

        {projet.description && (
          <p className="projet__description apparait" style={{ "--d": `${d + 0.6}s` }}>
            {projet.description}
          </p>
        )}
      </header>

      <div className="apparait" style={{ "--d": `${d + 0.4}s` }}>
        <Carrousel key={projet.slug} medias={projet.medias} titre={projet.titre} />
      </div>

      {suivant && (
        <nav className="suivant" aria-label="Projet suivant">
          <LienTransition
            to={cheminProjet(suivant.slug)}
            couleur={suivant.couleur}
            className="suivant__lien ligne"
            onMouseEnter={() => appliquerFond(suivant.couleur)}
            onMouseLeave={() => !transitionEnCours() && appliquerFond(projet.couleur)}
            onFocus={() => appliquerFond(suivant.couleur)}
            onBlur={() => !transitionEnCours() && appliquerFond(projet.couleur)}
          >
            <span className="etiquette">Projet suivant</span>
            <span className="ligne__nom">
              <Lettres texte={suivant.titre} entree={false} />
            </span>
            <span className="suivant__type">
              {suivant.mission && <span>[{suivant.mission}]</span>}
              <Fleche />
            </span>
          </LienTransition>
        </nav>
      )}
    </main>
  );
}
