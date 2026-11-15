import { MemoryRouter } from "react-router-dom";
import { test, verifier, egal, lancer, monter, agir, pause } from "./outils.jsx";
import App from "../src/App.jsx";
import { PROJETS } from "../src/projets.js";
import { reinitialiserIntro } from "../src/intro.js";
import { COULEUR, encrePour } from "../src/theme.js";
import { SITE, SOCIAL_LINKS } from "../src/config/site.js";
import Pied from "../src/Pied.jsx";

const rendre = (chemin = "/") =>
  monter(
    <MemoryRouter initialEntries={[chemin]}>
      <App />
    </MemoryRouter>
  );
const fond = () => document.documentElement.style.getPropertyValue("--fond");

test("la barre de navigation affiche « Recha K » et un seul lien : Contact", async () => {
  reinitialiserIntro();
  const { conteneur, demonter } = await rendre();
  const nav = conteneur.querySelector(".nav");
  verifier(nav.querySelector(".nav__logo").getAttribute("aria-label").startsWith(SITE.name), "logo nommé");
  verifier(nav.textContent.includes("Recha") && nav.textContent.includes("K"));
  const liens = [...nav.querySelectorAll("nav a")];
  egal(liens.map((a) => a.getAttribute("href")), ["/contact"]);
  egal(liens.map((a) => a.getAttribute("href")), ["/projects", "/contact"]);
  await demonter();
});

test("plus aucune trace des textes de l'intro d'origine", async () => {
  reinitialiserIntro();
  const { conteneur, demonter } = await rendre();
  for (const mot of ["Archive", "Permanence", "Craftsmanship", "Expression", "Collection", "Material"]) {
    verifier(!conteneur.textContent.includes(mot), `« ${mot} » encore présent`);
  }
  await demonter();
});

test("le pied a trois emplacements : réseaux, centre vide, mentions légales et ©année", async () => {
  reinitialiserIntro();
  const { conteneur, demonter } = await rendre();
  const places = [...conteneur.querySelectorAll(".pied__emplacement")];
  egal(places.map((p) => p.dataset.emplacement), ["gauche", "centre", "droite"]);
  egal(places[1].textContent, "", "centre laissé vide");
  verifier(places[2].querySelector('a[href="/legal-notice"]'), "lien vers les mentions légales");
  verifier(places[2].textContent.includes(`©${new Date().getFullYear()}`));
  await demonter();
});

test("Instagram s'affiche en icône à gauche du pied, dès que son URL est renseignée", async () => {
  const insta = { id: "instagram", label: "Instagram", href: "https://www.instagram.com/exemple/", icone: "/icons/instagram.svg" };
  const { conteneur, demonter } = await monter(
    <MemoryRouter>
      <Pied reseaux={[insta]} />
    </MemoryRouter>
  );
  const lien = conteneur.querySelector('[data-emplacement="gauche"] a');
  egal(lien.getAttribute("href"), insta.href);
  egal(lien.getAttribute("aria-label"), "Instagram (nouvel onglet)", "lien sans texte visible : aria-label");
  verifier(lien.target === "_blank" && lien.rel.includes("noopener"));
  verifier(lien.querySelector(".reseau__icone").style.getPropertyValue("--icone").includes("/icons/instagram.svg"));
  await demonter();
});

test("sans URL Instagram, aucun lien vide dans le pied", async () => {
  reinitialiserIntro();
  const { conteneur, demonter } = await rendre();
  egal(conteneur.querySelectorAll('[data-emplacement="gauche"] a').length, SOCIAL_LINKS.length);
  verifier(SOCIAL_LINKS.every((r) => r.href), "seuls les réseaux renseignés sont listés");
  await demonter();
});

test("le préchargeur joue au premier chargement de l'accueil, puis disparaît", async () => {
  reinitialiserIntro();
  const { conteneur, demonter } = await rendre();
  const pre = conteneur.querySelector('[data-testid="prechargeur"]');
  verifier(pre, "préchargeur présent");
  egal(pre.getAttribute("aria-hidden"), "true");
  verifier(pre.querySelectorAll(".prechargeur__img").length <= 6, "6 images au plus");
  verifier(pre.querySelectorAll(".prechargeur__img").length > 0, "images tirées des projets");
  egal(pre.querySelector(".prechargeur__compteur p").textContent, "000");
  // jsdom n'a pas AnimationEvent : React y écoute la version préfixée. Les
  // navigateurs réels émettent « animationend ». On envoie les deux.
  await agir(() => {
    pre.dispatchEvent(new window.Event("animationend", { bubbles: true }));
    pre.dispatchEvent(new window.Event("webkitAnimationEnd", { bubbles: true }));
  });
  verifier(!conteneur.querySelector('[data-testid="prechargeur"]'), "retiré à la fin du rideau");
  await demonter();
});

test("pas de préchargeur si l'utilisateur demande moins d'animations", async () => {
  reinitialiserIntro();
  globalThis.__reduit = true;
  const { conteneur, demonter } = await rendre();
  verifier(!conteneur.querySelector('[data-testid="prechargeur"]'));
  globalThis.__reduit = false;
  await demonter();
});

test("un seul h1, qui décrit l'activité", async () => {
  reinitialiserIntro();
  const { conteneur, demonter } = await rendre();
  const h1 = conteneur.querySelectorAll("h1");
  egal(h1.length, 1);
  verifier(h1[0].textContent.includes(SITE.name) && h1[0].textContent.includes(SITE.metier));
  await demonter();
});

lancer("Accueil, navigation, intro");
