import { useMemo } from "react";
import { decouper, empreinte, ordreAleatoire } from "./split.js";

/**
 * Texte animé lettre par lettre (ou mot par mot), sous cache.
 *
 * - Le texte intact est doublé en sr-only, le découpage est aria-hidden :
 *   un lecteur d'écran lit « Atelier Nord », pas « A, t, e, l… ».
 * - Chaque lettre reçoit --d (délai d'entrée), --r (rang aléatoire, utilisé
 *   par la sortie de page) et --k (index, utilisé par le roulement au survol).
 * - L'animation elle-même est en CSS (index.css, classes .anime-*).
 *
 * Props :
 *   texte       texte à afficher
 *   par         "lettres" | "mots"
 *   delai       délai d'entrée de la première unité, en secondes
 *   pas         écart entre deux unités, en secondes
 *   aleatoire   ordre d'entrée au hasard (stable) plutôt que de gauche à droite
 *   entree      false = pas d'animation d'entrée (déjà visible)
 *   lireTexte   false = pas de doublon sr-only (le parent fournit un aria-label)
 */
export default function Lettres({
  texte,
  par = "lettres",
  delai = 0,
  pas = 0.075,
  aleatoire = true,
  entree = true,
  lireTexte = true,
  className = "",
}) {
  const mots = useMemo(() => decouper(texte), [texte]);
  const nbUnites = par === "mots" ? mots.length : mots.reduce((n, m) => n + m.lettres.length, 0);
  const ordre = useMemo(
    () => (aleatoire ? ordreAleatoire(nbUnites, empreinte(texte)) : Array.from({ length: nbUnites }, (_, i) => i)),
    [aleatoire, nbUnites, texte]
  );

  let u = 0; // index de l'unité courante
  const style = () => {
    const r = ordre[u++] ?? 0;
    return { "--d": `${(delai + r * pas).toFixed(3)}s`, "--r": r };
  };

  return (
    <span className={className}>
      {lireTexte && <span className="sr-only">{texte}</span>}
      <span aria-hidden="true">
        {mots.map((m, i) => (
          <span key={i}>
            {i > 0 && " "}
            <span className="masque">
              {par === "mots" ? (
                <span className={entree ? "anime-mot" : "mot"} style={style()}>
                  {m.mot}
                </span>
              ) : (
                m.lettres.map((l) => (
                  <span
                    key={l.k}
                    className={entree ? "lettre anime-lettre" : "lettre"}
                    style={{ ...style(), "--k": l.k }}
                  >
                    {l.c}
                  </span>
                ))
              )}
            </span>
          </span>
        ))}
      </span>
    </span>
  );
}
