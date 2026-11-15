import { MemoryRouter } from "react-router-dom";
import { test, verifier, egal, lancer, monter, agir } from "./outils.jsx";
import ListeProjets from "../src/ListeProjets.jsx";
import { PROJETS, CATEGORIES, projetsDeCategorie } from "../src/projets.js";
import { COULEUR, encrePour } from "../src/theme.js";

const rendre = (props = {}) =>
  monter(
    <MemoryRouter>
      <ListeProjets projets={PROJETS} {...props} />
    </MemoryRouter>
  );
const fond = () => document.documentElement.style.getPropertyValue("--fond");

test("la liste affiche tous les projets, numérotés, avec leur type de mission", async () => {
  const { conteneur, demonter } = await rendre();
  const lignes = [...conteneur.querySelectorAll(".ligne")];
  egal(lignes.length, PROJETS.length);
  egal(lignes.map((a) => a.getAttribute("href")), PROJETS.map((p) => `/projet/${p.slug}`));
  verifier(lignes[0].querySelector(".ligne__n").textContent.includes("[01]"));
  verifier(lignes[0].textContent.includes(`[${PROJETS[0].mission}]`));
  egal(conteneur.querySelector(".liste__indice").style.getPropertyValue("--n"), String(PROJETS.length));
  await demonter();
});

test("survoler un projet colore la page, quitter la liste rend le fond par défaut", async () => {
  const { conteneur, demonter } = await rendre();
  const p = PROJETS.find((x) => x.couleur);
  const ligne = conteneur.querySelector(`a[href="/projet/${p.slug}"]`);
  await agir(() => ligne.dispatchEvent(new window.MouseEvent("mouseover", { bubbles: true, relatedTarget: document.body })));
  egal(fond(), p.couleur);
  egal(document.documentElement.style.getPropertyValue("--encre"), encrePour(p.couleur));
  egal(document.querySelector('meta[name="theme-color"]').getAttribute("content"), p.couleur);
  const ol = conteneur.querySelector(".liste__indice");
  await agir(() => ol.dispatchEvent(new window.MouseEvent("mouseout", { bubbles: true, relatedTarget: document.body })));
  egal(fond(), COULEUR.fond.page);
  await demonter();
});

test("le focus clavier sur un projet colore aussi la page", async () => {
  const { conteneur, demonter } = await rendre();
  const p = PROJETS[1];
  await agir(() => conteneur.querySelector(`a[href="/projet/${p.slug}"]`).focus());
  egal(fond(), p.couleur ?? COULEUR.fond.page);
  await demonter();
});

test("les vignettes de survol sont décoratives", async () => {
  const { conteneur, demonter } = await rendre();
  const v = conteneur.querySelector(".ligne__vignettes");
  egal(v.getAttribute("aria-hidden"), "true");
  verifier([...v.querySelectorAll("img")].every((i) => i.getAttribute("alt") === ""));
  await demonter();
});

test("entree={false} : lettres affichées sans animation d'entrée", async () => {
  const { conteneur, demonter } = await rendre({ entree: false });
  egal(conteneur.querySelectorAll(".anime-lettre, .anime-mot").length, 0);
  verifier(conteneur.querySelectorAll(".lettre").length > 0);
  await demonter();
});

test("catégories : ALL = tous les projets, sinon ceux de la catégorie", () => {
  egal(projetsDeCategorie(null).length, PROJETS.length);
  for (const c of CATEGORIES) {
    verifier(projetsDeCategorie(c.slug).every((p) => p.categories.includes(c.slug)), c.slug);
  }
});

lancer("Liste des projets (en stock) et catégories");