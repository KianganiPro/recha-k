import { readFileSync } from "node:fs";
import { MemoryRouter } from "react-router-dom";
import { test, verifier, egal, lancer, monter } from "./outils.jsx";
import App from "../src/App.jsx";
import Seo from "../src/Seo.jsx";
import { SEO, LIMITES, seoProjet, tronquer, jsonLd } from "../src/seoConfig.js";
import { PROJETS } from "../src/projets.js";
import { normaliserProjets } from "../src/content/normaliser.js";
import { SITE } from "../src/config/site.js";
import { marquerIntroPassee } from "../src/intro.js";

marquerIntroPassee();
const head = (sel, attr = "content") => document.head.querySelector(sel)?.getAttribute(attr);

test("pages fixes : title ≤ 60 caractères, description ≤ 160", () => {
  for (const [nom, s] of Object.entries(SEO)) {
    verifier(s.title.length <= LIMITES.title, `${nom} title ${s.title.length}`);
    verifier(s.description.length <= LIMITES.description, `${nom} description ${s.description.length}`);
  }
});

test("pages projet : limites tenues, même avec un titre et une description très longs", () => {
  const long = normaliserProjets([
    {
      slug: "x",
      titre: "Un nom de projet vraiment très long pour une marque imaginaire",
      mission: "Campagne 360°",
      date: "2025-01-01",
      description: "Lorem ipsum ".repeat(40),
      medias: [],
    },
  ]);
  for (const p of [...PROJETS, ...long]) {
    const s = seoProjet(p);
    verifier(s.title.length <= LIMITES.title, `${p.slug} title ${s.title.length}`);
    verifier(s.description.length <= LIMITES.description, `${p.slug} description ${s.description.length}`);
  }
});

test("sans description dans le CMS, la description reprend titre, mission et date", () => {
  const p = PROJETS.find((x) => !x.description);
  const s = seoProjet(p);
  verifier(s.description.includes(p.titre) && s.description.includes(p.mission));
});

test("tronquer coupe au mot entier avec des points de suspension", () => {
  egal(tronquer("court", 60), "court");
  const t = tronquer("un deux trois quatre cinq six sept huit", 20);
  verifier(t.length <= 20 && t.endsWith("…") && !t.includes("  "), t);
});

test("Seo écrit title, description, canonical et Open Graph de la page", async () => {
  const { demonter } = await monter(<Seo {...SEO.contact} />);
  egal(document.title, SEO.contact.title);
  egal(head('meta[name="description"]'), SEO.contact.description);
  egal(head('link[rel="canonical"]', "href"), `${SITE.url}/contact`);
  egal(head('meta[property="og:url"]'), `${SITE.url}/contact`);
  egal(head('meta[property="og:image"]'), `${SITE.url}/og-image.jpg`);
  egal(head('meta[name="robots"]'), "index, follow");
  await demonter();
});

test("la 404 est en noindex et sans canonical", async () => {
  const { demonter } = await monter(
    <MemoryRouter initialEntries={["/rien-ici"]}>
      <App />
    </MemoryRouter>
  );
  egal(head('meta[name="robots"]'), "noindex, follow");
  egal(document.head.querySelector('link[rel="canonical"]'), null);
  await demonter();
});

test("une page projet partage son premier visuel en Open Graph", async () => {
  const p = PROJETS[0];
  const { demonter } = await monter(
    <MemoryRouter initialEntries={[`/projet/${p.slug}`]}>
      <App />
    </MemoryRouter>
  );
  egal(document.title, seoProjet(p).title);
  verifier(head('meta[property="og:image"]').endsWith(p.medias.find((m) => m.type === "image").src));
  egal(head('meta[property="og:type"]'), "article");
  await demonter();
});

test("JSON-LD : un site et une personne, reliés", () => {
  const j = jsonLd("https://exemple.fr");
  const [site, personne] = j["@graph"];
  egal([site["@type"], personne["@type"]], ["WebSite", "Person"]);
  egal(site.publisher["@id"], personne["@id"]);
  egal(personne.name, SITE.name);
  egal(personne.email, `mailto:${SITE.email}`);
});

test("index.html : lang fr, une seule police préchargée, valeurs injectées et non recopiées", () => {
  const html = readFileSync("index.html", "utf8");
  verifier(html.includes('<html lang="fr">'));
  egal((html.match(/rel="preload"/g) || []).length, 1);
  verifier(!html.includes(SITE.email) && !html.includes(SITE.url), "aucune valeur du client en dur");
  for (const cle of ["TITLE", "DESCRIPTION", "URL", "THEME_CSS", "JSON_LD"]) verifier(html.includes(`{{${cle}}}`), cle);
  verifier(!html.includes("fonts.googleapis"), "pas de Google Fonts");
});

lancer("Référencement");
