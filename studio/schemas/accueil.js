import { avertirPoidsVideo } from "./regles.js";

export default {
  name: "accueil",
  title: "Accueil",
  type: "document",
  fields: [
    {
      name: "bandeau",
      title: "Texte du bandeau défilant",
      description: "Répété en boucle derrière la vidéo. Terminez par un séparateur, ex. « Directeur créatif • ».",
      type: "string",
      initialValue: "Directeur créatif •",
      validation: (Rule) => Rule.required().max(60),
    },
    {
      name: "video",
      title: "Vidéo du hero",
      description: "MP4 (H.264), sans son, format 16:9 conseillé, 8 Mo maximum. Elle tourne en boucle.",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      validation: (Rule) => [Rule.required(), avertirPoidsVideo(8)(Rule)],
    },
    {
      name: "poster",
      title: "Image d'attente",
      description: "Affichée le temps que la vidéo se charge.",
      type: "image",
    },
    {
      name: "alt",
      title: "Description de la vidéo",
      description: "Une phrase sur ce qu'on voit (lue par les lecteurs d'écran).",
      type: "string",
      validation: (Rule) => Rule.required().warning("Une description aide l'accessibilité."),
    },
  ],
  preview: { prepare: () => ({ title: "Accueil", subtitle: "Bandeau et vidéo du hero" }) },
};