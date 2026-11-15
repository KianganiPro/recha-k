export default {
  name: "categorie",
  title: "Catégorie",
  type: "document",
  fields: [
    {
      name: "titre",
      title: "Nom de la catégorie",
      description: "Tel qu'il apparaîtra dans le filtre de la page des projets.",
      type: "string",
      validation: (Rule) => Rule.required().max(30),
    },
    {
      name: "slug",
      title: "Adresse",
      description: "Cliquez sur « Generate » (ex. /projects/publicite).",
      type: "slug",
      options: { source: "titre", maxLength: 40 },
      validation: (Rule) => Rule.required(),
    },
    {
      name: "ordre",
      title: "Position dans le filtre",
      description: "1 = juste après « ALL », 2 = ensuite… Deux catégories au même numéro sont classées par nom.",
      type: "number",
      initialValue: 10,
      validation: (Rule) => Rule.integer().min(0),
    },
  ],
  orderings: [{ title: "Ordre du filtre", name: "ordre", by: [{ field: "ordre", direction: "asc" }] }],
  preview: {
    select: { title: "titre", ordre: "ordre" },
    prepare: ({ title, ordre }) => ({ title, subtitle: ordre != null ? `Position ${ordre}` : "" }),
  },
};