/**
 * Génère au build les fichiers lus par les robots :
 *   public/sitemap.xml, public/robots.txt, public/.well-known/security.txt
 *
 * Jamais écrits à la main : l'URL du site et l'e-mail viennent de
 * config/site.js, les projets de content/projets.json (lu avec readFileSync —
 * on n'importe rien qui remonte jusqu'aux images, Node ne sait pas les charger).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { SITE } from "../src/config/site.js";
import { PAGES_STATIQUES, cheminCategorie, cheminProjet } from "../src/routes.js";

const BASE = (process.env.VITE_SITE_URL || SITE.url).replace(/\/$/, "");
const aujourdhui = new Date().toISOString().slice(0, 10);

const { projets = [], categories = [] } = JSON.parse(readFileSync("src/content/projets.json", "utf8"));

const PAGES = [
  ...PAGES_STATIQUES,
  ...categories.map((c) => ({ path: cheminCategorie(c.slug), priority: "0.7", changefreq: "weekly" })),
  ...projets.map((p) => ({ path: cheminProjet(p.slug), priority: "0.8", changefreq: "monthly" })),
];

const echapper = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const urls = PAGES.map(
  ({ path, priority, changefreq }) => `  <url>
    <loc>${echapper(BASE + path)}</loc>
    <lastmod>${aujourdhui}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
).join("\n");

mkdirSync("public/.well-known", { recursive: true });

writeFileSync(
  "public/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
);

writeFileSync(
  "public/robots.txt",
  `User-agent: *
Allow: /

Sitemap: ${BASE}/sitemap.xml
`
);

// Expiration à un an : renouvelée à chaque build, elle ne périme jamais tant que le site vit.
const expire = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();
writeFileSync(
  "public/.well-known/security.txt",
  `Contact: mailto:${SITE.email}
Expires: ${expire}
Preferred-Languages: fr, en
Canonical: ${BASE}/.well-known/security.txt
`
);

console.log(`sitemap.xml : ${PAGES.length} pages — robots.txt et security.txt à jour`);
