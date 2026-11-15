/**
 * Lance toutes les suites test/*.test.jsx :
 * chaque suite est empaquetée par esbuild puis exécutée dans un processus
 * Node neuf (état global propre), après test/setup.cjs.
 *
 * Équivalent PowerShell d'une suite isolée :
 *   npx esbuild test/x.test.jsx --bundle --platform=node --format=cjs --outfile=test/.build/x.cjs --loader:.jsx=jsx --jsx=automatic
 *   node -e "require('./test/setup.cjs'); require('./test/.build/x.cjs');"
 */
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync } from "node:fs";

const suites = readdirSync("test").filter((f) => f.endsWith(".test.jsx")).sort();
const filtre = process.argv[2];
mkdirSync("test/.build", { recursive: true });

let ok = 0;
let total = 0;
let echec = false;

for (const fichier of suites.filter((f) => !filtre || f.includes(filtre))) {
  const sortie = `test/.build/${fichier.replace(".jsx", ".cjs")}`;
  await build({
    entryPoints: [`test/${fichier}`],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: sortie,
    loader: { ".jsx": "jsx", ".js": "jsx" },
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"development"' },
    logLevel: "error",
  });
  let texte = "";
  try {
    texte = execFileSync(process.execPath, ["-e", `require('./test/setup.cjs'); require('./${sortie}');`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    texte = `${e.stdout ?? ""}${e.stderr ?? ""}`;
    echec = true;
  }
  const m = texte.match(/@@RESULTAT (\d+) (\d+)/);
  process.stdout.write(texte.replace(/@@RESULTAT.*\n?/, ""));
  if (m) {
    ok += Number(m[1]);
    total += Number(m[2]);
  } else {
    echec = true;
    console.log(`  ✖ ${fichier} n'a pas pu s'exécuter`);
  }
}

console.log(`\n===> ${ok}/${total} ${echec || ok !== total ? "ÉCHEC" : "OK"}`);
process.exit(echec || ok !== total ? 1 : 0);
