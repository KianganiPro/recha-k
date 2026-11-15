export const MO = 1024 * 1024;

/** Avertissement non bloquant si la vidéo dépasse maxMo. */
export const avertirPoidsVideo = (maxMo) => (Rule) =>
  Rule.custom(async (valeur, contexte) => {
    const ref = valeur?.asset?._ref;
    if (!ref) return true;
    const client = contexte.getClient({ apiVersion: "2025-02-19" });
    const taille = await client.fetch("*[_id == $id][0].size", { id: ref });
    return !taille || taille <= maxMo * MO
      ? true
      : `Vidéo de ${(taille / MO).toFixed(1)} Mo : au-delà de ${maxMo} Mo, compressez-la (HandBrake, préréglage « Web »).`;
  }).warning();