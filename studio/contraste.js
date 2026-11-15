/**
 * Contraste WCAG — même calcul que src/theme.js (encrePour).
 * Le Studio est une application à part : il ne peut pas importer le thème du
 * site. Les deux encres ci-dessous DOIVENT rester identiques à ENCRES_PROJET
 * dans src/theme.js — test/cms.test.jsx le vérifie.
 */
export const ENCRES_PROJET = ["#141414", "#FFFFFF"];

function luminance(hex) {
  const v = String(hex).replace("#", "");
  const full = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  const canal = (i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4);
}

export function contraste(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Meilleur contraste atteignable sur ce fond avec l'une des deux encres. */
export const meilleurContraste = (fond) => Math.max(...ENCRES_PROJET.map((e) => contraste(e, fond)));
