// Genera assets/marmo.webp: texture di marmo che si ripete senza cuciture.
// Il filtro copre ESATTAMENTE il riquadro (x/y/width/height in pixel): con la regione di default (-10%/120%)
// il disegno non si raccorda ai bordi e, ripetuto, mostra una riga netta.
const { chromium } = require('C:/Users/Claude FK/.claude/projects/hedonè progetto serio/node_modules/playwright');
const sharp = require('C:/Users/CLAUDE~1/AppData/Local/Temp/claude/node_modules/sharp');
const N = 900;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}"><rect width="${N}" height="${N}" fill="#F3EFE7"/><filter id="v" filterUnits="userSpaceOnUse" x="0" y="0" width="${N}" height="${N}"><feTurbulence type="fractalNoise" baseFrequency="${4 / N} ${12 / N}" numOctaves="4" seed="7" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .45 0 0 0 0 .42 0 0 0 0 .38 0 0 0 -9 4.3"/></filter><rect width="${N}" height="${N}" filter="url(#v)" opacity=".11"/></svg>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: N, height: N } });
  await p.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await p.waitForTimeout(300);
  const png = await p.screenshot({ clip: { x: 0, y: 0, width: N, height: N } });
  await b.close();
  await sharp(png).webp({ quality: 90 }).toFile(__dirname + '/../assets/marmo.webp');
  // controllo cuciture: differenza tra colonna sinistra e destra, riga alta e bassa
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => data[(y * info.width + x) * info.channels];
  let dx = 0, dy = 0, inner = 0;
  for (let i = 0; i < N; i++) { dx += Math.abs(px(0, i) - px(N - 1, i)); dy += Math.abs(px(i, 0) - px(i, N - 1)); inner += Math.abs(px(449, i) - px(450, i)); }
  console.log('salto medio ai bordi: orizzontale', (dx / N).toFixed(2), 'verticale', (dy / N).toFixed(2), '| tra due colonne interne', (inner / N).toFixed(2));
})();

// Passo 2: riquadro 1800x1800 fatto da 4 copie specchiate → ogni bordo tocca il suo riflesso, cucitura impossibile
(async () => {
  await new Promise(r => setTimeout(r, 4000)); // aspetta il passo 1
  const src = __dirname + '/../assets/marmo.webp';
  const t = await sharp(src).raw().toBuffer({ resolveWithObject: true });
  const tile = () => sharp(t.data, { raw: t.info });
  const [a, h, v, hv] = await Promise.all([tile().png().toBuffer(), tile().flop().png().toBuffer(), tile().flip().png().toBuffer(), tile().flip().flop().png().toBuffer()]);
  await sharp({ create: { width: N * 2, height: N * 2, channels: 3, background: '#F3EFE7' } })
    .composite([{ input: a, left: 0, top: 0 }, { input: h, left: N, top: 0 }, { input: v, left: 0, top: N }, { input: hv, left: N, top: N }])
    .webp({ quality: 90 }).toFile(__dirname + '/../assets/marmo-1800.webp');
  console.log('marmo-1800.webp pronto');
})();
