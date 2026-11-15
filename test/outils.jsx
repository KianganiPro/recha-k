/**
 * Mini-harnais de test : pas de framework, des assertions nommées en français.
 */
import { act } from "react";
import { createRoot } from "react-dom/client";

const tests = [];
export const test = (nom, fn) => tests.push({ nom, fn });

export function verifier(condition, message) {
  if (!condition) throw new Error(message || "assertion fausse");
}
export function egal(obtenu, attendu, message = "") {
  const a = JSON.stringify(obtenu);
  const b = JSON.stringify(attendu);
  if (a !== b) throw new Error(`${message}\n      obtenu  : ${a}\n      attendu : ${b}`);
}

export const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/** Monte un élément React dans un conteneur neuf ; renvoie le conteneur et de quoi démonter. */
export async function monter(element) {
  const conteneur = document.createElement("div");
  document.body.appendChild(conteneur);
  const racine = createRoot(conteneur);
  await act(async () => racine.render(element));
  return {
    conteneur,
    demonter: async () => {
      await act(async () => racine.unmount());
      conteneur.remove();
    },
  };
}

export const agir = (fn) => act(async () => fn());

/** Saisie dans un champ contrôlé par React (passe par le setter natif). */
export async function saisir(champ, valeur) {
  const proto = champ.tagName === "TEXTAREA" ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
  await act(async () => {
    setter.call(champ, valeur);
    champ.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
}

export async function lancer(nomSuite) {
  let ok = 0;
  const echecs = [];
  for (const t of tests) {
    try {
      await t.fn();
      ok++;
    } catch (e) {
      echecs.push({ nom: t.nom, e });
    }
    document.body.innerHTML = '<div id="root"></div>';
    document.documentElement.removeAttribute("style");
    delete document.documentElement.dataset.transition;
  }
  console.log(`\n${nomSuite} — ${ok}/${tests.length}`);
  for (const { nom, e } of echecs) console.log(`  ✖ ${nom}\n      ${e.message}`);
  // Résultat lu par test/run.mjs
  console.log(`@@RESULTAT ${ok} ${tests.length}`);
  // jsdom (requestAnimationFrame simulé) garde la boucle d'événements en vie : on sort explicitement.
  process.exit(echecs.length ? 1 : 0);
}
