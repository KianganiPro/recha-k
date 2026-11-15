import donnees from "./content/accueil.json" with { type: "json" };
import { normaliserAccueil } from "./content/normaliser.js";
import { SITE } from "./config/site.js";

const contenu = normaliserAccueil(donnees);

export const ACCUEIL = {
  bandeau: contenu.bandeau || `${SITE.metier} •`,
  video: contenu.video && { ...contenu.video, alt: contenu.video.alt || `Vidéo de présentation de ${SITE.name}` },
};