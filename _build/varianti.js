// Crea le versioni ridotte delle foto (800 px di larghezza) per griglie e telefoni.
// Uso: node _build/varianti.js   — poi node _build/build.js (che le usa da solo nel srcset)
// Richiede sharp: se non è installato nel progetto, prova quello della cartella temporanea di Claude.
const fs = require('fs');
const path = require('path');
let sharp;
for (const p of ['sharp', 'C:/Users/CLAUDE~1/AppData/Local/Temp/claude/node_modules/sharp']) { try { sharp = require(p); break; } catch (e) { /* prossimo */ } }
if (!sharp) { console.error('sharp non trovato: npm i sharp'); process.exit(1); }

const dir = path.join(__dirname, '..', 'assets', 'foto');
const outDir = path.join(dir, '800');
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.webp'))) {
    const src = path.join(dir, f), dst = path.join(outDir, f);
    if (fs.existsSync(dst) && fs.statSync(dst).mtimeMs >= fs.statSync(src).mtimeMs) continue;
    await sharp(src).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 78 }).toFile(dst);
    console.log('800px:', f, Math.round(fs.statSync(src).size / 1024) + ' → ' + Math.round(fs.statSync(dst).size / 1024) + ' KB');
  }
})();
