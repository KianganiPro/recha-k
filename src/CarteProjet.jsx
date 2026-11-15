import LienTransition from "./LienTransition.jsx";
import { cheminProjet } from "./routes.js";
import { formaterDate, imagesDe } from "./projets.js";
import { srcSetImage, urlImage } from "./media.js";

/**
 * Carte de la page collection : visuel portrait 3:4, puis le détail dessous.
 * Visuel = image de couverture du projet (champ « Image de couverture » du
 * Studio), recadrée sur son point d'intérêt (hotspot). À défaut : première
 * image du projet, puis image d'attente de sa première vidéo.
 * `index` : rang dans la grille, pour l'entrée décalée.
 */
export default function CarteProjet({ projet, index = 0 }) {
  const visuel =
    projet.couverture ??
    imagesDe(projet, 1)[0] ??
    (() => {
      const poster = projet.medias.find((m) => m.type === "video" && m.poster)?.poster;
      return poster ? { src: poster } : null;
    })();
  const annee = projet.date ? formaterDate(projet.date).split(" ").pop() : "";
  const point = visuel?.hotspot;

  return (
    <li className="carte apparait" style={{ "--d": `${Math.min(index, 8) * 60}ms` }}>
      <LienTransition to={cheminProjet(projet.slug)} couleur={projet.couleur} className="carte__lien">
        <span className="carte__visuel">
          {visuel && (
            <img
              src={urlImage(visuel.src, 720)}
              srcSet={srcSetImage(visuel.src, [320, 480, 720, 1080])}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              alt=""
              width="600"
              height="800"
              loading={index < 4 ? "eager" : "lazy"}
              decoding="async"
              draggable="false"
              style={{
                ...(point ? { objectPosition: `${point.x * 100}% ${point.y * 100}%` } : {}),
                // aperçu flou fourni par Sanity le temps que l'image arrive
                ...(visuel.lqip ? { backgroundImage: `url(${visuel.lqip})` } : {}),
              }}
            />
          )}
        </span>
        <span className="carte__detail">
          <span className="carte__titre">{projet.titre}</span>
          <span className="carte__meta">
            {projet.mission && <span>[{projet.mission}]</span>}
            {annee && <span>{annee}</span>}
          </span>
        </span>
      </LienTransition>
    </li>
  );
}
