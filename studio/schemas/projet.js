import { meilleurContraste } from "../contraste.js";
import { avertirPoidsVideo } from "./regles.js";

/**
 * Fiche « Projet » du Studio — les champs du brief, dans l'ordre du brief.
 * Chaque champ porte une aide en français : le client remplit seul.
 */
const POIDS_VIDEO_MAX_MO = 5;

export default {
  name: "projet",
  title: "Projet",
  type: "document",
  fields: [
    {
      name: "couleur",
      title: "Couleur de l'arrière-plan",
      description:
        "Toute la page du projet prend cette couleur, et l'accueil aussi au survol du nom. Le texte passe automatiquement en noir ou en blanc.",
      type: "color",
      options: { disableAlpha: true },
      validation: (Rule) => [
        Rule.required().error("Choisissez une couleur de fond."),
        Rule.custom((v) => {
          if (!v?.hex) return true;
          const c = meilleurContraste(v.hex);
          return c >= 4.5
            ? true
            : `Contraste faible (${c.toFixed(1)}:1, il faut 4,5) : les petits textes seront difficiles à lire. Essayez une teinte plus claire ou plus foncée.`;
        }).warning(),
      ],
    },
    {
      name: "titre",
      title: "Titre du projet",
      description: "Nom de la marque ou du projet, tel qu'il doit apparaître dans la liste.",
      type: "string",
      validation: (Rule) => Rule.required().max(40).error("Titre requis, 40 caractères maximum."),
    },
    {
      name: "slug",
      title: "Adresse de la page",
      description: "Cliquez sur « Generate » : l'adresse est créée à partir du titre (ex. /projet/atelier-nord).",
      type: "slug",
      options: { source: "titre", maxLength: 60 },
      validation: (Rule) => Rule.required().error("Cliquez sur « Generate » pour créer l'adresse."),
    },
    {
      name: "couverture",
      title: "Image de couverture",
      description:
        "Affichée sur la carte du projet (page Projets), au format portrait 3:4. Cliquez sur l'icône de recadrage pour placer le point d'intérêt : il restera visible.",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", title: "Description de l'image", type: "string", description: "Une phrase sur ce qu'on voit (lue par Google)." },
      ],
      validation: (Rule) => Rule.required().error("Ajoutez une image de couverture."),
    },
    {
      name: "date",
      title: "Date de réalisation",
      description: "Le jour importe peu : seuls le mois et l'année sont affichés. Les projets sont classés du plus récent au plus ancien.",
      type: "date",
      options: { dateFormat: "MMMM YYYY" },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "mission",
      title: "Type de mission",
      description:
        "En quelques mots : Publicité réseaux sociaux, Campagne 360°, Marketing, Création de contenu, Contenu de marque…",
      type: "string",
      validation: (Rule) => Rule.required().max(40),
    },
        {
      name: "categories",
      title: "Catégories",
      description:
        "Une ou plusieurs. Le projet apparaîtra dans « ALL » et dans chacune de ses catégories. Pour en créer une : rubrique « Catégories ».",
      type: "array",
      of: [{ type: "reference", to: [{ type: "categorie" }] }],
      options: { layout: "tags" },
      validation: (Rule) => [
        Rule.unique(),
        Rule.custom((v) => (v?.length ? true : "Sans catégorie, le projet n'apparaîtra que dans « ALL ».")).warning(),
      ],
    },
    {
      name: "liens",
      title: "Liens vers le projet en ligne",
      description: "Facultatif. Laissez vide : la rubrique « Liens » n'apparaîtra pas sur la page.",
      type: "array",
      of: [
        {
          type: "object",
          name: "lien",
          title: "Lien",
          fields: [
            { name: "libelle", title: "Texte du lien", type: "string", description: "Ex. : Voir la campagne, Instagram, Site…" },
            {
              name: "url",
              title: "Adresse",
              type: "url",
              validation: (Rule) => Rule.required().uri({ scheme: ["http", "https"] }),
            },
          ],
          preview: { select: { title: "libelle", subtitle: "url" } },
        },
      ],
    },
    {
      name: "medias",
      title: "Visuels du projet (images, vidéos)",
      description:
        "Glissez-déposez vos fichiers. L'ordre ici est l'ordre du carrousel — le premier visuel sert aussi de vignette sur l'accueil. Vidéos : MP4, 5 Mo maximum, sans son.",
      type: "array",
      of: [
        {
          type: "image",
          title: "Image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Description de l'image",
              type: "string",
              description:
                "Décrivez ce qu'on voit, en une phrase (lu par Google et les lecteurs d'écran). Si l'image contient du texte, recopiez-le.",
              validation: (Rule) => Rule.required().warning("Une description aide Google et l'accessibilité."),
            },
          ],
        },
        {
          type: "object",
          name: "video",
          title: "Vidéo",
          fields: [
            {
              name: "fichier",
              title: "Fichier vidéo",
              type: "file",
              options: { accept: "video/mp4,video/webm" },
              validation: (Rule) => [Rule.required(), avertirPoidsVideo(POIDS_VIDEO_MAX_MO)(Rule)],
            },
            {
              name: "poster",
              title: "Image d'attente (facultatif)",
              description: "Affichée le temps que la vidéo se charge.",
              type: "image",
            },
            {
              name: "alt",
              title: "Description de la vidéo",
              type: "string",
              validation: (Rule) => Rule.required().warning("Une description aide l'accessibilité."),
            },
          ],
          preview: {
            select: { title: "alt", media: "poster" },
            prepare: ({ title, media }) => ({ title: title || "Vidéo", subtitle: "Vidéo", media }),
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1).error("Ajoutez au moins un visuel."),
    },
    {
      name: "description",
      title: "Description",
      description:
        "Présentation du le projet. Affichée sous le titre, et reprise par Google dans les résultats de recherche.",
      type: "text",
      rows: 3,
      validation: (Rule) => Rule.max(300),
    },
  ],
  orderings: [
    { title: "Plus récents d'abord", name: "dateDesc", by: [{ field: "date", direction: "desc" }] },
  ],
  preview: {
    select: { title: "titre", mission: "mission", date: "date", media: "medias.0" },
    prepare: ({ title, mission, date, media }) => ({
      title,
      subtitle: [mission, date?.slice(0, 7)].filter(Boolean).join(" · "),
      media: media?.asset ? media : undefined,
    }),
  },
};
