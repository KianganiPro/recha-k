import { useEffect, useRef } from "react";
import Lettres from "./Lettres.jsx";
import { SITE } from "./config/site.js";
import { INTRO, FIN_PRECHARGEUR, easeInOutQuad } from "./intro.js";
import { urlImage } from "./media.js";

/**
 * Préchargeur : six images qui s'ouvrent en pile inclinée, le nom qui monte,
 * un compteur 000 → 100, puis tout se referme et le rideau remonte.
 * Port de la timeline GSAP d'origine en animations CSS (index.css,
 * .prechargeur*) ; seul le compteur est en requestAnimationFrame.
 *
 * Décoratif : aria-hidden. Le h1 de la page d'accueil porte le vrai titre.
 */
export default function Prechargeur({ images = [], onFin }) {
  const compteurRef = useRef(null);
  const finRef = useRef(onFin);
  finRef.current = onFin;

  // Compteur 000 → 100, en power2.inOut comme l'original.
  useEffect(() => {
    const el = compteurRef.current;
    if (!el) return undefined;
    const debut = (INTRO.delai + INTRO.compteur.compteDebut) * 1000;
    const duree = INTRO.compteur.compteDur * 1000;
    let origine = null; // prise sur la première frame : une seule horloge
    let raf = 0;
    const tick = (t) => {
      if (origine === null) origine = t;
      const ecoule = t - origine - debut;
      const p = Math.min(1, Math.max(0, ecoule / duree));
      el.textContent = String(Math.round(easeInOutQuad(p) * 100)).padStart(3, "0");
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Filet de sécurité : si animationend ne vient pas (onglet en arrière-plan,
  // animation interrompue), on libère quand même la page.
  useEffect(() => {
    const t = window.setTimeout(() => finRef.current?.(), (FIN_PRECHARGEUR + 0.4) * 1000);
    return () => window.clearTimeout(t);
  }, []);

  const quandRideauFini = (e) => {
    if (e.target === e.currentTarget) finRef.current?.();
  };

  const s = (v) => `${v.toFixed(3)}s`;
  const n = images.length;

  return (
    <div
      className="prechargeur"
      aria-hidden="true"
      onAnimationEnd={quandRideauFini}
      data-testid="prechargeur"
      style={{
        "--d-rideau": s(INTRO.delai + INTRO.rideau.debut),
        "--d-compteur": s(INTRO.delai + INTRO.compteur.debut),
        "--d-sortie": s(INTRO.delai + INTRO.sortie.debut),
        "--pas-sortie": s(INTRO.lettres.decalage),
      }}
    >
      <div className="prechargeur__images">
        {images.map((img, i) => (
          <div
            key={`${img.src}-${i}`}
            className="prechargeur__img"
            style={{
              "--rot": `${INTRO.rotations[i % INTRO.rotations.length]}deg`,
              "--d-in": s(INTRO.delai + INTRO.images.debut + i * INTRO.images.decalage),
              // stagger négatif de l'original : la dernière image se referme en premier
              "--d-out": s(INTRO.delai + INTRO.imagesSortie.debut + (n - 1 - i) * INTRO.imagesSortie.decalage),
            }}
          >
            <img src={urlImage(img.src, 500)} alt="" decoding="async" />
          </div>
        ))}
      </div>

      <div className="prechargeur__entete">
        <p className="prechargeur__titre">
          <Lettres
            texte={SITE.name}
            lireTexte={false}
            className="prechargeur__lettres"
            delai={INTRO.delai + INTRO.lettres.debut}
            pas={INTRO.lettres.decalage}
          />
        </p>
        <div className="prechargeur__compteur">
          <p ref={compteurRef}>000</p>
        </div>
      </div>
    </div>
  );
}
