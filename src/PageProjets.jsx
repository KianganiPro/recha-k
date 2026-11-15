import { useEffect } from "react";
import { useParams } from "react-router-dom";
import CarteProjet from "./CarteProjet.jsx";
import FiltreCategories from "./FiltreCategories.jsx";
import Page404 from "./Page404.jsx";
import Seo from "./Seo.jsx";
import { SEO, seoCategorie } from "./seoConfig.js";
import { CATEGORIES, projetsDeCategorie } from "./projets.js";
import { appliquerFond } from "./fond.js";

/**
 * Page collection : filtre « ALL » + catégories, puis la grille de cartes.
 * /projects → tous les projets ; /projects/:categorie → ceux de la catégorie.
 * Catégorie inconnue → 404. La grille est remontée à chaque changement de
 * filtre (key) : l'entrée décalée des cartes rejoue.
 */
export default function PageProjets() {
  const { categorie: slug = null } = useParams();
  const categorie = slug ? CATEGORIES.find((c) => c.slug === slug) : null;

  useEffect(() => {
    appliquerFond(null);
  }, []);

  if (slug && !categorie) return <Page404 />;

  const projets = projetsDeCategorie(slug);
  const titre = categorie ? categorie.titre : "Projets";

  return (
    <main id="contenu" tabIndex={-1} className="collection">
      <Seo {...(categorie ? seoCategorie(categorie) : SEO.projets)} />
      <h1 className="sr-only">{titre}</h1>

      <FiltreCategories categories={CATEGORIES} actif={slug} compter={(s) => projetsDeCategorie(s).length} />

      {projets.length > 0 ? (
        <ul key={slug ?? "all"} className="collection__grille" aria-label={titre}>
          {projets.map((p, i) => (
            <CarteProjet key={p.slug} projet={p} index={i} />
          ))}
        </ul>
      ) : (
        <p className="collection__vide">Aucun projet dans cette catégorie pour l'instant.</p>
      )}
    </main>
  );
}
