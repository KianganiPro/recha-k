import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { MemoryRouter } from "react-router-dom";
import { test, verifier, egal, lancer, monter } from "./outils.jsx";
import { normaliserProjets, normaliserCategories, normaliserAccueil } from "../src/content/normaliser.js";
import { schemaTypes, SINGLETONS } from "../studio/schemas/index.js";
import { ENCRES_PROJET } from "../src/theme.js";
import { ENCRES_PROJET as ENCRES_STUDIO, meilleurContraste } from "../studio/contraste.js";
import schemaProjet from "../studio/schemas/projet.js";
import App from "../src/App.jsx";
import { ROUTES, PAGES_STATIQUES } from "../src/routes.js";
import { PROJETS } from "../src/projets.js";
import { marquerIntroPassee } from "../src/intro.js";
import { SITE } from "../src/config/site.js";

marquerIntroPassee();

test("le schéma du Studio pose les questions du brief, dans l'ordre", () => {
  egal(
    schemaProjet.fields.map((f) => f.name),
    ["couleur", "titre", "slug","couverture", "date", "mission", "categories", "liens", "medias", "description"]
  );
  egal(schemaProjet.fields.find((f) => f.name === "couleur").type, "color");
  const medias = schemaProjet.fields.find((f) => f.name === "medias");
  egal(medias.of.map((t) => t.type), ["image", "object"], "images et vidéos");
});

test("chaque champ du Studio a un intitulé en français et une aide", () => {
  const sansAide = schemaProjet.fields.filter((f) => !f.title || (!f.description && f.name !== "slug"));
  egal(sansAide.map((f) => f.name), []);
});

test("le Studio et le site utilisent les mêmes encres pour juger du contraste", () => {
  egal(ENCRES_STUDIO.map((c) => c.toUpperCase()), ENCRES_PROJET.map((c) => c.toUpperCase()));
  verifier(meilleurContraste("#1F3A68") > 10 && meilleurContraste("#6B7F3A") < 4.5);
});

test("la requête GROQ récupère tous les champs que le site affiche", () => {
  const script = readFileSync("scripts/fetch-content.mjs", "utf8");
  for (const champ of ['"slug": slug.current', "titre", '"couleur": couleur.hex', "date", "mission", "description", "liens[]", "fichier.asset->url", "metadata.lqip", "alt", "categories[]->", '_type == "categorie"', 'order(ordre asc', '_id == "accueil"', '"video": video.asset->url', "bandeau"]) {
    verifier(script.includes(champ), `champ absent de la requête : ${champ}`);
  }
  verifier(script.includes("perspective=published"), "brouillons exclus");
});

test("normaliser : couleur invalide ignorée, projets sans slug écartés, doublons retirés", () => {
  const p = normaliserProjets([
    { slug: "a", titre: "A", couleur: "rouge", date: "2024-01-01", medias: [] },
    { slug: "", titre: "Sans slug" },
    { slug: "a", titre: "Doublon" },
    { slug: "b", titre: "B", couleur: "#ABCDEF", date: "2025-06-01" },
  ]);
  egal(p.map((x) => x.slug), ["b", "a"], "triés du plus récent au plus ancien");
  egal(p[1].couleur, null);
  egal(p[0].couleur, "#ABCDEF");
});

test("normaliser : liens non http écartés, libellé déduit du domaine, alt par défaut", () => {
  const [p] = normaliserProjets([
    {
      slug: "c",
      titre: "Café",
      liens: [{ url: "javascript:alert(1)" }, { url: "https://www.behance.net/x" }, { libelle: "Site", url: "https://exemple.fr" }],
      medias: [{ type: "image", src: "https://cdn.sanity.io/images/a/b/c.jpg" }, { type: "image" }, { type: "video", src: "/v.mp4", alt: "Clip" }],
    },
  ]);
  egal(p.liens, [
    { libelle: "behance.net", url: "https://www.behance.net/x" },
    { libelle: "Site", url: "https://exemple.fr" },
  ]);
  egal(p.medias.length, 2, "média sans source écarté");
  egal(p.medias[0].alt, "Café — visuel 1");
  egal(p.medias[1], { type: "video", src: "/v.mp4", alt: "Clip", poster: null });
});

test("chaque route déclarée affiche une page (pas de page vide)", async () => {
  const chemins = [ROUTES.accueil, ROUTES.contact, ROUTES.mentions,ROUTES.projets, ROUTES.projet.replace(":slug", PROJETS[0].slug), "/inconnue"];
  for (const chemin of chemins) {
    const { conteneur, demonter } = await monter(
      <MemoryRouter initialEntries={[chemin]}>
        <App />
      </MemoryRouter>
    );
    verifier(conteneur.querySelector("main h1"), `pas de h1 sur ${chemin}`);
    await demonter();
  }
});

