import { useEffect, useState } from "react";
import { SCRAMBLE, melanger } from "./scramble.js";
import { mouvementReduit } from "./intro.js";

/**
 * Texte qui se brouille puis se fixe (port du composant be-ui-404-not-found).
 * requestAnimationFrame avec une seule horloge : l'origine est prise sur la
 * première frame (l'original mélangeait performance.now() et le timestamp
 * de rAF). Mouvement réduit : texte fixe d'emblée.
 */
export default function Scramble({ texte }) {
  const [affiche, setAffiche] = useState(texte);

  useEffect(() => {
    if (mouvementReduit()) {
      setAffiche(texte);
      return undefined;
    }
    let origine = null;
    let dernier = -Infinity;
    let raf = 0;
    const boucle = (t) => {
      if (origine === null) origine = t;
      const ecoule = t - origine;
      if (ecoule >= SCRAMBLE.duree) {
        setAffiche(texte);
        return;
      }
      if (t - dernier >= SCRAMBLE.pas) {
        dernier = t;
        setAffiche(melanger(texte, ecoule / SCRAMBLE.duree));
      }
      raf = requestAnimationFrame(boucle);
    };
    raf = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(raf);
  }, [texte]);

  return <span className="scramble">{affiche}</span>;
}
