// Michelangelo Beauty — genera tutte le pagine del sito.
// Uso: node _build/build.js   (dalla cartella del progetto)
// Le foto vanno in assets/foto/<id>.webp e i disegni in assets/disegni/<id>.webp:
// finché un file manca, al suo posto compare un segnaposto con nome e proporzioni.
const fs = require('fs');
const path = require('path');
const D = require('./catalogo');

const out = path.join(__dirname, '..');
const V = '8'; // cache-busting css/js
const FREE = 49, STD = 4.9, EXP = 8.9, GIFT = 3;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const eur = n => n.toFixed(2).replace('.', ',') + ' €';
const BY = Object.fromEntries(D.P.map(p => [p.id, p]));
const LINE = Object.fromEntries(D.LINES.map(l => [l.id, l]));
const slug = p => 'opera-' + p.id + '.html';
const inLine = id => D.P.filter(p => p.line === id);

// ---------- Foto e disegni ----------
function webpSize(file) {
  const b = fs.readFileSync(file);
  const t = b.toString('ascii', 12, 16);
  if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
  if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (t === 'VP8L') { const n = b.readUInt32LE(21); return { w: (n & 0x3fff) + 1, h: ((n >> 14) & 0x3fff) + 1 }; }
  throw new Error('formato WebP non riconosciuto: ' + file);
}
const RATIO = { '16:9': [16, 9, '2048×1152'], '4:5': [4, 5, '1600×2000'], '1:1': [1, 1, '1600×1600'] };
const photoUses = {}; // id → elenco pagine (per il controllo "mai foto duplicate")
const photoList = {}; // id → dati per ELENCO-FOTO.md
let curPage = '';

// shared = foto prodotto (packshot): per natura compare in negozio, home, abbinamenti e carrello
function photo(id, ratio, desc, { alt = '', eager = false, sizes = '(max-width: 900px) 100vw, 50vw', shared = false, cls = '' } = {}) {
  if (!shared) (photoUses[id] = photoUses[id] || []).push(curPage);
  photoList[id] = photoList[id] || { id, ratio, desc, pages: new Set(), shared };
  photoList[id].pages.add(curPage);
  const f = path.join(out, 'assets/foto', id + '.webp');
  const [rw, rh] = RATIO[ratio];
  if (fs.existsSync(f)) {
    const { w, h } = webpSize(f);
    const small = fs.existsSync(path.join(out, 'assets/foto/800', id + '.webp')) && w > 800 ? ` srcset="assets/foto/800/${id}.webp 800w, assets/foto/${id}.webp ${w}w"` : '';
    return `<img class="ph-img ${cls}" src="assets/foto/${id}.webp"${small} alt="${esc(alt || desc)}" width="${w}" height="${h}" sizes="${sizes}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
  }
  return `<div class="ph ${cls}" style="aspect-ratio:${rw}/${rh}" role="img" aria-label="${esc(alt || desc)}"><span class="ph__tag">Foto · ${ratio}</span><span class="ph__id">${id}</span><span class="ph__desc">${esc(desc)}</span></div>`;
}
const drawList = {};
function drawing(id, desc, cls = '') {
  if (drawList[id]) throw new Error('Disegno usato due volte: ' + id + ' (' + drawList[id].page + ' e ' + curPage + ')');
  drawList[id] = { id, desc, page: curPage };
  const f = path.join(out, 'assets/disegni', id + '.webp');
  if (fs.existsSync(f)) {
    const { w, h } = webpSize(f);
    return `<img class="dw-img ${cls}" src="assets/disegni/${id}.webp" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">`;
  }
  return `<div class="dw ${cls}" aria-hidden="true"><span class="dw__tag">Disegno a sanguigna</span><span class="dw__id">${id}</span><span class="dw__desc">${esc(desc)}</span></div>`;
}
const packshot = (p, o = {}) => photo('prodotto-' + p.id, '4:5', p.name + ' ' + p.size + ' sul piano di marmo, stessa luce per tutto il catalogo', { alt: p.name, shared: true, sizes: '(max-width: 700px) 50vw, 25vw', ...o });

// ---------- Pezzi comuni ----------
const NAV = [['opere.html', 'Le opere'], ['rituale.html', 'Il tuo rituale'], ['lotto.html', 'Traccia il lotto'], ['bottega.html', 'La bottega']];
const ICON = {
  bag: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 8h14l-1.2 12H6.2L5 8Z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8"/></svg>',
  wa: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>'
};
const logo = (tag = 'a') => `<${tag} class="logo"${tag === 'a' ? ' href="index.html"' : ''}><span class="logo__name">Michelangelo</span><span class="logo__sub">Beauty · bottega toscana</span></${tag}>`;

