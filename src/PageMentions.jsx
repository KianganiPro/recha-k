import { useEffect } from "react";
import Lettres from "./Lettres.jsx";
import Seo from "./Seo.jsx";
import { SITE, mailto } from "./config/site.js";
import { SEO } from "./seoConfig.js";
import { HEBERGEUR, PRESTATAIRES, DUREE_CONSERVATION } from "./content/mentions.js";
import { DELAI_SANS_INTRO } from "./intro.js";
import { appliquerFond } from "./fond.js";

/** Valeur du client, ou un repère bien visible tant qu'elle manque. */
function lignesEditeur(e) {
  return [
    e.adresse && `Adresse : ${e.adresse}`,
    e.telephone && `Téléphone : ${e.telephone}`,
    e.siret && `SIRET : ${e.siret}${e.immatriculation ? ` — ${e.immatriculation}` : ""}`,
    e.tva && `TVA intracommunautaire : ${e.tva}`,
  ].filter(Boolean);
}

/**
 * Mentions légales (LCEN art. 6 III) et politique de confidentialité (RGPD
 * art. 13). Les informations du client viennent de SITE.editeur, les
 * prestataires de content/mentions.js.
 */
export default function PageMentions() {
  useEffect(() => {
    appliquerFond(null);
  }, []);

  const e = SITE.editeur;
  const d = DELAI_SANS_INTRO;

  return (
    <main id="contenu" tabIndex={-1} className="mentions">
      <Seo {...SEO.mentions} />
      <h1 className="titre-geant">
        <Lettres texte="Legal Notice" delai={d} pas={0.03} />
      </h1>

      <div className="mentions__corps apparait" style={{ "--d": `${d + 0.4}s` }}>
        <section aria-labelledby="editeur">
          <h2 id="editeur">Website Editor</h2>
          <p>
            {SITE.name}
            {e.statut && `, ${e.statut}`}
            {lignesEditeur(e).map((ligne) => (
              <span key={ligne}>
                <br />
                {ligne}
              </span>
            ))}
            <br />
            E-mail : <a className="lien-souligne" href={mailto()}>{SITE.email}</a>
          </p>
          <p>Publisher : {SITE.name}.</p>
        </section>

        <section aria-labelledby="hebergement">
          <h2 id="hebergement">Hosting Provider</h2>
          <p>
            {HEBERGEUR.nom}, {HEBERGEUR.adresse}.
            <br />
            Contact :{" "}
            <a className="lien-souligne" href={HEBERGEUR.contact} target="_blank" rel="noopener noreferrer">
              vercel.com/contact<span className="sr-only"> (nouvel onglet)</span>
            </a>
          </p>
        </section>

        <section aria-labelledby="propriete">
          <h2 id="propriete">Intellectual Property</h2>
          <p>
            The projects presented here were created by {SITE.name} for its clients. The trademarks, logos, and visuals
            belong to their respective owners and are reproduced for professional reference purposes.
            Any reproduction, even partial, without authorization is prohibited.
          </p>
        </section>

        <section aria-labelledby="donnees" id="donnees-personnelles">
          <h2 id="donnees">Personal Information</h2>
          <p>
            <strong>Data Controller :</strong> {SITE.name}, can be reached at{" "}
            <a className="lien-souligne" href={mailto("Données personnelles")}>{SITE.email}</a>.
          </p>
          <p>
            <strong>Data collected :</strong> only the information you enter in the contact form
            (name, email, company—optional, message). Your name, email, and message are required so we can
            respond to you: without them, the message cannot be sent.
          </p>
          <p>
            <strong>Purpose and legal basis: </strong> to respond to your request and, if applicable, prepare a quote —
            precontractual measures taken at your request (Art. 6.1.b of the GDPR).
          </p>
          <p>
            <strong>Retention period:</strong> {DUREE_CONSERVATION}. No data is sold or used for
            advertising purposes.
          </p>
          <p>
            <strong>Recipients and subcontractors :</strong>
          </p>
          <ul className="mentions__liste">
            {PRESTATAIRES.map((p) => (
              <li key={p.id}>
                {p.nom} — {p.role} ({p.lieu}, {p.garanties} ; {p.conservation}).
              </li>
            ))}
          </ul>
          <p>
            <strong>Your rights:</strong> access, rectification, erasure, restriction, objection, and data portability. To
            exercise these rights, please write to{" "}
            <a className="lien-souligne" href={mailto("Exercising My Rights")}>{SITE.email}</a>. You can also
            file a complaint with the{" "}
            <a className="lien-souligne" href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">
              CNIL<span className="sr-only"> (new tab)</span>
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="cookies">
          <h2 id="cookies">Cookies</h2>
          <p>
            This site does not use any cookies for audience measurement, advertising, or social media. Therefore, no consent
            is required.
          </p>
        </section>
      </div>
    </main>
  );
}
