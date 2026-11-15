/**
 * Champ de formulaire étiqueté, avec message d'erreur relié (aria-describedby).
 * Défini au niveau du module — jamais dans le composant formulaire, sinon le
 * curseur sauterait à chaque lettre tapée.
 */
export default function Champ({ id, label, erreur, multiligne = false, facultatif = false, ...props }) {
  const idErreur = `${id}-erreur`;
  const commun = {
    id,
    name: id,
    className: "champ__saisie",
    "aria-invalid": erreur ? "true" : undefined,
    "aria-describedby": erreur ? idErreur : undefined,
    ...props,
  };
  return (
    <div className="champ">
      <label htmlFor={id} className="champ__label">
        {label}
        {facultatif && <span className="champ__facultatif"> (facultatif)</span>}
      </label>
      {multiligne ? <textarea rows={6} {...commun} /> : <input {...commun} />}
      {erreur && (
        <p id={idErreur} className="champ__erreur">
          {erreur}
        </p>
      )}
    </div>
  );
}
