import { MemoryRouter } from "react-router-dom";
import { test, verifier, egal, lancer, monter, agir, saisir, pause } from "./outils.jsx";
import FormulaireContact from "../src/FormulaireContact.jsx";
import App from "../src/App.jsx";
import { validerContact, construirePayload, envoyerContact, CHAMPS_VIDES, formulaireActif } from "../src/contact.js";
import { SITE } from "../src/config/site.js";
import { marquerIntroPassee } from "../src/intro.js";

marquerIntroPassee();
const CLE = "00000000-0000-4000-8000-000000000000";
const remplis = { nom: "Jeanne Martin", email: "jeanne@exemple.fr", entreprise: "", message: "Bonjour, un projet de campagne.", botcheck: false };

test("aucune clé de démonstration ou d'un autre client n'est livrée", () => {
  const cle = SITE.forms.contact;
  verifier(cle === "" || /^[0-9a-f-]{36}$/i.test(cle), "vide ou au format Web3Forms");
  for (const autre of ["c17e10a4-48af-4427-9771-74d70c880726", "2ae91ff1-56b1-4d10-837a-2f8cb049db3e"]) {
    verifier(cle !== autre, "clé du projet DollyLashesStudio");
  }
});

test("l'adresse de réception est celle du brief", () => {
  egal(SITE.email, "g.mbonzo@gmail.com");
});

test("validation : nom, e-mail et message obligatoires, messages en français", () => {
  const e = validerContact(CHAMPS_VIDES);
  egal(Object.keys(e), ["nom", "email", "message"]);
  egal(validerContact(remplis), {});
  verifier(validerContact({ ...remplis, email: "jeanne@exemple" }).email);
});

test("payload JSON : intitulés lisibles, l'essentiel d'abord, entreprise seulement si remplie", () => {
  const p = construirePayload(remplis, CLE);
  egal(Object.keys(p), ["access_key", "subject", "from_name", "replyto", "botcheck", "Nom", "E-mail", "Message"]);
  egal(p.replyto, remplis.email);
  const avec = construirePayload({ ...remplis, entreprise: "Orée" }, CLE);
  egal(Object.keys(avec).slice(5), ["Nom", "E-mail", "Entreprise / marque", "Message"]);
});

test("sans clé configurée, le formulaire laisse place à l'adresse e-mail", async () => {
  const { conteneur, demonter } = await monter(<MemoryRouter><FormulaireContact cle="" /></MemoryRouter>);
  verifier(!formulaireActif(""));
  const repli = conteneur.querySelector('[data-testid="repli-sans-cle"]');
  verifier(repli && repli.querySelector("a").getAttribute("href").startsWith(`mailto:${SITE.email}`));
  verifier(!conteneur.querySelector("form"));
  await demonter();
});

test("envoi vide : erreurs reliées aux champs, rien n'est envoyé, focus sur le premier", async () => {
  let appels = 0;
  const { conteneur, demonter } = await monter(<MemoryRouter><FormulaireContact cle={CLE} fetchImpl={() => appels++} /></MemoryRouter>);
  await agir(() => conteneur.querySelector("form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
  egal(appels, 0);
  const nom = conteneur.querySelector("#nom");
  egal(nom.getAttribute("aria-invalid"), "true");
  egal(conteneur.querySelector(`#${nom.getAttribute("aria-describedby")}`).textContent, "Indiquez votre nom.");
  verifier(document.activeElement === nom, "focus sur le champ Nom");
  await demonter();
});

test("le formulaire renvoie vers la politique de confidentialité", async () => {
  const { conteneur, demonter } = await monter(<MemoryRouter><FormulaireContact cle={CLE} /></MemoryRouter>);
  verifier(conteneur.querySelector('.formulaire__info a[href="/legal-notice"]'));
  await demonter();
});

test("le champ piège est invisible et hors tabulation", async () => {
  const { conteneur, demonter } = await monter(<MemoryRouter><FormulaireContact cle={CLE} /></MemoryRouter>);
  const piege = conteneur.querySelector('input[name="botcheck"]');
  egal([piege.tabIndex, piege.getAttribute("aria-hidden")], [-1, "true"]);
  await demonter();
});

async function remplirEtEnvoyer(conteneur) {
  await saisir(conteneur.querySelector("#nom"), remplis.nom);
  await saisir(conteneur.querySelector("#email"), remplis.email);
  await saisir(conteneur.querySelector("#message"), remplis.message);
  await agir(() => conteneur.querySelector("form").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
  await agir(() => pause(10));
}

test("envoi réussi : POST JSON vers Web3Forms, message de remerciement", async () => {
  let recu = null;
  const fetchImpl = async (url, init) => {
    recu = { url, init };
    return { ok: true, status: 200, json: async () => ({ success: true }) };
  };
  const { conteneur, demonter } = await monter(<MemoryRouter><FormulaireContact cle={CLE} fetchImpl={fetchImpl} /></MemoryRouter>);
  await remplirEtEnvoyer(conteneur);
  egal(recu.url, "https://api.web3forms.com/submit");
  egal(recu.init.headers["Content-Type"], "application/json");
  egal(JSON.parse(recu.init.body).access_key, CLE);
  verifier(conteneur.querySelector('[data-statut="succes"]'), "remerciement affiché");
  await demonter();
});

test("échec d'envoi : repli avec l'adresse e-mail", async () => {
  const fetchImpl = async () => ({ ok: false, status: 500, json: async () => ({ success: false, message: "erreur" }) });
  const { conteneur, demonter } = await monter(<MemoryRouter><FormulaireContact cle={CLE} fetchImpl={fetchImpl} /></MemoryRouter>);
  await remplirEtEnvoyer(conteneur);
  const statut = conteneur.querySelector('[data-statut="echec"]');
  verifier(statut && statut.querySelector(`a[href^="mailto:${SITE.email}"]`));
  await demonter();
});

test("limite de temps : la requête est abandonnée au-delà du délai", async () => {
  const fetchImpl = (url, { signal }) =>
    new Promise((_, rejeter) => signal.addEventListener("abort", () => rejeter(Object.assign(new Error("abort"), { name: "AbortError" }))));
  const res = await envoyerContact({}, { fetchImpl, delaiMax: 20 });
  egal(res, { ok: false, raison: "délai dépassé" });
});

test("la page Contact a un seul h1 et l'adresse e-mail en clair", async () => {
  const { conteneur, demonter } = await monter(
    <MemoryRouter initialEntries={["/contact"]}>
      <App />
    </MemoryRouter>
  );
  egal(conteneur.querySelectorAll("h1").length, 1);
  verifier(conteneur.querySelector(`a[href="mailto:${SITE.email}"]`));
  await demonter();
});

lancer("Formulaire de contact");
