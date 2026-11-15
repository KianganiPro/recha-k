import { MemoryRouter } from "react-router-dom";
import { test, verifier, egal, lancer, monter, agir } from "./outils.jsx";
import App from "../src/App.jsx";
import { PROJETS, formaterDate, projetSuivant, imagesPrechargeur } from "../src/projets.js";
import { boucler, compteur, estProche, etatDiapo } from "../src/carrousel.js";
import { urlImage, srcSetImage } from "../src/media.js";
import { marquerIntroPassee } from "../src/intro.js";

marquerIntroPassee();
const rendre = (chemin) =>
  monter(
    <MemoryRouter initialEntries={[chemin]}>
      <App />
    </MemoryRouter>
  );
const avecLiens = PROJETS.find((p) => p.liens.length > 0);
const sansLiens = PROJETS.find((p) => p.liens.length === 0);
const avecVideo = PROJETS.find((p) => p.medias.some((m) => m.type === "video"));

test("la page projet affiche titre (h1), type de mission et date", async () => {
  const p = PROJETS[0];
  const { conteneur, demonter } = await rendre(`/projet/${p.slug}`);
  const h1 = conteneur.querySelectorAll("h1");
  egal(h1.length, 1);
  verifier(h1[0].textContent.includes(p.titre));
  verifier(conteneur.textContent.includes(`[${p.mission}]`));
  egal(conteneur.querySelector("time").getAttribute("dateTime"), p.date);
  egal(conteneur.querySelector("time").textContent, formaterDate(p.date));
  await demonter();
});

test("la page s'ouvre dans la couleur du projet", async () => {
  const p = PROJETS.find((x) => x.couleur);
  const { demonter } = await rendre(`/projet/${p.slug}`);
  egal(document.documentElement.style.getPropertyValue("--fond"), p.couleur);
  await demonter();
});

test("les liens en ligne s'affichent, dans un nouvel onglet sécurisé", async () => {
  const { conteneur, demonter } = await rendre(`/projet/${avecLiens.slug}`);
  const liens = [...conteneur.querySelectorAll(".projet__liens a")];
  egal(liens.length, avecLiens.liens.length);
  verifier(liens.every((a) => a.target === "_blank" && a.rel.includes("noopener")));
  verifier(liens[0].textContent.includes("(nouvel onglet)"), "annoncé aux lecteurs d'écran");
  await demonter();
});

test("sans lien renseigné, la rubrique Liens est masquée", async () => {
  const { conteneur, demonter } = await rendre(`/projet/${sansLiens.slug}`);
  verifier(!conteneur.querySelector(".projet__liens"));
  verifier(![...conteneur.querySelectorAll("dt")].some((dt) => dt.textContent.startsWith("Lien")));
  await demonter();
});

test("carrousel : compteur, flèches, clavier, et boucle", async () => {
  const p = PROJETS[0];
  const n = p.medias.length;
  const { conteneur, demonter } = await rendre(`/projet/${p.slug}`);
  const lire = () => conteneur.querySelector(".carrousel__compteur").textContent.replace("Visuel ", "");
  egal(lire(), compteur(0, n));
  await agir(() => conteneur.querySelector('button[aria-label="Visuel suivant"]').click());
  egal(lire(), compteur(1, n));
  await agir(() => window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "ArrowLeft" })));
  egal(lire(), compteur(0, n));
  await agir(() => conteneur.querySelector('button[aria-label="Visuel précédent"]').click());
  egal(lire(), compteur(n - 1, n), "boucle vers le dernier");
  const actives = conteneur.querySelectorAll('.diapo[data-etat="actif"]');
  egal(actives.length, 1);
  egal(actives[0].getAttribute("aria-hidden"), "false");
  await demonter();
});

test("carrousel : les diapositives cachées sont retirées de l'arbre d'accessibilité", async () => {
  const { conteneur, demonter } = await rendre(`/projet/${PROJETS[0].slug}`);
  const cachees = [...conteneur.querySelectorAll(".diapo")].filter((d) => d.dataset.etat !== "initial");
  verifier(cachees.every((d) => d.getAttribute("aria-hidden") === "true"));
  await demonter();
});

test("vidéo : muette, en boucle, inline (iOS), décrite, et lue seulement à l'écran", async () => {
  const { conteneur, demonter } = await rendre(`/projet/${avecVideo.slug}`);
  const v = conteneur.querySelector("video");
  verifier(v.muted && v.loop && v.hasAttribute("playsinline"), "muted + loop + playsInline");
  verifier(v.getAttribute("aria-label"), "aria-label");
  egal(v.dataset.lecture, "0", "en pause tant qu'elle n'est pas affichée");
  const i = avecVideo.medias.findIndex((m) => m.type === "video");
  for (let k = 0; k < i; k++) await agir(() => conteneur.querySelector('button[aria-label="Visuel suivant"]').click());
  egal(v.dataset.lecture, "1", "lecture à l'affichage");
  await demonter();
});

test("projet suivant : lien vers le suivant, qui boucle sur le premier", async () => {
  const dernier = PROJETS[PROJETS.length - 1];
  const { conteneur, demonter } = await rendre(`/projet/${dernier.slug}`);
  const lien = conteneur.querySelector(".suivant a");
  egal(lien.getAttribute("href"), `/projet/${PROJETS[0].slug}`);
  egal(projetSuivant(dernier.slug).slug, PROJETS[0].slug);
  await demonter();
});

test("un slug inconnu affiche la page 404", async () => {
  const { conteneur, demonter } = await rendre("/projet/nexiste-pas");
  verifier(conteneur.querySelector("h1").textContent.includes("Page introuvable"));
  await demonter();
});

test("logique du carrousel : boucle, états, voisines préchargées", () => {
  egal([boucler(-1, 4), boucler(4, 4), boucler(2, 4)], [3, 0, 2]);
  egal(etatDiapo(0, { actif: 0, precedent: -1, demarre: false }), "initial");
  egal(etatDiapo(2, { actif: 1, precedent: 2, demarre: true }), "precedent");
  egal([0, 1, 2, 3].map((i) => estProche(i, 0, 4)), [true, true, false, true]);
  egal(compteur(0, 7), "[01/07]");
});

test("images du CDN Sanity redimensionnées, images locales intactes", () => {
  const cdn = "https://cdn.sanity.io/images/abc/production/x-100x100.jpg";
  egal(urlImage(cdn, 720), `${cdn}?w=720&q=75&fit=max&auto=format`);
  egal(urlImage("/images/demo/demo-1.webp", 720), "/images/demo/demo-1.webp");
  egal(srcSetImage("/images/demo/demo-1.webp"), undefined);
  verifier(srcSetImage(cdn).includes("1440w"));
});

test("formaterDate : « Mars 2025 », chaîne vide si absente", () => {
  egal(formaterDate("2025-03-01"), "Mars 2025");
  egal(formaterDate(null), "");
});

test("préchargeur : la première image de chaque projet, 6 au plus", () => {
  const imgs = imagesPrechargeur();
  verifier(imgs.length <= 6 && imgs.length > 0);
  egal(imgs[0].src, PROJETS[0].medias.find((m) => m.type === "image").src);
});

lancer("Pages projet");
