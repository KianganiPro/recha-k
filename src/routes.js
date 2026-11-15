/**
 * Chemins du site — SOURCE UNIQUE, lue par App.jsx, les liens, le SEO, le
 * sitemap et les tests. Pour renommer une adresse, on ne touche qu'ici.
 * Ne pas renommer les paramètres (:categorie, :slug) : PageProjets et
 * PageProjet les lisent avec useParams().
 */
export const ROUTES = {
  accueil: "/",
  contact: "/contact",
  projets: "/projects",
  categorie: "/projects/:categorie",
  projet: "/project/:slug",
  mentions: "/mentions-legales",
};

/** Page collection filtrée sur une catégorie (dérivé de ROUTES.categorie). */
export const cheminCategorie = (slug) => ROUTES.categorie.replace(":categorie", slug);

/** Page d'un projet (dérivé de ROUTES.projet). */
export const cheminProjet = (slug) => ROUTES.projet.replace(":slug", slug);

/** Pages statiques à déclarer dans le sitemap (les projets sont ajoutés à part). */
export const PAGES_STATIQUES = [
  { path: ROUTES.accueil, priority: "1.0", changefreq: "weekly" },
  { path: ROUTES.projets, priority: "0.9", changefreq: "weekly" },
  { path: ROUTES.contact, priority: "0.6", changefreq: "yearly" },
  { path: ROUTES.mentions, priority: "0.2", changefreq: "yearly" },
];
