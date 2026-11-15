import { useEffect, useState } from "react";

/**
 * Lien vers un réseau social, sous forme d'icône.
 *
 * L'icône est le fichier SVG officiel du réseau (public/icons/<id>.svg),
 * appliqué en masque CSS : elle prend la couleur de l'encre du moment
 * (noire sur fond clair, blanche sur un projet foncé), sans variante à gérer.
 * Si le fichier manque, on affiche le nom en texte plutôt qu'un lien vide.
 */
export default function IconeReseau({ reseau }) {
  const [iconeOk, setIconeOk] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.onerror = () => setIconeOk(false);
    img.src = reseau.icone;
  }, [reseau.icone]);

  return (
    <a
      className="reseau"
      href={reseau.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${reseau.label} (nouvel onglet)`}
    >
      {iconeOk ? (
        <span className="reseau__icone" style={{ "--icone": `url("${reseau.icone}")` }} aria-hidden="true" />
      ) : (
        <span aria-hidden="true">{reseau.label}</span>
      )}
    </a>
  );
}
