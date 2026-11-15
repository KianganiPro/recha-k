import { readFileSync } from "node:fs";
import { MemoryRouter } from "react-router-dom";
import { test, verifier, egal, lancer, monter, agir, pause } from "./outils.jsx";
import App from "../src/App.jsx";
import HeroAccueil from "../src/HeroAccueil.jsx";
import GooeyMarquee from "../src/GooeyMarquee.jsx";
import { ACCUEIL } from "../src/accueil.js";
import { PROJETS } from "../src/projets.js";
import { reinitialiserIntro } from "../src/intro.js";

const rendre = (chemin = "/") =>
  monter(
    <MemoryRouter initialEntries={[chemin]}>
      <App />
    </MemoryRouter>
  );
const clic = (el, extra = {}) =>
  agir(() => el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...extra })));
const finirPrechargeur = (conteneur) =>
  agir(() => {
    const pre = conteneur.querySelector('[data-testid="prechargeur"]');
    pre?.dispatchEvent(new window.Event("animationend", { bubbles: true }));
    pre?.dispatchEvent(new window.Event("webkitAnimationEnd", { bubbles: true }));
  });

test("bandeau : texte lu une fois, couches animées aria-hidden", async () => {
  const { conteneur, demonter } = await monter(<GooeyMarquee texte="Directeur créatif •" />);
  egal(conteneur.querySelector(".sr-only").textContent, "Directeur créatif •");
  const couches = [...conteneur.querySelectorAll(".gooey__couche")];
  egal(couches.length, 2);
  verifier(couches.every((c) => c.getAttribute("aria-hidden") === "true"));
  await demonter();
});

test("bandeau : deux copies identiques par piste", async () => {
  const { conteneur, demonter } = await monter(<GooeyMarquee texte="Studio •" repetitions={3} />);
  for (const piste of conteneur.querySelectorAll(".gooey__piste")) {
    const copies = [...piste.querySelectorAll(".gooey__copie")].map((c) => c.textContent);
    egal(copies.length, 2);
    egal(copies[0], copies[1]);
    egal(copies[0].trim(), "Studio • Studio • Studio •");
  }
  await demonter();
});

test("bandeau : chaque couche floue pointe vers son propre filtre", async () => {
  const { conteneur, demonter } = await monter(
    <>
      <GooeyMarquee texte="A •" />
      <GooeyMarquee texte="B •" />
    </>
  );
  const ids = [...conteneur.querySelectorAll("filter")].map((f) => f.id);
  egal(new Set(ids).size, 2);
  for (const [i, couche] of [...conteneur.querySelectorAll(".gooey__couche--flou")].entries()) {
    verifier(couche.style.filter.includes(`#${ids[i]}`), couche.style.filter);
  }
  verifier(conteneur.querySelector("feColorMatrix").getAttribute("values").includes("15 -7"));
  await demonter();
});

test("bandeau : sens, bords, pause et durée exposés au CSS", async () => {
  const { conteneur, demonter } = await monter(<GooeyMarquee texte="X •" sens="droite" bords={false} enPause duree={12} />);
  const g = conteneur.querySelector(".gooey");
  egal(g.dataset.sens, "droite");
  verifier(g.hasAttribute("data-pause") && !g.hasAttribute("data-bords"));
  egal(g.style.getPropertyValue("--duree"), "12s");
  await demonter();
});

test("CSS : boucle 0 → -50 %, data-pause, SVG jamais en display: none", () => {
  const css = readFileSync("src/index.css", "utf8");
  verifier(/@keyframes gooey-defile[\s\S]*?translateX\(-50%\)/.test(css));
  verifier(css.includes(".gooey[data-pause] .gooey__piste"));
  verifier(!/\.gooey__svg\s*\{[^}]*display:\s*none/.test(css));
});

test("l'accueil affiche le hero et plus la liste", async () => {
  reinitialiserIntro();
  const { conteneur, demonter } = await rendre();
  verifier(conteneur.querySelector("main .hero"));
  verifier(!conteneur.querySelector("main .liste"));
  verifier(conteneur.querySelector(".hero .gooey .sr-only").textContent.includes(ACCUEIL.bandeau));
  await demonter();
});

