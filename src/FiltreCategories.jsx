import { Link } from "react-router-dom";
import { ROUTES, cheminCategorie } from "./routes.js";

/**
 * Filtre de la page collection : « ALL » puis chaque catégorie, dans l'ordre
 * du Studio, avec le nombre de projets. Chaque entrée a sa propre adresse
 * (/projects, /projects/publicite) : partageable et indexable.
 * `actif` : slug de la catégorie affichée (null = ALL).
 */
export default function FiltreCategories({ categories, actif, compter }) {
  const entrees = [{ slug: null, titre: "ALL", to: ROUTES.projets }, ...categories.map((c) => ({ ...c, to: cheminCategorie(c.slug) }))];

  return (
    <nav className="filtre" aria-label="Catégories de projets">
      <ul className="filtre__liste">
        {entrees.map((c) => (
          <li key={c.slug ?? "all"}>
            <Link
              to={c.to}
              className="filtre__lien"
              aria-current={c.slug === actif ? "page" : undefined}
              preventScrollReset
            >
              {c.titre}
              <sup className="filtre__nombre">{compter(c.slug)}</sup>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
