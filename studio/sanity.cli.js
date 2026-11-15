import { defineCliConfig } from "sanity/cli";
import cms from "./cms.config.json";

export default defineCliConfig({
  api: { projectId: cms.projectId, dataset: cms.dataset },
  // Adresse du Studio en ligne : https://portfolio-rk.sanity.studio (modifiable au premier déploiement)
  studioHost: "portfolio-rk",
  deployment: { autoUpdates: true },
});
