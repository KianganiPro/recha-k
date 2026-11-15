import { useEffect, useRef } from "react";
import { srcSetImage, urlImage } from "./media.js";

/**
 * Une diapositive du carrousel : image ou vidéo.
 * etat : "actif" | "precedent" | "cache" | "initial"
 * La vidéo ne joue que lorsqu'elle est à l'écran.
 */
export default function Diapo({ media, etat, sens, proche, index, total }) {
  const videoRef = useRef(null);
  const visible = etat === "actif" || etat === "initial";

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (visible) v.play?.()?.catch?.(() => {});
    else v.pause?.();
  }, [visible]);

  return (
    <figure
      className="diapo"
      data-etat={etat}
      data-sens={sens}
      role="group"
      aria-roledescription="diapositive"
      aria-label={`${index + 1} sur ${total}`}
      aria-hidden={!visible}
    >
      {media.type === "video" ? (
        <video
          ref={videoRef}
          className="diapo__media"
          src={media.src}
          poster={media.poster ? urlImage(media.poster, 1080) : undefined}
          muted
          loop
          playsInline
          preload={proche ? "auto" : "none"}
          aria-label={media.alt}
        />
      ) : (
        <img
          className="diapo__media"
          src={urlImage(media.src, 1440)}
          srcSet={srcSetImage(media.src)}
          sizes="(min-width: 1024px) 70vw, 100vw"
          alt={media.alt}
          width={media.largeur ?? undefined}
          height={media.hauteur ?? undefined}
          // les voisines se chargent en avance : pas de trou au défilement
          loading={proche ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          decoding="async"
          // aperçu flou (LQIP fourni par Sanity) le temps que l'image arrive
          style={media.lqip ? { backgroundImage: `url(${media.lqip})` } : undefined}
        />
      )}
    </figure>
  );
}
