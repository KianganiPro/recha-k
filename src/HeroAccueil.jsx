import { useState } from "react";
import GooeyMarquee from "./GooeyMarquee.jsx";
import { ACCUEIL } from "./accueil.js";
import { mouvementReduit } from "./intro.js";
import { urlImage } from "./media.js";

/**
 * Hero de l'accueil : bandeau défilant + vidéo (fiche « Accueil » du Studio).
 * - Ordinateur (≥ 768 px) : le bandeau passe derrière la vidéo.
 * - Mobile : le bandeau, puis la vidéo.
 * Mouvement réduit : pas de lecture automatique (poster seul) ; le défilement
 * du bandeau est coupé par index.css.
 */
export default function HeroAccueil({ contenu = ACCUEIL, entree = false, delai = 0 }) {
  const [reduit] = useState(mouvementReduit);
  const { bandeau, video } = contenu;

  return (
    <section
      className="hero"
      aria-label="Présentation"
      data-entree={entree ? "" : undefined}
      data-avec-video={video ? "" : undefined}
      style={{ "--d": `${delai.toFixed(3)}s` }}
    >
      <div className="hero__bandeau">
        <div className="hero__bandeau-entree">
          <GooeyMarquee texte={bandeau} />
        </div>
      </div>

      {video && (
        <div className="hero__media">
          <figure className="hero__video">
            <video
              src={video.src}
              poster={video.poster ? urlImage(video.poster, 1600) : undefined}
              autoPlay={!reduit}
              muted
              loop
              playsInline
              preload="auto"
              aria-label={video.alt}
            />
          </figure>
        </div>
      )}
    </section>
  );
}