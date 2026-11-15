import { readFileSync, readdirSync } from "node:fs";
import { test, verifier, egal, lancer } from "./outils.jsx";
import { COULEUR, contraste, encrePour, cssVariables, alpha, ENCRES_PROJET, TYPO } from "../src/theme.js";

const page = COULEUR.fond.page;

test("le texte principal contraste à 7:1 au moins sur le fond des pages", () => {
  const c = contraste(COULEUR.texte.principal, page);
  verifier(c >= 7, `contraste ${c.toFixed(2)}`);
});

test("le texte secondaire (#606060 du brief) contraste à 4,5:1 au moins", () => {
  const c = contraste(COULEUR.texte.secondaire, page);
  verifier(c >= 4.5, `contraste ${c.toFixed(2)}`);
});

test("les couleurs d'état contrastent à 4,5:1 sur le fond des pages et sur leur fond propre", () => {
  for (const [role, fond] of [
    ["erreur", "erreurFond"],
    ["succes", "succesFond"],
    ["attention", "attentionFond"],
  ]) {
    const c1 = contraste(COULEUR.etat[role], page);
    const c2 = contraste(COULEUR.etat[role], COULEUR.etat[fond]);
    verifier(c1 >= 4.5 && c2 >= 4.5, `${role} : ${c1.toFixed(2)} / ${c2.toFixed(2)}`);
  }
});

test("le texte inverse du préchargeur contraste à 7:1 sur l'encre", () => {
  verifier(contraste(COULEUR.texte.inverse, COULEUR.fond.encre) >= 7);
});

test("encrePour choisit l'encre la plus lisible sur un fond de projet", () => {
  egal(encrePour("#1F3A68"), "#FFFFFF", "bleu nuit → blanc");
  egal(encrePour("#F2EDE4"), "#141414", "crème → encre");
  egal(encrePour(page), COULEUR.texte.principal, "fond par défaut → encre du thème");
  egal(encrePour("pas une couleur"), COULEUR.texte.principal, "valeur invalide → encre du thème");
  verifier(ENCRES_PROJET.length === 2);
});

test("alpha() décline une couleur du thème en rgba", () => {
  egal(alpha("#141414", 0.12), "rgba(20, 20, 20, 0.12)");
});

test("cssVariables() expose couleurs, courbes, durées et polices", () => {
  const css = cssVariables();
  for (const v of ["--c-texte-principal:", "--c-fond-page:", "--ease-revele:", "--ease-rideau:", "--ease-in-out:", "--dur-scene: 1000ms", "--f-display:", "--fond:", "--encre:"]) {
    verifier(css.includes(v), `variable absente : ${v}`);
  }
});

test("l'interligne des titres ne descend pas sous 1.25", () => {
  verifier(TYPO.interligne.titre >= 1.25);
  const css = readFileSync("src/index.css", "utf8");
  const trop = [...css.matchAll(/line-height:\s*(0?\.\d+|1(\.[01]\d*)?)\s*;/g)].map((m) => m[1]);
  egal(trop, [], "line-height < 1.25 trouvé dans index.css");
});

test("aucune couleur ni courbe en dur dans les composants (.jsx) ni dans index.css", () => {
  const motif = /#[0-9a-fA-F]{6}|rgba\(|cubic-bezier/;
  const fautifs = readdirSync("src")
    .filter((f) => f.endsWith(".jsx"))
    .filter((f) => motif.test(readFileSync(`src/${f}`, "utf8")));
  if (motif.test(readFileSync("src/index.css", "utf8"))) fautifs.push("index.css");
  egal(fautifs, []);
});

test("aucun composant n'exporte autre chose qu'un composant (rafraîchissement à chaud)", () => {
  const fautifs = readdirSync("src")
    .filter((f) => f.endsWith(".jsx") && f !== "main.jsx")
    .filter((f) => /export\s+(const|let|function\s+[a-z])/.test(readFileSync(`src/${f}`, "utf8")));
  egal(fautifs, []);
});

test("aucune bibliothèque interdite dans package.json", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
  const interdites = ["framer-motion", "gsap", "@radix-ui", "lucide-react", "styled-components", "react-helmet", "shadcn"];
  egal(deps.filter((d) => interdites.some((i) => d.includes(i))), []);
});

lancer("Thème et conventions");
