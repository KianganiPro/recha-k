import { ROUTES } from "./routes.js";

/** Liens de la navigation principale — partagés par la barre (ordinateur) et le menu mobile. */
export const LIENS_NAV = [
  { to: ROUTES.projets, label: "Projects" },
  { to: ROUTES.contact, label: "Contact" },
];

/** Id du panneau du menu mobile (aria-controls du bouton). */
export const ID_MENU_MOBILE = "menu-mobile";
