import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { SITE } from "./src/config/site.js";
import { SEO, jsonLd } from "./src/seoConfig.js";
import { COULEUR, cssVariables } from "./src/theme.js";

/** Échappe une valeur pour un attribut HTML. */
const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/**
 * Remplit les {{…}} d'index.html à partir des fichiers de configuration :
 * une valeur, un endroit — le titre, l'URL ou les couleurs ne sont jamais
 * recopiés à la main dans le HTML.
 */
function injecterSite(url) {
  const valeurs = {
    TITLE: attr(SEO.accueil.title),
    DESCRIPTION: attr(SEO.accueil.description),
    URL: attr(url),
    SITE_NAME: attr(SITE.name),
    LOCALE: SITE.locale,
    EMAIL: attr(SITE.email),
    THEME_COLOR: COULEUR.fond.page,
    THEME_CSS: cssVariables(),
    // "<" échappé : une chaîne contenant "</script>" ne peut pas fermer la balise
    JSON_LD: JSON.stringify(jsonLd(url)).replace(/</g, "\\u003c"),
  };
  return {
    name: "injecter-site",
    transformIndexHtml: {
      order: "pre",
      handler: (html) =>
        html.replace(/\{\{(\w+)\}\}/g, (m, cle) => {
          if (!(cle in valeurs)) throw new Error(`index.html : valeur inconnue {{${cle}}}`);
          return valeurs[cle];
        }),
    },
  };
}

export default defineConfig(({ mode }) => {
  // VITE_SITE_URL permet à une préversion d'annoncer sa propre adresse.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const url = (env.VITE_SITE_URL || SITE.url).replace(/\/$/, "");
  return {
    plugins: [injecterSite(url), react(), tailwindcss()],
    build: { target: "es2022" },
  };
});
