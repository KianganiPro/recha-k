import { useCallback, useEffect, useRef, useState } from "react";
import Diapo from "./Diapo.jsx";
import Fleche from "./Fleche.jsx";
import { boucler, compteur, estProche, etatDiapo, SEUIL_GLISSER } from "./carrousel.js";

/**
 * Carrousel des médias d'un projet : un média à la fois, compteur [01/07],
 * flèches, clavier (← →), glissement tactile, et clic sur la moitié
 * gauche / droite de l'image. La nouvelle diapositive s'ouvre en volet
 * (clip-path) par-dessus la précédente — animation CSS, .diapo dans index.css.
 */
export default function Carrousel({ medias, titre }) {
  const n = medias.length;
  const [etat, setEtat] = useState({ actif: 0, precedent: -1, sens: "suivant", demarre: false });
  const depart = useRef(null);

  const aller = useCallback(
    (pas) => {
      if (n < 2) return;
      setEtat((e) => ({
        actif: boucler(e.actif + pas, n),
        precedent: e.actif,
        sens: pas > 0 ? "suivant" : "precedent",
        demarre: true,
      }));
    },
    [n]
  );

  // Flèches du clavier, sauf quand on tape dans un champ.
  useEffect(() => {
    const touche = (e) => {
      if (e.target.closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight") aller(1);
      if (e.key === "ArrowLeft") aller(-1);
    };
    window.addEventListener("keydown", touche);
    return () => window.removeEventListener("keydown", touche);
  }, [aller]);

  if (n === 0) return null;

  const surPointeurBas = (e) => {
    depart.current = e.clientX;
  };
  const surPointeurHaut = (e) => {
    if (depart.current === null) return;
    const dx = e.clientX - depart.current;
    depart.current = null;
    if (Math.abs(dx) >= SEUIL_GLISSER) {
      aller(dx < 0 ? 1 : -1);
      return;
    }
    // Simple clic : moitié gauche = précédent, moitié droite = suivant.
    const r = e.currentTarget.getBoundingClientRect();
    if (r.width > 0) aller(e.clientX - r.left < r.width / 2 ? -1 : 1);
  };

  return (
    <section className="carrousel" aria-roledescription="carrousel" aria-label={`Visuels du projet ${titre}`}>
      <div
        className="carrousel__scene"
        data-multiple={n > 1 ? "" : undefined}
        onPointerDown={surPointeurBas}
        onPointerUp={surPointeurHaut}
        onPointerCancel={() => (depart.current = null)}
      >
        {medias.map((m, i) => (
          <Diapo
            key={`${m.src}-${i}`}
            media={m}
            index={i}
            total={n}
            etat={etatDiapo(i, etat)}
            sens={etat.sens}
            proche={estProche(i, etat.actif, n)}
          />
        ))}
      </div>

      {n > 1 && (
        <div className="carrousel__controles">
          <p className="carrousel__compteur" aria-live="polite" aria-atomic="true">
            <span className="sr-only">Visuel </span>
            {compteur(etat.actif, n)}
          </p>
          <div className="carrousel__boutons">
            <button type="button" className="bouton-icone" onClick={() => aller(-1)} aria-label="Visuel précédent">
              <Fleche sens="gauche" />
            </button>
            <button type="button" className="bouton-icone" onClick={() => aller(1)} aria-label="Visuel suivant">
              <Fleche sens="droite" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
