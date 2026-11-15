import { useId } from "react";

/**
 * Bandeau défilant « gooey » : une couche floue seuillée (filtre SVG sur
 * l'alpha, équivalent de contrast(15)) et une couche nette par-dessus.
 * Boucle sur deux copies (0 → -50 %), texte lu une fois (sr-only).
 */
export default function GooeyMarquee({
  texte,
  duree = 39,
  repetitions = 4,
  sens = "gauche",
  bords = true,
  enPause = false,
  className = "",
}) {
  // useId renvoie des caractères non valides dans url(#…)
  const idFiltre = `seuil-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const motif = Array.from({ length: repetitions }, () => texte).join(" ");
  const piste = (
    <span className="gooey__piste">
      <span className="gooey__copie">{motif}&nbsp;</span>
      <span className="gooey__copie">{motif}&nbsp;</span>
    </span>
  );

  return (
    <div
      className={`gooey ${className}`}
      data-sens={sens}
      data-pause={enPause ? "" : undefined}
      data-bords={bords ? "" : undefined}
      style={{ "--duree": `${duree}s` }}
    >
      <p className="sr-only">{texte}</p>

      {/* a' = 15a − 7 : contrast(15) appliqué au seul canal alpha */}
      <svg className="gooey__svg" aria-hidden="true" focusable="false">
        <filter id={idFiltre} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 15 -7" />
        </filter>
      </svg>

      <div className="gooey__couche gooey__couche--flou" aria-hidden="true" style={{ filter: `url(#${idFiltre})` }}>
        {piste}
      </div>
      <div className="gooey__couche" aria-hidden="true">
        {piste}
      </div>
    </div>
  );
}