import { readFileSync } from "node:fs";
import { execFileSync as exec } from "node:child_process";
import { MemoryRouter } from "react-router-dom";
import { test, verifier, egal, lancer, monter, agir, pause } from "./outils.jsx";
import App from "../src/App.jsx";
import { PROJETS, CATEGORIES, projetsDeCategorie } from "../src/projets.js";
import { seoCategorie, LIMITES } from "../src/seoConfig.js";
import { marquerIntroPassee } from "../src/intro.js";

marquerIntroPassee();
const rendre = (chemin) =>
  monter(
    <MemoryRouter initialEntries={[chemin]}>
      <App />
    </MemoryRouter>
  );
const clic = (el) =>
  agir(() => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true, button: 0 })));
const touche = (key, extra = {}) => agir(() => window.dispatchEvent(new window.KeyboardEvent("keydown", { key, bubbles: true, ...extra })));

/* ----------------------------- collection ----------------------------- */

test("/projects : filtre ALL puis les catégories, ALL actif, toutes les cartes", async () => {
  const { conteneur, demonter } = await rendre("/projects");
  egal(conteneur.querySelectorAll("main h1").length, 1);
  const liens = [...conteneur.querySelectorAll(".filtre__lien")];
  egal(liens.map((a) => a.firstChild.textContent), ["ALL", ...CATEGORIES.map((c) => c.titre)]);
  egal(liens.map((a) => a.getAttribute("href")), ["/projects", ...CATEGORIES.map((c) => `/projects/${c.slug}`)]);
  egal(liens[0].getAttribute("aria-current"), "page");
  egal(liens[0].querySelector(".filtre__nombre").textContent, String(PROJETS.length));
  egal(conteneur.querySelectorAll(".carte").length, PROJETS.length);
  await demonter();
});

test("/projects/:categorie : seuls les projets de la catégorie, onglet actif", async () => {
  const c = CATEGORIES[0];
  const { conteneur, demonter } = await rendre(`/projects/${c.slug}`);
  const attendus = projetsDeCategorie(c.slug);
  egal([...conteneur.querySelectorAll(".carte__lien")].map((a) => a.getAttribute("href")), attendus.map((p) => `/projet/${p.slug}`));
  egal(conteneur.querySelector('.filtre__lien[aria-current="page"]').getAttribute("href"), `/projects/${c.slug}`);
  verifier(conteneur.querySelector("main h1").textContent === c.titre);
  await demonter();
});

test("changer de filtre met la grille à jour (sans transition de page)", async () => {
  const { conteneur, demonter } = await rendre("/projects");
  const c = CATEGORIES[1];
  await clic(conteneur.querySelector(`.filtre__lien[href="/projects/${c.slug}"]`));
  egal(document.documentElement.dataset.transition, undefined);
  egal(conteneur.querySelectorAll(".carte").length, projetsDeCategorie(c.slug).length);
  await demonter();
});

test("catégorie inconnue → 404", async () => {
  const { conteneur, demonter } = await rendre("/projects/nexiste-pas");
  verifier(conteneur.querySelector("h1").textContent.includes("Page introuvable"));
  await demonter();
});

test("carte : visuel 3:4 décoratif, titre, [mission] et année ; lien vers le projet", async () => {
  const { conteneur, demonter } = await rendre("/projects");
  const p = PROJETS[0];
  const carte = conteneur.querySelector(`.carte__lien[href="/projet/${p.slug}"]`);
  const img = carte.querySelector("img");
  egal(img.getAttribute("alt"), "", "le nom est déjà dans le lien");
  egal([img.getAttribute("width"), img.getAttribute("height")], ["600", "800"]);
  egal(carte.querySelector(".carte__titre").textContent, p.titre);
  verifier(carte.querySelector(".carte__meta").textContent.includes(`[${p.mission}]`));
  verifier(carte.querySelector(".carte__meta").textContent.includes(p.date.slice(0, 4)));
  egal(carte.querySelector(".carte__visuel").style.getPropertyValue(""), p.couleur);
  await demonter();
});

