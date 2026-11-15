import { useEffect } from "react";
import { SITE } from "./config/site.js";
import { OG_IMAGE } from "./seoConfig.js";
import { urlImage } from "./media.js";

/** Crée ou met à jour une balise <meta> / <link> du <head>. */
function poser(selecteur, creer, attribut, valeur) {
  let el = document.head.querySelector(selecteur);
  if (!el) {
    el = creer();
    document.head.appendChild(el);
  }
  el.setAttribute(attribut, valeur);
}

const meta = (cle, nom, contenu) =>
  poser(
    `meta[${cle}="${nom}"]`,
    () => {
      const m = document.createElement("meta");
      m.setAttribute(cle, nom);
      return m;
    },
    "content",
    contenu
  );

/**
 * Métadonnées par page — sans react-helmet (sans rendu serveur, elle
 * n'apporte rien). index.html porte les valeurs de l'accueil pour les robots
 * qui n'exécutent pas le JavaScript ; ce composant les ajuste à chaque page.
 */
export default function Seo({ title, description, path, image, type = "website", robots = "index, follow" }) {
  useEffect(() => {
    const url = path ? `${SITE.url}${path === "/" ? "/" : path}` : null;
    const img = image ? urlImage(image, 1200) : `${SITE.url}${OG_IMAGE}`;
    const imgAbsolue = img.startsWith("http") ? img : `${SITE.url}${img}`;

    document.title = title;
    meta("name", "description", description);
    meta("name", "robots", robots);
    meta("property", "og:title", title);
    meta("property", "og:description", description);
    meta("property", "og:type", type);
    meta("property", "og:image", imgAbsolue);
    meta("name", "twitter:title", title);
    meta("name", "twitter:description", description);
    meta("name", "twitter:image", imgAbsolue);
    if (url) {
      meta("property", "og:url", url);
      poser(
        'link[rel="canonical"]',
        () => {
          const l = document.createElement("link");
          l.rel = "canonical";
          return l;
        },
        "href",
        url
      );
    } else {
      // Page sans adresse canonique (404) : on retire la balise héritée.
      document.head.querySelector('link[rel="canonical"]')?.remove();
    }
  }, [title, description, path, image, type, robots]);

  return null;
}