test("bandeau avant la vidéo dans le DOM, superposition ≥ 768 px", async () => {
  const { conteneur, demonter } = await monter(<HeroAccueil />);
  egal([...conteneur.querySelector(".hero").children].map((e) => e.className), ["hero__bandeau", "hero__media"]);
  const css = readFileSync("src/index.css", "utf8");
  verifier(/@media \(min-width: 768px\)\s*\{\s*\.hero\s*\{[^}]*grid-template-areas:\s*"pile"/.test(css));
  await demonter();
});

test("vidéo : muted, loop, playsInline, autoplay, aria-label, poster", async () => {
  const { conteneur, demonter } = await monter(<HeroAccueil />);
  const v = conteneur.querySelector("video");
  verifier(v.muted && v.loop && v.autoplay && v.hasAttribute("playsinline"));
  egal(v.getAttribute("src"), ACCUEIL.video.src);
  verifier(v.getAttribute("aria-label") && v.getAttribute("poster"));
  await demonter();
});

test("première arrivée par l'accueil : entrée après le rideau", async () => {
  reinitialiserIntro();
  const { conteneur, demonter } = await rendre();
  const hero = conteneur.querySelector(".hero");
  verifier(hero.hasAttribute("data-entree"));
  verifier(parseFloat(hero.style.getPropertyValue("--d")) >= 5);
  await demonter();
});

test("retour sur l'accueil : hero direct", async () => {
  reinitialiserIntro();
  const { conteneur, demonter } = await rendre();
  await finirPrechargeur(conteneur);
  await clic(conteneur.querySelector('.nav a[href="/contact"]'));
  await agir(() => pause(760));
  await clic(conteneur.querySelector(".nav__logo"));
  await agir(() => pause(760));
  const hero = conteneur.querySelector(".hero");
  verifier(hero && !hero.hasAttribute("data-entree"));
  verifier(!conteneur.querySelector('[data-testid="prechargeur"]'));
  await demonter();
});

test("arrivée par une autre page puis accueil : pas d'intro", async () => {
  reinitialiserIntro();
  const { conteneur, demonter } = await rendre("/contact");
  verifier(!conteneur.querySelector('[data-testid="prechargeur"]'));
  await clic(conteneur.querySelector(".nav__logo"));
  await agir(() => pause(760));
  verifier(!conteneur.querySelector(".hero").hasAttribute("data-entree"));
  await demonter();
});

test("projet suivant : sortie puis page dans sa couleur", async () => {
  reinitialiserIntro();
  const [p, suivant] = PROJETS;
  const { conteneur, demonter } = await rendre(`/projet/${p.slug}`);
  await clic(conteneur.querySelector(".suivant a"));
  egal(document.documentElement.dataset.transition, "sortie");
  egal(document.documentElement.style.getPropertyValue("--fond"), suivant.couleur);
  await agir(() => pause(760));
  verifier(conteneur.querySelector("h1").textContent.includes(suivant.titre));
  egal(document.documentElement.dataset.transition, undefined);
  await demonter();
});

test("Ctrl+clic : pas de transition", async () => {
  reinitialiserIntro();
  const { conteneur, demonter } = await rendre("/contact");
  const lien = conteneur.querySelector(".nav__logo");
  lien.addEventListener("click", (e) => e.preventDefault());
  await clic(lien, { ctrlKey: true });
  egal(document.documentElement.dataset.transition, undefined);
  await demonter();
});

test("pas de bouton ; mouvement réduit : pas d'autoplay", async () => {
  globalThis.__reduit = true;
  const { conteneur, demonter } = await monter(<HeroAccueil />);
  globalThis.__reduit = false;
  verifier(!conteneur.querySelector("button"));
  verifier(!conteneur.querySelector("video").autoplay);
  await demonter();
});

test("sans vidéo : bandeau seul", async () => {
  const { conteneur, demonter } = await monter(<HeroAccueil contenu={{ bandeau: "Seul •", video: null }} />);
  verifier(!conteneur.querySelector("video") && conteneur.querySelector(".gooey"));
  await demonter();
});

lancer("Hero de l'accueil");