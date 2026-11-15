# Portfolio — Recha K

React 19 · Vite · Tailwind CSS 4 · react-router-dom · contenu géré dans **Sanity**.
Aucune bibliothèque d'animation : l'intro GSAP d'origine a été portée en CSS
(+ `requestAnimationFrame` pour le compteur).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 76 tests jsdom (esbuild + jsdom, sans framework)
npm run build      # contenu CMS → sitemap/robots/security.txt → vite build
```

---

## Arborescence

```
src/
  config/site.js        identité, e-mail, clé Web3Forms (replis sans .env)
  theme.js              couleurs, typo, courbes, durées → aussi en variables CSS
  routes.js             chemins, source unique
  seoConfig.js          title/description par page, JSON-LD
  content/
    projets.json        ÉCRIT AU BUILD depuis Sanity (démo tant que le CMS n'est pas branché)
    normaliser.js       nettoyage des données du CMS (partagé avec le script Node)
  intro.js              chronologie de l'intro (timeline GSAP d'origine, en secondes)
  split.js              découpe lettres/mots (remplace SplitText)
  fond.js               couleur de page « vivante » (survol, page projet)
  transition.js         contexte de transition de page
  *.jsx                 composants, à plat
scripts/
  fetch-content.mjs     Sanity → src/content/projets.json
  generate-sitemap.mjs  sitemap.xml + robots.txt + .well-known/security.txt
studio/                 Studio Sanity (application séparée, hébergée par Sanity)
test/                   suites *.test.jsx + setup.cjs + run.mjs
```

---

### Ce qu'on remplit (fiche « Projet »)

| Champ | Type | Remarque |
|---|---|---|
| Couleur de l'arrière-plan | sélecteur de couleur | le texte passe seul en noir ou blanc ; alerte si contraste < 4,5 |
| Titre du projet | texte, 40 car. | |
| Adresse de la page | bouton *Generate* | `/projet/atelier-nord` |
| Date de réalisation | date | affichée « Mars 2025 », tri du plus récent au plus ancien |
| Type de mission | texte, 40 car. | Campagne 360°, Publicité réseaux sociaux… |
| Liens | liste libellé + URL | vide → rubrique masquée |
| Visuels | images + vidéos, glisser-déposer | ordre = ordre du carrousel ; alerte si vidéo > 5 Mo |
| Description courte | texte, facultatif | **ajout de ma part** : sert aussi de description Google |