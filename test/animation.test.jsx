import { test, verifier, egal, lancer, monter } from "./outils.jsx";
import { decouper, ordreAleatoire, empreinte } from "../src/split.js";
import { INTRO, FIN_PRECHARGEUR, easeInOutQuad, introDoitJouer, marquerIntroPassee, reinitialiserIntro } from "../src/intro.js";
import Lettres from "../src/Lettres.jsx";

test("decouper : index globaux espaces compris, comme le site de référence", () => {
  const m = decouper("Safe Creative");
  egal(m.length, 2);
  egal(m[0].lettres.map((l) => l.k), [0, 1, 2, 3]);
  egal(m[1].lettres[0], { c: "C", k: 5 });
});

test("ordreAleatoire : une permutation complète, stable pour une même graine", () => {
  const a = ordreAleatoire(13, empreinte("Recha K"));
  const b = ordreAleatoire(13, empreinte("Recha K"));
  egal(a, b, "même graine, même ordre");
  egal([...a].sort((x, y) => x - y), [...Array(13).keys()], "chaque rang une fois");
  verifier(JSON.stringify(a) !== JSON.stringify([...Array(13).keys()]), "l'ordre n'est pas l'ordre naturel");
});

test("la chronologie de l'intro reprend la timeline GSAP d'origine", () => {
  egal([INTRO.delai, INTRO.lettres.debut, INTRO.sortie.debut, INTRO.imagesSortie.debut, INTRO.rideau.debut, INTRO.hero.debut, INTRO.nav.debut], [0.5, 0.35, 3.25, 3.5, 4.35, 4.65, 4.75]);
  egal(INTRO.rotations, [7.5, -2.5, -10, 12.5, -5, 5]);
  egal(FIN_PRECHARGEUR, 5.85);
});

test("le compteur suit power2.inOut : 0 → 0, milieu → 0,5, fin → 1", () => {
  egal([easeInOutQuad(0), easeInOutQuad(0.5), easeInOutQuad(1)], [0, 0.5, 1]);
  verifier(easeInOutQuad(0.25) < 0.25, "démarrage lent");
});

test("l'intro ne joue qu'une fois, seulement sur l'accueil", () => {
  reinitialiserIntro();
  verifier(introDoitJouer("/contact") === false, "pas sur une autre page");
  verifier(introDoitJouer("/") === true, "sur l'accueil au premier chargement");
  verifier(introDoitJouer("/") === true, "lecture sans effet de bord (StrictMode appelle deux fois)");
  marquerIntroPassee();
  verifier(introDoitJouer("/") === false, "pas une seconde fois");
});

test("l'intro est sautée si l'utilisateur demande de réduire les animations", () => {
  reinitialiserIntro();
  globalThis.__reduit = true;
  verifier(introDoitJouer("/") === false);
  globalThis.__reduit = false;
});

test("Lettres : texte intact pour les lecteurs d'écran, découpage masqué", async () => {
  const { conteneur, demonter } = await monter(<Lettres texte="Atelier Nord" delai={1} pas={0.1} />);
  egal(conteneur.querySelector(".sr-only").textContent, "Atelier Nord");
  const decoupe = conteneur.querySelector('[aria-hidden="true"]');
  egal(decoupe.querySelectorAll(".lettre").length, 11, "une span par lettre, sans les espaces");
  egal(decoupe.querySelectorAll(".masque").length, 2, "un cache par mot");
  const delais = [...decoupe.querySelectorAll(".lettre")].map((l) => parseFloat(l.style.getPropertyValue("--d")));
  egal(Math.min(...delais), 1, "la première lettre part au délai demandé");
  egal(Math.round(Math.max(...delais) * 10) / 10, 2, "la dernière 10 pas plus tard");
  verifier(decoupe.querySelector(".lettre").style.getPropertyValue("--k") !== "", "--k posé pour le roulement");
  await demonter();
});

test("Lettres par mots : une unité animée par mot, ordre de lecture", async () => {
  const { conteneur, demonter } = await monter(<Lettres texte="[Campagne 360°]" par="mots" aleatoire={false} pas={0.5} />);
  const mots = [...conteneur.querySelectorAll(".anime-mot")];
  egal(mots.map((m) => m.textContent), ["[Campagne", "360°]"]);
  egal(mots.map((m) => m.style.getPropertyValue("--d")), ["0.000s", "0.500s"]);
  await demonter();
});

test("Lettres sans entrée : pas de classe d'animation", async () => {
  const { conteneur, demonter } = await monter(<Lettres texte="Orée" entree={false} />);
  egal(conteneur.querySelectorAll(".anime-lettre").length, 0);
  egal(conteneur.querySelectorAll(".lettre").length, 4);
  await demonter();
});

test("index.css neutralise animations et transitions si l'on demande moins de mouvement", async () => {
  const { readFileSync } = await import("node:fs");
  const css = readFileSync("src/index.css", "utf8");
  const bloc = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  verifier(bloc.includes("animation: none !important"), "animations coupées");
  verifier(bloc.includes("transition-duration: 1ms !important"), "transitions coupées");
});

lancer("Animations et découpage");