function header(active) {
  const links = NAV.map(([h, l]) => `<a href="${h}"${h === active ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `<a class="skip" href="#main">Vai al contenuto</a>
<div class="topbar">Spedizione gratuita da 49 € · <strong>Sito dimostrativo: nessun ordine reale</strong></div>
<header class="site-header">
  <div class="header-in">
    ${logo()}
    <nav class="nav" aria-label="Principale">${links}</nav>
    <div class="header-actions">
      <button class="cart-btn" type="button" data-cart-open aria-label="Apri il carrello">${ICON.bag}<span class="cart-btn__n" data-cart-count>0</span></button>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu>Menu</button>
    </div>
  </div>
  <div class="menu" id="menu" hidden>
    <nav aria-label="Menu">${links}<a href="spedizioni-resi.html">Spedizioni e resi</a><a href="domande-contatti.html">Domande e contatti</a></nav>
  </div>
</header>`;
}

const footer = () => `<footer class="site-footer">
  <div class="footer-in">
    <div class="footer-brand">${logo('div')}<p>Cosmetici fatti a mano in piccoli lotti numerati, tra Firenze e le Alpi Apuane.</p></div>
    <div class="footer-cols">
      <div><p class="footer-title">Negozio</p><a href="opere.html">Tutte le opere</a><a href="rituale.html">Il tuo rituale</a><a href="opere.html?linea=cofanetti">Idee regalo</a></div>
      <div><p class="footer-title">La bottega</p><a href="bottega.html">Chi siamo</a><a href="lotto.html">Traccia il lotto</a></div>
      <div><p class="footer-title">Aiuto</p><a href="spedizioni-resi.html">Spedizioni e resi</a><a href="domande-contatti.html">Domande e contatti</a></div>
      <div><p class="footer-title">Legale</p><a href="condizioni-vendita.html">Condizioni di vendita</a><a href="privacy.html">Privacy</a><a href="cookie.html">Cookie</a></div>
    </div>
    <p class="footer-legal">Progetto dimostrativo. Michelangelo Beauty è un marchio di fantasia, senza alcun legame con l'artista Michelangelo Buonarroti, i suoi eredi o istituzioni museali. Nomi, prodotti, prezzi e dati non si riferiscono ad attività reali. ${esc(D.SELLER)}.</p>
  </div>
</footer>`;

// carrello laterale + pannello INCI (telefono): uguali in ogni pagina
const shell = () => `<div class="overlay" data-overlay hidden></div>
<aside class="drawer" id="carrello" aria-label="Carrello" aria-hidden="true" tabindex="-1">
  <div class="drawer__head"><h2>Carrello</h2><button type="button" class="icon-btn" data-cart-close aria-label="Chiudi il carrello">${ICON.close}</button></div>
  <div class="drawer__body" data-cart-body></div>
  <div class="drawer__foot" data-cart-foot></div>
</aside>
<div class="toast" data-toast role="status" aria-live="polite"></div>`;

function page({ file, active = '', title, description, body, ld = [], cls = '' }) {
  const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#F3EFE7">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..600&amp;family=Instrument+Sans:wght@400;500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css?v=${V}">
${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>
<body class="${cls}">
${header(active)}
<main id="main">
${body}
</main>
${footer()}
${shell()}
<script src="js/catalogo.js?v=${V}"></script>
<script src="js/main.js?v=${V}"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(out, file), html);
  console.log('scritto', file);
}

// card prodotto (negozio, home, abbinamenti)
function card(p, { heading = 'h3' } = {}) {
  const l = LINE[p.line];
  return `<article class="card" style="--line:${l.bg};--line-fg:${l.fg}" data-line="${l.id}" data-skin="${p.skin.join('|')}" data-format="${p.format}" data-price="${p.price}" data-name="${esc(p.name)}" data-order="${D.P.indexOf(p)}">
  <a class="card__media" href="${slug(p)}" tabindex="-1" aria-hidden="true">${packshot(p)}</a>
  <div class="card__band"><span>Opera n. ${p.opera}</span><span>${l.name}</span></div>
  <div class="card__body">
    <${heading} class="card__name"><a href="${slug(p)}">${esc(p.name)}</a></${heading}>
    <p class="card__meta">${p.size} · <strong>${eur(p.price)}</strong></p>
    <button class="btn btn--add" type="button" data-add="${p.id}">Aggiungi <span class="sr">${esc(p.name)} al carrello</span></button>
  </div>
</article>`;
}

const sectionHead = (roman, title, intro = '') => `<div class="sec-head"><p class="roman">${roman}</p><h2>${title}</h2>${intro ? `<p class="sec-intro">${intro}</p>` : ''}</div>`;

// ---------- HOME ----------
curPage = 'index.html';
{
  const lines = D.LINES.map(l => {
    const n = inLine(l.id).length;
    return `<a class="line-tile" href="opere.html?linea=${l.id}" style="--line:${l.bg};--line-fg:${l.fg}">
  <div class="line-tile__media">${photo('linea-' + l.id, '4:5', lineaDesc(l.id), { sizes: '(max-width: 700px) 50vw, 33vw' })}</div>
  <div class="line-tile__text"><span class="roman">${l.roman}</span><span class="line-tile__name">${l.name}</span><span class="line-tile__meta">${n === 1 ? '1 opera' : n + ' opere'} · ${l.pigment}</span></div>
</a>`;
  }).join('\n');
  const best = ['crema-iris', 'scrub-marmo', 'sapone-calendula', 'siero-vinacce'].map(id => card(BY[id])).join('\n');
  const demoInci = ['Olea Europaea Fruit Oil', 'Iris Florentina Root Extract', 'Calcium Carbonate'];
  page({
    file: 'index.html', title: 'Michelangelo Beauty · Bottega di cosmetica toscana',
    description: 'Cosmetici fatti a mano in piccoli lotti numerati tra Firenze e le Apuane: olio d\'oliva, iris fiorentino, polvere di marmo di Carrara. Progetto dimostrativo.',
    ld: [{ '@context': 'https://schema.org', '@type': 'Store', name: 'Michelangelo Beauty (progetto dimostrativo)', description: 'Bottega di cosmetica artigianale, marchio di fantasia.', email: D.EMAIL, priceRange: '€€' }],
    body: `
<section class="hero">
  <div class="hero__media">${photo('home-apertura', '16:9', 'Il banco di marmo della bottega con vasetti in vetro ambrato, saponi e un mazzo di iris; mani che lavorano; luce calda da una finestra laterale', { eager: true, sizes: '100vw' })}</div>
  <div class="hero__text wrap">
    <div>
      <p class="eyebrow">Bottega di cosmetica · Toscana</p>
      <h1>Cosmetici fatti a mano, <em>come opere di bottega.</em></h1>
      <p class="lead">Olio extravergine d'oliva, iris fiorentino, polvere di marmo di Carrara. Piccoli lotti numerati, lavorati a mano tra Firenze e le Alpi Apuane.</p>
      <a class="btn btn--primary" href="opere.html">Scopri le opere</a>
    </div>
    ${drawing('dw-mani-banco', 'Due mani che lavorano un panetto di sapone sul banco, tratto a sanguigna', 'hero__dw')}
  </div>
</section>

<section class="trust wrap" aria-label="Perché comprare da noi">
  <div><strong>Spedizione gratuita</strong><span>da 49 €, in tutta Italia</span></div>
  <div><strong>Consegna in 2-4 giorni</strong><span>lavorativi, con data stimata</span></div>
  <div><strong>Reso entro 14 giorni</strong><span>dalla consegna</span></div>
  <div><strong>Lotti numerati</strong><span>ogni confezione si può tracciare</span></div>
</section>

<section class="sec wrap">
  ${sectionHead('I', 'Le linee', 'Ogni linea ha il colore di un pigmento da affresco. Lo ritrovi su ogni opera, nel negozio e nel carrello.')}
  <div class="lines">${lines}</div>
</section>

<section class="sec wrap">
  ${sectionHead('II', 'Le opere più amate')}
  <div class="grid">${best}</div>
</section>

<section class="band band--rituale">
  <div class="wrap band__in">
    <div>
      <p class="roman">III</p>
      <h2>Tre domande, il tuo rituale.</h2>
      <p class="lead">Che pelle hai, quando ti prendi cura di te, cosa ti interessa. In meno di un minuto ti proponiamo due o tre opere, con il perché di ogni scelta.</p>
      <a class="btn btn--light" href="rituale.html">Componi il tuo rituale</a>
    </div>
    ${drawing('dw-mortaio', 'Mortaio di marmo con pestello e qualche foglia di rosmarino, tratto a sanguigna', 'band__dw')}
  </div>
</section>

<section class="sec wrap split">
  <div class="split__media">${photo('home-bottega', '4:5', 'Tommaso incarta i saponi nella carta kraft e li lega con lo spago, al banco della bottega', { sizes: '(max-width: 900px) 100vw, 50vw' })}</div>
  <div class="split__text">
    <p class="roman">IV</p>
    <h2>Due persone, un banco di marmo, il tempo che serve.</h2>
    <p>Livia scrive le ricette e distilla la lavanda. Tommaso taglia e incarta i saponi, e setaccia la polvere di marmo che arriva dai laboratori di scultura delle Apuane. Lavoriamo pochi pezzi alla volta, e ogni lotto ha un numero.</p>
    <a class="link" href="bottega.html">Entra in bottega</a>
  </div>
</section>

<section class="band band--lotto">
  <div class="wrap band__in">
    <div>
      <p class="roman">V</p>
      <h2>Traccia il tuo lotto.</h2>
      <p>Sulla confezione trovi un numero come <strong>MB-26-118</strong>. Inseriscilo e scopri quando è stata fatta la tua opera, da chi e da dove arrivano gli ingredienti.</p>
    </div>
    <form class="lot-form" action="lotto.html" method="get">
      <label for="lotto-home">Numero di lotto</label>
      <div class="lot-form__row"><input id="lotto-home" name="lotto" type="text" inputmode="text" autocomplete="off" placeholder="MB-26-118" required><button class="btn btn--primary" type="submit">Cerca</button></div>
    </form>
  </div>
</section>

<section class="sec wrap label-demo">
  ${sectionHead('VI', 'Come leggere un\'etichetta', 'L\'INCI è l\'elenco degli ingredienti, obbligatorio e quasi incomprensibile. Nelle nostre schede ogni parola si tocca e si spiega da sola. Prova qui:')}
  <div class="inci" data-inci>
    <ul class="inci__list">${demoInci.map(n => `<li><button type="button" class="inci__chip" data-inci-name="${esc(n)}" aria-expanded="false">${esc(n)}</button></li>`).join('')}</ul>
    <div class="inci__panel" data-inci-panel hidden></div>
  </div>
  <p class="label-demo__pao"><strong>E il PAO?</strong> È il disegno del vasetto aperto con <strong>6M</strong> o <strong>12M</strong>: i mesi entro cui usare il prodotto dopo averlo aperto.</p>
</section>

<section class="sec wrap newsletter">
  <div>
    <h2>Una lettera al mese dalla bottega</h2>
    <p>Cosa stiamo raccogliendo, quale lotto è appena uscito, niente pubblicità. Ti puoi cancellare quando vuoi.</p>
  </div>
  <form class="nl-form" data-demo-form novalidate>
    <label for="nl-email">La tua email</label>
    <input id="nl-email" type="email" autocomplete="email" required>
    <label class="check"><input type="checkbox" required> Acconsento a ricevere la newsletter (<a href="privacy.html">privacy</a>)</label>
    <button class="btn btn--primary" type="submit">Iscriviti</button>
    <p class="form-msg" data-form-msg hidden>Fatto: sei iscritto (sito dimostrativo, nessuna email verrà inviata).</p>
  </form>
</section>`
  });
}
function lineaDesc(id) {
  return {
    'viso': 'Vasetto di crema e flacone di siero su un piano di marmo, un fiore di iris viola accanto',
    'corpo': 'Barattolo di scrub con polvere di marmo bianca e flacone di olio alla lavanda, mazzetto di lavanda',
    'mani-labbra': 'Mani che aprono una scatolina di latta di balsamo, maniche di lino',
    'capelli': 'Panetto di shampoo solido su un telo di lino, rametti di rosmarino fresco',
    'saponi': 'Saponi in stagionatura su griglie di castagno, vista dall\'alto',
    'cofanetti': 'Il cofanetto dei quattro saponi chiuso con nastro di cotone (oggi in uso una foto provvisoria con vasetti: da rifare)'
  }[id];
}

// ---------- NEGOZIO ----------
curPage = 'opere.html';
{
  const chips = (name, label, values) => `<div class="filter" role="group" aria-label="${label}"><span class="filter__label">${label}</span><div class="chips">${values.map(([v, t], i) => `<button type="button" class="chip" data-filter="${name}" data-value="${v}" aria-pressed="${i === 0}">${t}</button>`).join('')}</div></div>`;
  page({
    file: 'opere.html', active: 'opere.html', title: 'Le opere · Michelangelo Beauty',
    description: 'Tutti i cosmetici della bottega: viso, corpo, mani e labbra, capelli, saponi e cofanetti regalo. Prezzi IVA inclusa.',
    body: `
<section class="page-head wrap">
  <p class="eyebrow">Negozio</p>
  <h1>Le opere</h1>
  <p class="lead">Dieci opere, fatte a mano in piccoli lotti. Prezzi IVA inclusa, spedizione gratuita da 49 €.</p>
</section>
<section class="wrap shop">
  <div class="filters">
    ${chips('linea', 'Linea', [['tutte', 'Tutte']].concat(D.LINES.map(l => [l.id, l.name])))}
    ${chips('pelle', 'Tipo di pelle', [['tutte', 'Tutte'], ['Secca', 'Secca'], ['Sensibile', 'Sensibile'], ['Mista o grassa', 'Mista o grassa']])}
    ${chips('formato', 'Formato', [['tutti', 'Tutti'], ['Crema', 'Crema'], ['Olio', 'Olio'], ['Scrub', 'Scrub'], ['Balsamo', 'Balsamo'], ['Solido', 'Solido'], ['Cofanetto', 'Cofanetto']])}
  </div>
  <div class="shop__bar"><p class="shop__count" data-shop-count aria-live="polite">${D.P.length} opere</p>
    <label class="sort">Ordina <select data-sort><option value="evidenza">In evidenza</option><option value="prezzo-asc">Prezzo crescente</option><option value="prezzo-desc">Prezzo decrescente</option><option value="nome">Nome A-Z</option></select></label></div>
  <div class="grid" data-shop-grid>${D.P.map(p => card(p, { heading: 'h2' })).join('\n')}</div>
  <div class="shop__empty" data-shop-empty hidden>
    ${drawing('dw-ulivo-carta', 'Ramo d\x27ulivo su carta, tratto leggero a sanguigna', 'empty__dw')}
    <p>Nessuna opera con questi filtri.</p><button class="btn btn--ghost" type="button" data-filter-reset>Togli i filtri</button>
  </div>
</section>`
  });
}

// ---------- SCHEDE PRODOTTO ----------
for (const p of D.P) {
  curPage = slug(p);
  const l = LINE[p.line];
  const inciBlocks = p.contents ? p.contents.map(c => (typeof c === 'string' ? { title: BY[c].name + ' ' + BY[c].size, inci: BY[c].inci } : { title: c.name + ' ' + c.size, inci: c.inci })) : [{ title: '', inci: p.inci }];
  const inciHtml = inciBlocks.map(b => `${b.title ? `<p class="inci__title">${esc(b.title)}</p>` : ''}<ul class="inci__list">${b.inci.split(', ').map(n => `<li><button type="button" class="inci__chip" data-inci-name="${esc(n)}" aria-expanded="false">${esc(n)}</button></li>`).join('')}</ul>`).join('');
  const nat = p.nat ? `${p.nat}% di ingredienti di origine naturale` : 'Dal 98% al 100% di ingredienti di origine naturale';
  const paoText = D.PAO_TEXT[p.pao] || 'ogni opera riporta il suo PAO sulla confezione.';
  const lotCell = p.lot ? `<a href="lotto.html?lotto=${p.lot}">${p.lot}</a> <span class="muted">(lotto in vendita ora)</span>` : 'Ogni opera ha il suo lotto';
  const acc = (title, inner, open = false) => `<details class="acc"${open ? ' open' : ''}><summary>${title}<span class="acc__icon" aria-hidden="true"></span></summary><div class="acc__body">${inner}</div></details>`;
  const desc = p.lead.length > 155 ? p.lead.slice(0, 152) + '…' : p.lead;
  page({
    file: slug(p), active: 'opere.html', title: `${p.name} · Opera n. ${p.opera} · Michelangelo Beauty`, description: desc, cls: 'is-product',
    ld: [{ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.lead, brand: { '@type': 'Brand', name: 'Michelangelo Beauty (marchio di fantasia)' }, sku: 'MB-' + p.id, offers: { '@type': 'Offer', price: p.price.toFixed(2), priceCurrency: 'EUR', availability: 'https://schema.org/InStock' } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'index.html' }, { '@type': 'ListItem', position: 2, name: 'Le opere', item: 'opere.html' }, { '@type': 'ListItem', position: 3, name: p.name }] }],
    body: `
<nav class="crumbs wrap" aria-label="Briciole di pane"><a href="index.html">Home</a> / <a href="opere.html">Le opere</a> / <a href="opere.html?linea=${l.id}">${l.name}</a> / <span aria-current="page">${esc(p.name)}</span></nav>
<section class="product wrap" style="--line:${l.bg};--line-fg:${l.fg}" data-product="${p.id}">
  <div class="product__gallery">
    ${packshot(p, { eager: true, sizes: '(max-width: 900px) 100vw, 50vw' })}
    ${photo(p.id + '-in-mano', '4:5', p.name + ' tenuto in mano, per mostrare la dimensione reale (' + p.size + ')', { alt: p.name + ', dimensione reale ' + p.size })}
    ${!p.gallery || p.gallery.includes('dettaglio') ? photo(p.id + '-dettaglio', '4:5', dettaglio(p), { alt: p.name + ', dettaglio' }) : ''}
  </div>
  <div class="product__info">
    <div class="buy">
      <p class="buy__line"><span class="pill">${l.name}</span> Opera n. ${p.opera}</p>
      <h1>${esc(p.name)}</h1>
      <p class="buy__lead">${esc(p.lead)}</p>
      <p class="buy__price"><strong>${eur(p.price)}</strong> <span>${p.size} · IVA inclusa</span></p>
      <div class="buy__row">
        <div class="qty" data-qty><button type="button" data-qty-dec aria-label="Diminuisci la quantità">−</button><span data-qty-val aria-live="polite">1</span><button type="button" data-qty-inc aria-label="Aumenta la quantità">+</button></div>
        <button class="btn btn--primary btn--grow" type="button" data-add="${p.id}" data-add-qty>Aggiungi al carrello</button>
      </div>
      <ul class="buy__facts">
        <li data-ship-line data-price="${p.price}">Spedizione 4,90 € · gratuita da 49 €</li>
        <li>Arriva <strong data-delivery>in 2-4 giorni lavorativi</strong> con la spedizione standard</li>
        <li>Reso entro 14 giorni dalla consegna · <a href="spedizioni-resi.html">come funziona</a></li>
      </ul>
      ${p.warn ? `<p class="warn"><strong>Attenzione.</strong> ${esc(p.warn)}</p>` : ''}
    </div>
    <div class="museum">
      <p class="museum__title">Scheda dell'opera</p>
      <dl>
        <div><dt>Opera</dt><dd>n. ${p.opera} · linea ${l.name}</dd></div>
        <div><dt>Materiali</dt><dd>${esc(p.materiali)}</dd></div>
        <div><dt>Tecnica</dt><dd>${esc(p.tecnica)}</dd></div>
        <div><dt>Formato</dt><dd>${p.size}${p.pao ? ' · PAO ' + p.pao : ''}</dd></div>
        <div><dt>Lotto</dt><dd>${lotCell}</dd></div>
        <div><dt>Origine</dt><dd>${nat} (ISO 16128)</dd></div>
      </dl>
    </div>
    <div class="accs">
      ${acc('Descrizione', `<p>${esc(p.desc)}</p>`, true)}
      ${acc('Come si usa', `<p>${esc(p.use)}</p>`)}
      ${acc('Ingredienti <span class="acc__hint">tocca una parola</span>', `<div class="inci" data-inci>${inciHtml}<div class="inci__panel" data-inci-panel hidden></div></div><p class="muted small">Elenco in ordine decrescente di quantità. ${nat}, calcolato secondo la norma ISO 16128.</p>`)}
      ${acc('Conservazione e PAO', `<p>${esc(p.keep)}</p><p><strong>PAO ${p.pao}:</strong> ${paoText}</p>`)}
      ${acc('Persona responsabile', `<p>${esc(D.SELLER)}.</p>`)}
      ${acc('Domande', p.faq.map(f => `<p><strong>${esc(f.q)}</strong><br>${esc(f.a)}</p>`).join(''))}
    </div>
  </div>
</section>
<section class="sec wrap">
  <div class="sec-head"><h2>Si abbina con</h2></div>
  <div class="grid grid--3">${p.pairs.map(id => card(BY[id])).join('\n')}</div>
</section>`
  });
}
function dettaglio(p) {
  return {
    'crema-iris': 'La crema aperta nel vasetto di vetro satinato con tappo dorato, superficie liscia, un petalo di iris accanto',
    'siero-vinacce': 'Una goccia di siero dal contagocce, colore chiaro e limpido, grappolo d\'uva sfocato sullo sfondo',
    'scrub-marmo': 'La texture dello scrub: polvere di marmo bianca negli oli, su un cucchiaio di legno',
    'olio-lavanda': 'Una goccia d\'olio sul polso, spighe di lavanda',
    'balsamo-labbra': 'Il vasetto di vetro satinato aperto, superficie liscia del balsamo',
    'crema-mani': 'Un po\' di crema sul dorso della mano',
    'sapone-calendula': 'Il taglio del sapone, con i petali di calendula',
    'sapone-argilla': 'Il colore verde del sapone, in controluce, con un rametto di rosmarino',
    'shampoo-rosmarino': 'La schiuma tra le mani',
    'cofanetto-bottega': 'L\'interno della scatola, carta velina e biglietto scritto a mano'
  }[p.id];
}

// ---------- RITUALE ----------
curPage = 'rituale.html';
{
  const q = (n, name, title, opts) => `<fieldset class="quiz__q" data-quiz-q="${name}"${n > 1 ? ' hidden' : ''}>
  <legend><span class="roman">${['', 'I', 'II', 'III'][n]}</span>${title}</legend>
  <div class="quiz__opts">${opts.map(([v, t, s]) => `<button type="button" class="quiz__opt" data-quiz-value="${v}"><strong>${t}</strong>${s ? `<span>${s}</span>` : ''}</button>`).join('')}</div>
</fieldset>`;
  page({
    file: 'rituale.html', active: 'rituale.html', title: 'Componi il tuo rituale · Michelangelo Beauty',
    description: 'Tre domande sulla tua pelle e sulle tue abitudini: ti proponiamo due o tre opere della bottega, con il perché di ogni scelta.',
    body: `
<section class="page-head wrap page-head--split">
  <div>
    <p class="eyebrow">Il tuo rituale</p>
    <h1>Tre domande, due o tre opere.</h1>
    <p class="lead">Rispondi toccando un bottone. Alla fine ti diciamo cosa usare e perché: niente account, niente email.</p>
  </div>
  ${drawing('dw-iris', 'Un fiore di iris con le foglie, studio botanico a sanguigna', 'page-head__dw')}
</section>
<section class="wrap quiz" data-quiz>
  <ol class="quiz__steps" aria-label="Avanzamento"><li data-quiz-step="1" aria-current="step">La tua pelle</li><li data-quiz-step="2">Quando</li><li data-quiz-step="3">Cosa ti interessa</li></ol>
  ${q(1, 'pelle', 'Che pelle hai?', [['Secca', 'Secca', 'tira, a volte si squama'], ['Sensibile', 'Sensibile', 'si arrossa facilmente'], ['Mista o grassa', 'Mista o grassa', 'lucida in zona T']])}
  ${q(2, 'momento', 'Quando ti prendi cura di te?', [['mattina', 'La mattina', 'pochi minuti, prima di uscire'], ['sera', 'La sera', 'con calma, prima di dormire'], ['entrambi', 'Mattina e sera', 'due momenti brevi']])}
  ${q(3, 'zona', 'Cosa ti interessa di più?', [['viso', 'Il viso'], ['corpo', 'Il corpo'], ['mani-labbra', 'Mani e labbra'], ['capelli', 'I capelli']])}
  <button type="button" class="link quiz__back" data-quiz-back hidden>← Torna alla domanda precedente</button>
  <div class="quiz__result" data-quiz-result hidden tabindex="-1"></div>
</section>`
  });
}

// ---------- LOTTO ----------
curPage = 'lotto.html';
page({
  file: 'lotto.html', active: 'lotto.html', title: 'Traccia il tuo lotto · Michelangelo Beauty',
  description: 'Inserisci il numero di lotto stampato sulla confezione: data di produzione, chi l\'ha fatto e da dove arrivano gli ingredienti.',
  body: `
<section class="page-head wrap page-head--split">
  <div>
    <p class="eyebrow">Traccia il tuo lotto</p>
    <h1>Ogni opera ha una storia. Ecco la tua.</h1>
    <p class="lead">Il numero di lotto è stampato sul fondo della confezione, accanto al simbolo del PAO. Inizia con MB.</p>
  </div>
  ${drawing('dw-ramo-ulivo', 'Un ramo d\'ulivo con le olive, studio a sanguigna', 'page-head__dw')}
</section>
<section class="wrap lot">
  <form class="lot-form" data-lot-form>
    <label for="lotto">Numero di lotto</label>
    <div class="lot-form__row"><input id="lotto" name="lotto" type="text" autocomplete="off" placeholder="MB-26-118" required><button class="btn btn--primary" type="submit">Cerca</button></div>
    <p class="small muted">Prova con un lotto di esempio: ${Object.keys(D.LOTS).slice(0, 3).map(c => `<button type="button" class="link" data-lot-try="${c}">${c}</button>`).join(', ')}</p>
  </form>
  <div class="lot__result" data-lot-result aria-live="polite" tabindex="-1"></div>
</section>`
});

// ---------- LA BOTTEGA ----------
curPage = 'bottega.html';
page({
  file: 'bottega.html', active: 'bottega.html', title: 'La bottega · Michelangelo Beauty',
  description: 'Chi siamo: due artigiani tra Firenze e le Apuane, ricette scritte a mano, lotti numerati. Perché ci chiamiamo Michelangelo.',
  body: `
<section class="hero hero--page">
  <div class="hero__media">${photo('bottega-apertura', '16:9', 'L\'interno della bottega: banco di marmo, scaffali di castagno con i saponi in stagionatura, finestra sulle colline', { eager: true, sizes: '100vw' })}</div>
  <div class="hero__text wrap"><div>
    <p class="eyebrow">La bottega</p>
    <h1>Una stanza di pietra, un banco di marmo, due paia di mani.</h1>
  </div></div>
</section>
<section class="sec wrap prose">
  ${sectionHead('I', 'Perché Michelangelo')}
  <p class="lead">Ci chiamiamo così perché lavoriamo la materia a mano, come in una bottega toscana: si sceglie il materiale giusto, si toglie il superfluo, si dà il tempo che serve.</p>
  <p>È un omaggio a un modo di lavorare, non a una persona: non abbiamo alcun legame con l'artista, con i suoi eredi o con i musei che custodiscono le sue opere. Le nostre "opere" sono saponi, creme e oli, e ognuna ha un numero, come in un catalogo.</p>
</section>
<section class="sec wrap split split--rev">
  <div class="split__media">${photo('bottega-territorio', '16:9', 'Colline toscane con ulivi in primo piano e le cave di marmo delle Apuane bianche sullo sfondo, luce del tardo pomeriggio')}</div>
  <div class="split__text">
    <p class="roman">II</p>
    <h2>La materia viene da qui intorno</h2>
    <p>L'olio extravergine da un frantoio della Lucchesia. Le radici di iris da un campo del Chianti. La cera d'api dalla Garfagnana. La polvere di marmo dai laboratori di scultura delle Apuane, dove il marmo bianco si lavora da secoli.</p>
  </div>
</section>
<section class="sec wrap">
  ${sectionHead('III', 'Come nasce un lotto')}
  <ol class="steps">${D.STEPS.map(([t, x], i) => `<li class="step">${photo('lotto-passo-' + (i + 1), '4:5', stepDesc(i), { sizes: '(max-width: 700px) 100vw, 20vw' })}<p class="roman">${['I', 'II', 'III', 'IV', 'V'][i]}</p><h3>${t}</h3><p>${x}</p></li>`).join('')}</ol>
</section>
<section class="sec wrap">
  ${sectionHead('IV', 'Chi siamo')}
  <div class="people">${D.PEOPLE.map(p => `<article class="person">${photo('persona-' + p.id, '4:5', p.id === 'livia' ? 'Ritratto di Livia al banco, camice di lino, flaconi di vetro ambrato dietro di lei' : 'Ritratto di Tommaso tra gli scaffali di castagno dei saponi, grembiule di tela', { sizes: '(max-width: 700px) 100vw, 50vw' })}<h3>${p.name}</h3><p class="person__role">${p.role}</p><p>${p.text}</p></article>`).join('')}</div>
</section>`
});
function stepDesc(i) {
  return ['Cesto di vimini con fiori di calendula e rametti di lavanda appena raccolti', 'Barattoli di vetro con fiori in olio d\'oliva su un davanzale di pietra', 'Bilancia di precisione e becher sul banco di marmo, mani con guanti', 'Scaffale di castagno con file di saponi a stagionare', 'Mani che applicano l\'etichetta MICHELANGELO su un vasetto di vetro ambrato'][i];
}

// ---------- SPEDIZIONI E RESI ----------
curPage = 'spedizioni-resi.html';
page({
  file: 'spedizioni-resi.html', title: 'Spedizioni e resi · Michelangelo Beauty',
  description: 'Costi e tempi di spedizione, soglia gratuita da 49 €, diritto di recesso entro 14 giorni.',
  body: `
<section class="page-head wrap"><p class="eyebrow">Aiuto</p><h1>Spedizioni e resi</h1></section>
<section class="wrap prose">
  <div class="prose__media">${photo('spedizioni-pacco', '16:9', 'Pacco in carta kraft con etichetta MICHELANGELO e nastro di cotone, sul tavolo delle spedizioni')}</div>
  <h2>Costi e tempi</h2>
  <table class="table"><thead><tr><th>Servizio</th><th>Costo</th><th>Consegna</th></tr></thead><tbody>
    <tr><td>Standard</td><td>4,90 € · gratuita da 49 €</td><td>2-4 giorni lavorativi</td></tr>
    <tr><td>Espressa</td><td>8,90 €</td><td>1-2 giorni lavorativi</td></tr>
  </tbody></table>
  <p>Spediamo solo in Italia. Prepariamo i pacchi dal lunedì al venerdì: gli ordini arrivati entro le 12 partono in giornata. Nel carrello e al pagamento vedi la data di consegna stimata.</p>
  <h2>Diritto di recesso: 14 giorni</h2>
  <p>Puoi restituire i prodotti entro 14 giorni dalla consegna, senza spiegarci il motivo. Scrivici a ${D.EMAIL} con il numero d'ordine: ti rispondiamo con le istruzioni. Rimborsiamo il prezzo dei prodotti entro 14 giorni dal recesso; le spese per rispedirci il pacco sono a tuo carico.</p>
  <p>Per motivi igienici non possiamo accettare i prodotti sigillati che sono stati aperti dopo la consegna (Codice del Consumo, art. 59).</p>
  <h2>Pacco danneggiato o prodotto non conforme</h2>
  <p>Se il pacco arriva rovinato o un prodotto non è quello che hai ordinato, mandaci una foto entro 14 giorni: lo sostituiamo o ti rimborsiamo, senza costi per te. Tutti i prodotti hanno la garanzia legale di conformità di 24 mesi.</p>
</section>`
});

// ---------- DOMANDE E CONTATTI ----------
curPage = 'domande-contatti.html';
page({
  file: 'domande-contatti.html', title: 'Domande e contatti · Michelangelo Beauty',
  description: 'Le domande che ci fate più spesso e come scriverci: email, WhatsApp o modulo.',
  body: `
<section class="page-head wrap"><p class="eyebrow">Aiuto</p><h1>Domande e contatti</h1></section>
<section class="wrap faq-contact">
  <div class="faq">
    <h2>Domande frequenti</h2>
    ${D.FAQS.map(f => `<details class="acc"><summary>${esc(f.q)}<span class="acc__icon" aria-hidden="true"></span></summary><div class="acc__body"><p>${f.a.replace('"Componi il tuo rituale"', '<a href="rituale.html">Componi il tuo rituale</a>').replace('"Traccia il tuo lotto"', '<a href="lotto.html">Traccia il tuo lotto</a>')}</p></div></details>`).join('\n')}
  </div>
  <div class="contact">
    <h2>Scrivici</h2>
    <p>Rispondiamo noi due, di solito entro un giorno lavorativo.</p>
    <p class="contact__lines"><a class="btn btn--ghost" href="https://wa.me/0000000000" rel="nofollow">${ICON.wa} WhatsApp (numero di fantasia)</a><br><a class="link" href="mailto:${D.EMAIL}">${D.EMAIL}</a></p>
    <form class="contact-form" data-demo-form novalidate>
      <label for="c-nome">Nome</label><input id="c-nome" type="text" autocomplete="name" required>
      <label for="c-email">Email</label><input id="c-email" type="email" autocomplete="email" required>
      <label for="c-lotto">Numero d'ordine o di lotto (facoltativo)</label><input id="c-lotto" type="text">
      <label for="c-msg">Messaggio</label><textarea id="c-msg" rows="5" required></textarea>
      <button class="btn btn--primary" type="submit">Invia</button>
      <p class="form-msg" data-form-msg hidden>Grazie! Sito dimostrativo: il messaggio non viene inviato davvero.</p>
    </form>
  </div>
</section>`
});

// ---------- PAGAMENTO ----------
curPage = 'pagamento.html';
{
  const F = [['email', 'Email', 'email', 'email', 'email', 'full'], ['nome', 'Nome', 'text', 'given-name', 'text', ''], ['cognome', 'Cognome', 'text', 'family-name', 'text', ''], ['indirizzo', 'Via e numero civico', 'text', 'address-line1', 'text', 'full'], ['cap', 'CAP', 'text', 'postal-code', 'numeric', ''], ['citta', 'Città', 'text', 'address-level2', 'text', ''], ['provincia', 'Provincia (sigla)', 'text', 'address-level1', 'text', ''], ['telefono', 'Telefono per il corriere (facoltativo)', 'tel', 'tel', 'tel', '']];
  page({
    file: 'pagamento.html', title: 'Pagamento · Michelangelo Beauty', description: 'Pagamento simulato: sito dimostrativo, nessun ordine viene inviato.', cls: 'is-checkout',
    body: `
<section class="wrap checkout" data-checkout>
  <p class="demo-note"><strong>Sito dimostrativo:</strong> nessun ordine viene inviato e nessun pagamento addebitato.</p>
  <ol class="co-steps" aria-label="Passaggi"><li data-co-step="1" aria-current="step"><span>1</span>Dati e indirizzo</li><li data-co-step="2"><span>2</span>Spedizione</li><li data-co-step="3"><span>3</span>Pagamento</li><li data-co-step="4"><span>✓</span>Conferma</li></ol>
  <div class="co-grid">
    <div class="co-main">
      <div class="co-empty" data-co-empty hidden><h1>Il carrello è vuoto</h1><p>Aggiungi qualche opera prima di passare al pagamento.</p><a class="btn btn--primary" href="opere.html">Vai alle opere</a></div>
      <form class="co-panel" data-co-panel="1" novalidate>
        <h1>Dati e indirizzo</h1>
        <div class="guest"><strong>Acquista senza registrarti</strong><span>Ti basta un'email per ricevere conferma e tracciamento.</span><button type="button" class="link" data-login-toggle aria-expanded="false">Hai già un account?</button><p class="small muted" data-login-note hidden>In questo sito dimostrativo non ci sono account: continua come ospite.</p></div>
        <div class="fields">${F.map(([k, l, t, a, m, s]) => `<div class="field${s ? ' field--full' : ''}"><label for="f-${k}">${l}</label><input id="f-${k}" name="${k}" type="${t}" autocomplete="${a}" inputmode="${m}"${k === 'telefono' ? '' : ' required'}><p class="field__err" id="err-${k}" hidden></p></div>`).join('')}</div>
        <div class="co-nav"><a class="link" href="opere.html" data-co-cart>← Torna al carrello</a><button class="btn btn--primary" type="submit">Continua: spedizione</button></div>
      </form>
      <div class="co-panel" data-co-panel="2" hidden>
        <h1>Spedizione</h1>
        <p class="co-address" data-co-address></p>
        <div class="radios" role="radiogroup" aria-label="Metodo di spedizione">
          <label class="radio"><input type="radio" name="ship" value="standard" checked><span><strong>Standard</strong> · <span data-ship-std>4,90 €</span><br><span class="muted">Arriva <span data-delivery>in 2-4 giorni lavorativi</span></span></span></label>
          <label class="radio"><input type="radio" name="ship" value="express"><span><strong>Espressa</strong> · 8,90 €<br><span class="muted">Arriva <span data-delivery-exp>in 1-2 giorni lavorativi</span></span></span></label>
        </div>
        <div class="co-nav"><button type="button" class="link" data-co-back>← Indietro</button><button class="btn btn--primary" type="button" data-co-next>Continua: pagamento</button></div>
      </div>
      <div class="co-panel" data-co-panel="3" hidden>
        <h1>Pagamento</h1>
        <div class="radios" role="radiogroup" aria-label="Metodo di pagamento">
          <label class="radio"><input type="radio" name="pay" value="carta" checked><span><strong>Carta di credito o debito</strong><br><span class="muted">In un negozio vero qui si aprirebbe la pagina sicura del fornitore di pagamento. In questa demo non si inseriscono dati della carta.</span></span></label>
          <label class="radio"><input type="radio" name="pay" value="bonifico"><span><strong>Bonifico bancario</strong><br><span class="muted">Prepariamo l'ordine quando riceviamo il bonifico.</span></span></label>
        </div>
        <p class="small muted">Confermando accetti le <a href="condizioni-vendita.html">condizioni di vendita</a>. Hai 14 giorni per il recesso.</p>
        <div class="co-nav"><button type="button" class="link" data-co-back>← Indietro</button><button class="btn btn--primary" type="button" data-co-place>Conferma l'ordine (simulato)</button></div>
      </div>
      <div class="co-panel co-done" data-co-panel="4" hidden tabindex="-1">
        ${drawing('dw-mani-pacco', 'Due mani che chiudono un pacco con un nastro, tratto a sanguigna', 'done__dw')}
        <h1>Grazie, ordine simulato ricevuto</h1>
        <p data-co-done-text></p>
        <a class="btn btn--ghost" href="opere.html">Torna alle opere</a>
      </div>
    </div>
    <aside class="co-summary" aria-label="Riepilogo ordine"><h2>Riepilogo</h2><div data-co-summary></div></aside>
  </div>
</section>`
  });
}

// ---------- LEGALI ----------
for (const [file, L] of Object.entries(D.LEGAL)) {
  curPage = file + '.html';
  page({
    file: file + '.html', title: L.title + ' · Michelangelo Beauty', description: L.title + ' del sito dimostrativo Michelangelo Beauty.',
    body: `<section class="page-head wrap"><p class="eyebrow">Legale</p><h1>${L.title}</h1><p class="lead">Testo d'esempio per un sito dimostrativo: un negozio vero lo fa verificare da un professionista.</p></section>
<section class="wrap prose">${L.sections.map(([h, p]) => `<h2>${h}</h2><p>${esc(p)}</p>`).join('\n')}</section>`
  });
}

// ---------- 404 ----------
curPage = '404.html';
page({
  file: '404.html', title: 'Pagina non trovata · Michelangelo Beauty', description: 'La pagina che cerchi non esiste.',
  body: `<section class="page-head wrap notfound">${drawing('dw-scalpello', 'Uno scalpello e un mazzuolo da scultore appoggiati su un blocco di marmo, tratto a sanguigna', 'nf__dw')}<p class="eyebrow">Errore 404</p><h1>Questa pagina non è ancora uscita dal blocco di marmo.</h1><p class="lead">Forse il link è sbagliato. Riparti dalle opere.</p><a class="btn btn--primary" href="opere.html">Vai alle opere</a></section>`
});

// ---------- Dati per il browser ----------
const client = {
  FREE, STD, EXP, GIFT,
  LINES: Object.fromEntries(D.LINES.map(l => [l.id, { name: l.name, bg: l.bg, fg: l.fg }])),
  P: Object.fromEntries(D.P.map(p => [p.id, { name: p.name, opera: p.opera, line: p.line, size: p.size, price: p.price, skin: p.skin, pao: p.pao, url: slug(p), img: fs.existsSync(path.join(out, 'assets/foto/800/prodotto-' + p.id + '.webp')) ? 'assets/foto/800/prodotto-' + p.id + '.webp' : fs.existsSync(path.join(out, 'assets/foto/prodotto-' + p.id + '.webp')) ? 'assets/foto/prodotto-' + p.id + '.webp' : '' }])),
  GLOSS: D.GLOSS,
  LOTS: D.LOTS,
  PEOPLE: Object.fromEntries(D.PEOPLE.map(p => [p.id, p.name]))
};
fs.mkdirSync(path.join(out, 'js'), { recursive: true });
fs.writeFileSync(path.join(out, 'js/catalogo.js'), '// generato da _build/build.js — non modificare a mano\nwindow.MB = ' + JSON.stringify(client) + ';\n');

// ---------- Controlli ----------
const dup = Object.entries(photoUses).filter(([, pages]) => pages.length > 1);
if (dup.length) { console.error('FOTO DUPLICATE:', dup); process.exit(1); }
const missingGloss = [...new Set(D.P.flatMap(p => [p.inci || ''].concat((p.contents || []).filter(c => typeof c !== 'string').map(c => c.inci))).join(', ').split(', ').filter(Boolean))].filter(n => !D.GLOSS[n]);
if (missingGloss.length) { console.error('INCI senza spiegazione:', missingGloss); process.exit(1); }

// ---------- Elenco foto e disegni da generare ----------
const plist = Object.values(photoList);
const done = plist.filter(x => fs.existsSync(path.join(out, 'assets/foto', x.id + '.webp'))).length;
const dlist = Object.values(drawList);
const ddone = dlist.filter(x => fs.existsSync(path.join(out, 'assets/disegni', x.id + '.webp'))).length;
const md = `# Michelangelo Beauty — foto e disegni da generare
<!-- generato da _build/build.js: si aggiorna da solo a ogni build -->

Foto: **${done}/${plist.length}** presenti · Disegni: **${ddone}/${dlist.length}** presenti

## Regole per tutte le foto
- Luce naturale calda da finestra laterale, materiali veri: marmo bianco di Carrara, legno di castagno, vetro ambrato, lino, terracotta.
- Sulle etichette solo la scritta **MICHELANGELO** (oppure **MB**), oppure etichette senza testo. **Nessun'altra scritta**, parola o numero inventato (né su muri, fogli o confezioni).
- **Niente statue, affreschi o opere d'arte riconoscibili** (David, Sistina, Pietà…): sono beni culturali tutelati.
- Le foto prodotto (\`prodotto-*\`) tutte con lo stesso piano di marmo, la stessa luce e la stessa inquadratura, così la griglia è uniforme.
- Salvale in \`assets/foto/\` con il nome indicato e l'estensione \`.webp\` (se le generi in jpg/png, le converto io).

## Foto
| File | Proporzioni | Pixel consigliati | Cosa mostra | Dove |
|---|---|---|---|---|
${plist.map(x => `| \`${x.id}.webp\` | ${x.ratio} | ${RATIO[x.ratio][2]} | ${x.desc} | ${x.shared ? 'foto prodotto: card (negozio, home, abbinamenti, carrello) e prima foto della sua scheda' : [...x.pages].join(', ')} |`).join('\n')}

## Disegni a sanguigna
Stile: studio di bottega rinascimentale a gesso rosso (sanguigna), tratto vivo e sicuro, **disegni nuovi** (non copie di opere esistenti), su **fondo bianco pulito** (il bianco lo tolgo io in pagina, così il disegno si posa sul marmo). Formato quadrato 1600×1600 o verticale 4:5.

| File | Cosa mostra | Dove |
|---|---|---|
${dlist.map(x => `| \`${x.id}.webp\` | ${x.desc} | ${x.page} |`).join('\n')}
`;
fs.writeFileSync(path.join(out, 'ELENCO-FOTO.md'), md);
console.log(`foto ${done}/${plist.length}, disegni ${ddone}/${dlist.length} — ELENCO-FOTO.md aggiornato`);
