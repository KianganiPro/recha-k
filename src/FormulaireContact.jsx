import { useRef, useState } from "react";
import Champ from "./Champ.jsx";
import LienTransition from "./LienTransition.jsx";
import { ROUTES } from "./routes.js";
import { SITE, mailto } from "./config/site.js";
import { CHAMPS_VIDES, construirePayload, envoyerContact, formulaireActif, validerContact } from "./contact.js";

/**
 * Formulaire de contact Web3Forms : validation avant envoi, champ piège
 * invisible (botcheck), limite de 15 s, repli vers l'adresse e-mail en cas
 * d'échec. Sans clé configurée, on affiche directement le repli.
 */
export default function FormulaireContact({ fetchImpl, cle = SITE.forms.contact }) {
  const [champs, setChamps] = useState(CHAMPS_VIDES);
  const [erreurs, setErreurs] = useState({});
  const [statut, setStatut] = useState("repos"); // repos | envoi | succes | echec
  const formRef = useRef(null);

  if (!formulaireActif(cle)) {
    return (
      <p className="formulaire__repli" data-testid="repli-sans-cle">
        Please email me directly at{" "}
        <a className="lien-souligne" href={mailto("Initial Contact via the Portfolio")}>
          {SITE.email}
        </a>
        .
      </p>
    );
  }

  const maj = (e) => {
    const { name, value, type, checked } = e.target;
    setChamps((c) => ({ ...c, [name]: type === "checkbox" ? checked : value }));
    if (erreurs[name]) setErreurs((er) => ({ ...er, [name]: undefined }));
  };

  const envoyer = async (e) => {
    e.preventDefault();
    const er = validerContact(champs);
    setErreurs(er);
    if (Object.keys(er).length) {
      // Focus sur le premier champ en erreur (par son nom : l'état n'est pas
      // encore rendu à cet instant, aria-invalid n'est pas posé).
      formRef.current?.querySelector(`[name="${Object.keys(er)[0]}"]`)?.focus();
      return;
    }
    setStatut("envoi");
    const res = await envoyerContact(construirePayload(champs, cle), fetchImpl ? { fetchImpl } : undefined);
    setStatut(res.ok ? "succes" : "echec");
    if (res.ok) setChamps(CHAMPS_VIDES);
  };

  if (statut === "succes") {
    return (
      <p className="formulaire__statut" role="status" data-statut="succes">
        Thank you, your message has been sent. I'll get back to you as soon as possible.
      </p>
    );
  }

  return (
    <form ref={formRef} className="formulaire" onSubmit={envoyer} noValidate>
      {/* Piège à robots : invisible et hors tabulation, un humain ne le coche pas. */}
      <input
        type="checkbox"
        name="botcheck"
        className="formulaire__piege"
        tabIndex={-1}
        autoComplete="off"
        checked={champs.botcheck}
        onChange={maj}
        aria-hidden="true"
      />
      <div className="formulaire__ligne">
        <Champ id="nom" label="Name" autoComplete="name" value={champs.nom} onChange={maj} erreur={erreurs.nom} required />
        <Champ
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          value={champs.email}
          onChange={maj}
          erreur={erreurs.email}
          required
        />
      </div>
      <Champ
        id="entreprise"
        label="Company or Brand"
        autoComplete="organization"
        value={champs.entreprise}
        onChange={maj}
        facultatif
      />
      <Champ id="message" label="Message" multiligne value={champs.message} onChange={maj} erreur={erreurs.message} required />

      <div className="formulaire__actions">
        <button type="submit" className="bouton" disabled={statut === "envoi"}>
          {statut === "envoi" ? "Loading…" : "Send"}
        </button>
        <p className="formulaire__statut" role="status" aria-live="polite" data-statut={statut}>
          {statut === "echec" && (
            <>
              The message was not sent successfully. Please email me directly at{" "}
              <a className="lien-souligne" href={mailto("Prise de contact depuis le portfolio")}>
                {SITE.email}
              </a>
              .
            </>
          )}
        </p>
      </div>
      <p className="formulaire__info">
        Your information will be used solely to respond to you.{" "}
        <LienTransition to={ROUTES.mentions} className="lien-souligne">
          Learn more
        </LienTransition>
      </p>
    </form>
  );
}
