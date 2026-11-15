import { SITE } from "./config/site.js";

/**
 * Logique du formulaire de contact (Web3Forms), séparée du composant pour
 * être testée sans navigateur.
 */
export const WEB3FORMS_URL = "https://api.web3forms.com/submit";
export const DELAI_MAX_MS = 15000;

export const CHAMPS_VIDES = { nom: "", email: "", entreprise: "", message: "", botcheck: false };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Renvoie { champ: message } ; objet vide si tout est bon. */
export function validerContact(c) {
  const erreurs = {};
  if (c.nom.trim().length < 2) erreurs.nom = "Indiquez votre nom.";
  if (!EMAIL.test(c.email.trim())) erreurs.email = "Cette adresse e-mail semble incomplète.";
  if (c.message.trim().length < 10) erreurs.message = "Votre message doit faire au moins 10 caractères.";
  return erreurs;
}

/**
 * Corps envoyé à Web3Forms, en JSON : les clés servent d'intitulés dans
 * l'e-mail reçu, et leur ordre est l'ordre des lignes — l'essentiel d'abord.
 * Champs réservés (n'apparaissent pas dans le message) : access_key,
 * subject, from_name, replyto, botcheck.
 */
export function construirePayload(c, cle = SITE.forms.contact) {
  const corps = {
    access_key: cle,
    subject: `Nouveau message depuis le portfolio — ${c.nom.trim()}`,
    from_name: `Portfolio ${SITE.name}`,
    replyto: c.email.trim(),
    botcheck: c.botcheck,
    Nom: c.nom.trim(),
    "E-mail": c.email.trim(),
  };
  if (c.entreprise.trim()) corps["Entreprise / marque"] = c.entreprise.trim();
  corps.Message = c.message.trim();
  return corps;
}

/** Le formulaire peut-il envoyer ? (clé Web3Forms renseignée) */
export const formulaireActif = (cle = SITE.forms.contact) => typeof cle === "string" && cle.trim().length > 0;

/**
 * Envoi avec limite de temps. Résout { ok: true } ou { ok: false, raison }.
 * fetchImpl est injectable pour les tests.
 */
export async function envoyerContact(payload, { fetchImpl = globalThis.fetch, delaiMax = DELAI_MAX_MS } = {}) {
  const ctrl = new AbortController();
  const minuteur = setTimeout(() => ctrl.abort(), delaiMax);
  try {
    const rep = await fetchImpl(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    const json = await rep.json().catch(() => ({}));
    if (rep.ok && json.success !== false) return { ok: true };
    return { ok: false, raison: json.message || `HTTP ${rep.status}` };
  } catch (e) {
    return { ok: false, raison: e?.name === "AbortError" ? "délai dépassé" : "réseau" };
  } finally {
    clearTimeout(minuteur);
  }
}
