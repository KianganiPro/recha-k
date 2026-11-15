/**
 * URL d'images : les images du CMS (cdn.sanity.io) sont redimensionnées et
 * converties à la volée par le CDN de Sanity. Les images locales (démo) sont
 * servies telles quelles.
 */
const CDN = "cdn.sanity.io/images/";

export const estImageCdn = (src) => typeof src === "string" && src.includes(CDN);

/** Une largeur donnée, format choisi par le CDN selon le navigateur (AVIF/WebP). */
export function urlImage(src, largeur, qualite = 75) {
  if (!estImageCdn(src)) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}w=${largeur}&q=${qualite}&fit=max&auto=format`;
}

/** srcset pour les images du CDN ; undefined pour les images locales. */
export function srcSetImage(src, largeurs = [480, 720, 1080, 1440]) {
  if (!estImageCdn(src)) return undefined;
  return largeurs.map((w) => `${urlImage(src, w)} ${w}w`).join(", ");
}