test("clic sur une carte : transition puis page du projet dans sa couleur", async () => {
  const p = PROJETS[0];
  const { conteneur, demonter } = await rendre("/projects");
  await clic(conteneur.querySelector(`.carte__lien[href="/projet/${p.slug}"]`));
  egal(document.documentElement.dataset.transition, "sortie");
  egal(document.documentElement.style.getPropertyValue("--fond"), p.couleur);
  await agir(() => pause(760));
  verifier(conteneur.querySelector("h1").textContent.includes(p.titre));
  await demonter();
});

test("SEO des catégories dans les limites ; sitemap avec les pages catégorie", () => {
  for (const c of CATEGORIES) {
    const s = seoCategorie(c);
    verifier(s.title.length <= LIMITES.title && s.description.length <= LIMITES.description, c.slug);
  }
  exec(process.execPath, ["scripts/generate-sitemap.mjs"], { stdio: "pipe" });
  const xml = readFileSync("public/sitemap.xml", "utf8");
  for (const c of CATEGORIES) verifier(xml.includes(`/projects/${c.slug}</loc>`), c.slug);
});

/* ---------------------------- menu mobile ----------------------------- */

test("hamburger : ouvre le menu, aria-expanded, liens Projets et Contact, page bloquée", async () => {
  const { conteneur, demonter } = await rendre("/contact");
  const bouton = conteneur.querySelector(".nav__burger");
  egal(bouton.getAttribute("aria-expanded"), "false");
  egal(bouton.getAttribute("aria-controls"), "menu-mobile");
  egal(conteneur.querySelectorAll(".menu-mobile__liens a").length, 0, "liens montés seulement à l'ouverture");
  await agir(() => bouton.click());
  egal(bouton.getAttribute("aria-expanded"), "true");
  egal([...conteneur.querySelectorAll(".menu-mobile__liens a")].map((a) => a.getAttribute("href")), ["/projects", "/contact"]);
  egal(document.documentElement.dataset.menu, "ouvert", "défilement bloqué");
  verifier(document.activeElement === conteneur.querySelector(".menu-mobile__liens a"), "focus sur le premier lien");
  await agir(() => bouton.click());
  egal(bouton.getAttribute("aria-expanded"), "false");
  egal(document.documentElement.dataset.menu, undefined);
  await demonter();
});

test("menu : Échap ferme et rend le focus au bouton ; Tab reste dans le menu", async () => {
  const { conteneur, demonter } = await rendre("/contact");
  const bouton = conteneur.querySelector(".nav__burger");
  await agir(() => bouton.click());
  const liens = [...conteneur.querySelectorAll(".menu-mobile a")];
  liens[liens.length - 1].focus();
  await touche("Tab");
  verifier(document.activeElement === bouton, "Tab sur le dernier lien → retour au bouton");
  await touche("Tab", { shiftKey: true });
  verifier(document.activeElement === liens[liens.length - 1], "Maj+Tab sur le bouton → dernier lien");
  await touche("Escape");
  egal(bouton.getAttribute("aria-expanded"), "false");
  verifier(document.activeElement === bouton);
  await demonter();
});

test("menu : se referme quand on change de page", async () => {
  const { conteneur, demonter } = await rendre("/contact");
  const bouton = conteneur.querySelector(".nav__burger");
  await agir(() => bouton.click());
  await clic(conteneur.querySelector('.menu-mobile a[href="/projects"]'));
  await agir(() => pause(760));
  egal(bouton.getAttribute("aria-expanded"), "false");
  verifier(conteneur.querySelector(".collection"), "page collection affichée");
  await demonter();
});

test("CSS : hamburger seulement sous 768 px, liens de la barre au-dessus", () => {
  const css = readFileSync("src/index.css", "utf8");
  verifier(/@media \(max-width: 767px\)\s*\{\s*\.nav__liens\s*\{\s*display:\s*none;\s*\}\s*\.nav__burger\s*\{\s*display:\s*block;/.test(css));
  verifier(/\.nav__liens\s*\{\s*display:\s*flex;\s*gap:\s*2rem;/.test(css), "espace entre Projets et Contact");
});

lancer("Collection et menu mobile");
