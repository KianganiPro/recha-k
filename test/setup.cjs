/**
 * Environnement de test : jsdom + les quelques API que jsdom n'a pas.
 * Chargé avant chaque suite (voir test/run.mjs).
 */
const { JSDOM } = require("jsdom");

const dom = new JSDOM('<!doctype html><html lang="fr"><head><meta name="theme-color" content="#E0E2DB"></head><body><div id="root"></div></body></html>', {
  url: "http://localhost/",
  pretendToBeVisual: true, // fournit requestAnimationFrame
});
const { window } = dom;

const globaux = [
  "window",
  "document",
  "navigator",
  "HTMLElement",
  "HTMLInputElement",
  "HTMLMediaElement",
  "Node",
  "Event",
  "KeyboardEvent",
  "MouseEvent",
  "FocusEvent",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "DOMParser",
  "Image",
];
for (const k of globaux) {
  Object.defineProperty(globalThis, k, { value: window[k], configurable: true, writable: true });
}

// Stubs : ce que jsdom n'implémente pas.
window.scrollTo = () => {};
window.HTMLMediaElement.prototype.play = function play() {
  this.dataset.lecture = "1";
  return Promise.resolve();
};
window.HTMLMediaElement.prototype.pause = function pause() {
  this.dataset.lecture = "0";
};
class Observateur {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = globalThis.ResizeObserver = Observateur;
window.IntersectionObserver = globalThis.IntersectionObserver = Observateur;

// matchMedia piloté par les tests : globalThis.__reduit = true simule « réduire les animations ».
window.matchMedia = (q) => ({
  matches: q.includes("prefers-reduced-motion") ? Boolean(globalThis.__reduit) : false,
  media: q,
  addEventListener() {},
  removeEventListener() {},
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
