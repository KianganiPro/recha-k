import { readFileSync } from "node:fs";
import { MemoryRouter } from "react-router-dom";
import { test, verifier, egal, lancer, monter, agir, pause } from "./outils.jsx";
import App from "../src/App.jsx";
import Scramble from "../src/Scramble.jsx";
import { GLYPHES, SCRAMBLE, melanger } from "../src/scramble.js";
import { cssVariables } from "../src/theme.js";
import { marquerIntroPassee } from "../src/intro.js";

marquerIntroPassee();
const rendre = (chemin) =>
  monter(
    <MemoryRouter initialEntries={[chemin]}>
      <App />
    </MemoryRouter>
  );

test("melanger : caractères posés de gauche à droite, espaces fixes", () => {
  egal(melanger("404", 1), "404", "fin : texte exact");
  const debut = melanger("4 4", 0, () => 0);
  egal(debut, `${GLYPHES[0]} ${GLYPHES[0]}`, "début : tout brouillé sauf l'espace");
  egal(melanger("404", 2 / 3, () => 0).slice(0, 2), "40", "2/3 : deux caractères posés");
});

test("Scramble : se fixe sur le texte après la durée prévue", async () => {
  const { conteneur, demonter } = await monter(<Scramble texte="404" />);
  await agir(() => pause(SCRAMBLE.duree + 150));
  egal(conteneur.textContent, "404");
  await demonter();
});

test("Scramble : mouvement réduit = texte fixe d'emblée", async () => {
  globalThis.__reduit = true;
  const { conteneur, demonter } = await monter(<Scramble texte="404" />);
  globalThis.__reduit = false;
  await agir(() => pause(60));
  egal(conteneur.textContent, "404");
  await demonter();
});

test("404 : h1 lisible, chiffres animés et copies glitch masqués aux lecteurs d'écran", async () => {
  const { conteneur, demonter } = await rendre("/nulle-part");
  const h1 = conteneur.querySelectorAll("main h1");
  egal(h1.length, 1);
  egal(h1[0].querySelector(".sr-only").textContent, "Erreur 404 : Page introuvable");
  egal(h1[0].querySelector(".scramble").parentElement.getAttribute("aria-hidden"), "true");
  const fantomes = [...conteneur.querySelectorAll(".glitch__fantome")];
  egal(fantomes.length, 2);
  verifier(fantomes.every((f) => f.getAttribute("aria-hidden") === "true"));
  await demonter();
});

test("404 : titre, description et deux actions (accueil, projets)", async () => {
  const { conteneur, demonter } = await rendre("/nulle-part");
  egal(conteneur.querySelector(".introuvable__titre").textContent, "Page introuvable");
  verifier(conteneur.querySelector(".introuvable__description").textContent.length > 10);
  egal([...conteneur.querySelectorAll(".introuvable__actions a")].map((a) => a.getAttribute("href")), ["/", "/projects"]);
  await demonter();
});

test("CSS et thème : couleurs glitch en jetons, multiply sur fond clair, coupé en mouvement réduit", () => {
  const vars = cssVariables();
  verifier(vars.includes("--c-effet-glitch-a:") && vars.includes("--c-effet-glitch-b:") && vars.includes("--f-mono:"));
  const css = readFileSync("src/index.css", "utf8");
  verifier(/\.glitch__fantome \{[^}]*mix-blend-mode: multiply/.test(css));
  const reduit = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
  verifier(/\.glitch__fantome \{\s*display: none;/.test(reduit));
});

lancer("Page 404");