test("le sitemap généré liste les pages fixes et chaque projet ; robots.txt le déclare", () => {
  execFileSync(process.execPath, ["scripts/generate-sitemap.mjs"], { stdio: "pipe" });
  const xml = readFileSync("public/sitemap.xml", "utf8");
  for (const p of PAGES_STATIQUES) verifier(xml.includes(`${p.path}</loc>`), p.path);
  for (const p of PROJETS) verifier(xml.includes(`/projet/${p.slug}</loc>`), p.slug);
  verifier(readFileSync("public/robots.txt", "utf8").includes("Sitemap: "));
  const sec = readFileSync("public/.well-known/security.txt", "utf8");
  verifier(/Contact: mailto:/.test(sec) && /Expires: \d{4}-/.test(sec));
});

test("le script de contenu garde la démo tant que le CMS n'est pas configuré", () => {
  const avant = readFileSync("src/content/projects.json", "utf8");
  const cfg = JSON.parse(readFileSync("studio/cms.config.json", "utf8"));
  if (cfg.projectId) return; // CMS branché : rien à vérifier ici
  execFileSync(process.execPath, ["scripts/fetch-content.mjs"], { stdio: "pipe" });
  egal(readFileSync("src/content/projects.json", "utf8"), avant);
});

test("vercel.json : la CSP autorise le CDN Sanity et Web3Forms, rien d'autre en externe", () => {
  const v = JSON.parse(readFileSync("vercel.json", "utf8"));
  const csp = v.headers[0].headers.find((h) => h.key === "Content-Security-Policy").value;
  verifier(csp.includes("img-src 'self' data: https://cdn.sanity.io"));
  verifier(csp.includes("media-src 'self' https://cdn.sanity.io"));
  verifier(csp.includes("connect-src 'self' https://api.web3forms.com"));
  verifier(!/lemonsqueezy|calendly|googleapis/.test(csp), "domaines d'un autre projet");
  verifier(v.headers.some((h) => h.has?.[0]?.value?.includes("vercel")), "préversions en noindex");
});

test("mentions légales : éditeur, hébergeur, données personnelles, cookies", async () => {
  const { conteneur, demonter } = await monter(
    <MemoryRouter initialEntries={[ROUTES.mentions]}>
      <App />
    </MemoryRouter>
  );
  egal(conteneur.querySelectorAll("main h1").length, 1);
  egal(
    [...conteneur.querySelectorAll("main h2")].map((h) => h.textContent),
    ["Éditeur du site", "Hébergement", "Propriété intellectuelle", "Données personnelles", "Cookies"]
  );
  verifier(conteneur.textContent.includes("Vercel Inc.") && conteneur.textContent.includes("Covina"));
  verifier(conteneur.textContent.includes("Directeur de la publication"));
  verifier(conteneur.querySelector('a[href="https://www.cnil.fr/fr/plaintes"]'), "droit de saisir la CNIL");
  // Tant que le client n'a pas fourni ses informations, le manque se voit.
  const editeur = conteneur.querySelector("section").textContent;
  verifier(SITE.editeur.siret || !editeur.includes("SIRET"));
  verifier(SITE.editeur.tva || !editeur.includes("TVA"));
  verifier(SITE.editeur.telephone || !editeur.includes("Téléphone"));
  verifier(editeur.includes(SITE.email));
  await demonter();
});

test("l'intitulé du métier est « Directeur créatif »", () => {
  egal(SITE.metier, "Directeur créatif");
});

test("le favicon porte les lettres RK", () => {
  verifier(/>RK<\/text>/.test(readFileSync("public/favicon.svg", "utf8")));
});

test("Studio : Accueil unique, catégories", () => {
  egal(SINGLETONS, ["accueil"]);
  egal(schemaTypes.map((t) => t.name), ["accueil", "projet", "categorie"]);
  egal(schemaTypes.find((t) => t.name === "accueil").fields.map((f) => f.name), ["bandeau", "video", "poster", "alt"]);
  egal(schemaTypes.find((t) => t.name === "categorie").fields.map((f) => f.name), ["titre", "slug", "ordre"]);
});

test("normaliser : catégories et accueil", () => {
  egal(normaliserCategories([{ slug: "pub", titre: "Publicité" }, { slug: "pub", titre: "Doublon" }, { slug: "", titre: "Vide" }]), [{ slug: "pub", titre: "Publicité" }]);
  const [p] = normaliserProjets([{ slug: "a", titre: "A", categories: [{ slug: "pub" }, "pub", null, "marque"] }]);
  egal(p.categories, ["pub", "marque"]);
  egal(normaliserAccueil(null), { bandeau: "", video: null });
  egal(normaliserAccueil({ video: { src: "/v.mp4", poster: "/p.webp", alt: "Clip" } }).video, { src: "/v.mp4", poster: "/p.webp", alt: "Clip" });
});

lancer("CMS, routes et fichiers générés");
