import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { colorInput } from "@sanity/color-input";
import { schemaTypes, SINGLETONS } from "./schemas/index.js";
import cms from "./cms.config.json";

export default defineConfig({
  name: "portfolio",
  title: "Portfolio — RK",
  projectId: cms.projectId,
  dataset: cms.dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Contenu")
          .items([
            S.listItem()
              .title("Accueil")
              .id("accueil")
              .child(S.document().schemaType("accueil").documentId("accueil").title("Accueil")),
            S.divider(),
            S.listItem()
              .title("Projets")
              .schemaType("projet")
              .child(S.documentTypeList("projet").title("Projets").defaultOrdering([{ field: "date", direction: "desc" }])),
            S.listItem()
              .title("Catégories")
              .schemaType("categorie")
              .child(S.documentTypeList("categorie").title("Catégories").defaultOrdering([{ field: "ordre", direction: "asc" }])),
          ]),
    }),
    colorInput(),
  ],
  schema: {
    types: schemaTypes,
    templates: (modeles) => modeles.filter(({ schemaType }) => !SINGLETONS.includes(schemaType)),
  },
  document: {
    actions: (actions, { schemaType }) =>
      SINGLETONS.includes(schemaType)
        ? actions.filter(({ action }) => !["unpublish", "delete", "duplicate"].includes(action))
        : actions,
  },
});