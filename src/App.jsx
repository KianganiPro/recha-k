import { Route, Routes } from "react-router-dom";
import Layout from "./Layout.jsx";
import PageAccueil from "./PageAccueil.jsx";
import PageProjet from "./PageProjet.jsx";
import PageContact from "./PageContact.jsx";
import Page404 from "./Page404.jsx";
import PageMentions from "./PageMentions.jsx";
import PageProjets from "./PageProjets.jsx";
import { ROUTES } from "./routes.js";

/** Toutes les routes du site. Un chemin absent ici = page vide : test/routes.test.jsx le vérifie. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path={ROUTES.accueil} element={<PageAccueil />} />
        <Route path={ROUTES.projets} element={<PageProjets />} />
        <Route path={ROUTES.categorie} element={<PageProjets />} />
        <Route path={ROUTES.projet} element={<PageProjet />} />
        <Route path={ROUTES.contact} element={<PageContact />} />
        <Route path={ROUTES.mentions} element={<PageMentions />} />
        <Route path="*" element={<Page404 />} />
      </Route>
    </Routes>
  );
}
