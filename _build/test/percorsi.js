const { chromium } = require('C:/Users/Claude FK/.claude/projects/hedonè progetto serio/node_modules/playwright');
const base = process.env.BASE || 'http://localhost:8991/';
const ok = (c, m) => { console.log((c ? 'OK  ' : 'ERR ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ width: 1366, height: 860, name: 'PC' }, { width: 375, height: 760, name: 'telefono', touch: true }]) {
    console.log('--- ' + vp.name);
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch });
    await ctx.addInitScript(() => { try { localStorage.setItem('mb-promo-dismiss', String(Date.now())); } catch (e) {} }); // popup già chiuso: si prova il resto
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    // scheda prodotto: quantità 2 + aggiungi
    await pg.goto(base + 'opera-crema-iris.html');
    ok(/arriva|tra /.test(await pg.textContent('[data-delivery]')), 'data di consegna calcolata: ' + await pg.textContent('[data-delivery]'));
    await pg.click('[data-qty-inc]');
    await pg.click('[data-add-qty]');
    await pg.waitForTimeout(400);
    ok(await pg.$eval('#carrello', d => d.classList.contains('is-open')), 'carrello si apre dopo Aggiungi');
    ok((await pg.textContent('[data-cart-count]')).trim() === '2', 'contatore = 2');
    ok(await pg.evaluate(() => getComputedStyle(document.documentElement).overflow === 'hidden'), 'scroll bloccato con carrello aperto');
    await pg.check('[data-gift]'); await pg.fill('[data-gift-msg]', 'Auguri!');
    ok((await pg.textContent('[data-cart-foot]')).includes('59,00'), 'totale con regalo 56 + 3, spedizione gratuita = 59: ' + (await pg.textContent('.totals__sum')).replace(/\s+/g, ' '));
    await pg.keyboard.press('Escape'); await pg.waitForTimeout(350);
    ok(!(await pg.$eval('#carrello', d => d.classList.contains('is-open'))), 'Esc chiude il carrello');
    ok(await pg.evaluate(() => getComputedStyle(document.documentElement).overflow !== 'hidden'), 'scroll sbloccato');
    // INCI leggibile
    await pg.click('summary:has-text("Ingredienti")');
    await pg.click('.inci__chip[data-inci-name="Iris Florentina Root Extract"]');
    const panel = await pg.$('.product [data-inci-panel]:not([hidden])');
    ok(!!panel && (await panel.textContent()).includes('radice di iris'), 'INCI: spiegazione iris');
    if (vp.touch) {
      ok(await panel.evaluate(p => p.classList.contains('is-sheet') && getComputedStyle(p).position === 'fixed'), 'INCI su telefono: pannello dal basso');
      await pg.click('[data-inci-close]'); await pg.waitForTimeout(100);
      ok(await pg.$eval('.product [data-inci-panel]', p => p.hidden), 'pannello si chiude');
    }
    // negozio con ?linea
    await pg.goto(base + 'opere.html?linea=saponi');
    ok((await pg.textContent('[data-shop-count]')).trim() === '2 opere', 'filtro linea da URL: ' + await pg.textContent('[data-shop-count]'));
    ok(!(await pg.isVisible('[data-shop-empty]')), 'messaggio "nessuna opera" nascosto quando ci sono risultati');
    await pg.click('[data-filter="pelle"][data-value="Sensibile"]');
    ok((await pg.textContent('[data-shop-count]')).trim() === '1 opera', 'filtro saponi + sensibile = 1');
    await pg.click('[data-filter="formato"][data-value="Crema"]');
    ok(await pg.isVisible('[data-shop-empty]'), 'nessun risultato: messaggio vuoto');
    await pg.click('[data-filter-reset]');
    ok((await pg.textContent('[data-shop-count]')).trim() === '10 opere', 'reset filtri');
    await pg.selectOption('[data-sort]', 'prezzo-asc');
    ok((await pg.$$eval('.card:not([hidden]) .card__name', e => e[0].textContent)).includes('Balsamo'), 'ordinamento per prezzo');
    // lotto
    await pg.goto(base + 'lotto.html');
    await pg.fill('#lotto', 'mb 26 097'); await pg.click('[data-lot-form] button[type=submit]');
    ok((await pg.textContent('[data-lot-result]')).includes('Scrub corpo al marmo'), 'lotto normalizzato e trovato');
    await pg.fill('#lotto', 'XX-1'); await pg.click('[data-lot-form] button[type=submit]');
    ok((await pg.textContent('[data-lot-result]')).includes('Non troviamo'), 'lotto inesistente gestito');
    await pg.goto(base + 'lotto.html?lotto=MB-26-118');
    ok((await pg.textContent('[data-lot-result]')).includes('Livia'), 'lotto da URL (dalla home)');
    // rituale
    await pg.goto(base + 'rituale.html');
    await pg.click('[data-quiz-q="pelle"] [data-quiz-value="Secca"]');
    await pg.click('[data-quiz-q="momento"] [data-quiz-value="sera"]');
    await pg.click('[data-quiz-q="zona"] [data-quiz-value="viso"]');
    const rit = await pg.textContent('[data-quiz-result]');
    ok(rit.includes('Siero viso alle vinacce') && rit.includes('Crema viso all'), 'rituale pelle secca/sera/viso');
    await pg.click('[data-ritual-add]'); await pg.waitForTimeout(350);
    ok((await pg.textContent('[data-cart-count]')).trim() === '5', 'rituale aggiunto (2 creme + 3 opere = 5 pezzi): ' + await pg.textContent('[data-cart-count]'));
    await pg.keyboard.press('Escape');
    // salva per dopo
    await pg.goto(base + 'opera-scrub-marmo.html');
    ok((await pg.textContent('.buy__price')).includes('110,00 €/l'), 'prezzo al litro scrub (22 € / 200 ml = 110 €/l)');
    ok((await pg.textContent('.buy__facts')).includes('Confezione regalo'), 'confezione regalo visibile nella scheda');
    ok(/parte (oggi|domani|lunedì)/.test(await pg.textContent('[data-cutoff]')), 'orario limite: ' + await pg.textContent('[data-cutoff]'));
    await pg.click('.save--inline');
    ok((await pg.getAttribute('.save--inline', 'aria-pressed')) === 'true', 'salva per dopo attivo');
    await pg.goto(base + 'salvati.html');
    ok((await pg.$$('[data-saved-grid] .card')).length === 1 && !(await pg.isVisible('[data-saved-empty]')), 'pagina salvati con 1 opera');
    await pg.click('[data-saved-grid] .save');
    ok(await pg.isVisible('[data-saved-empty]'), 'tolta: pagina salvati vuota');
    await pg.goto(base + 'opere.html');
    ok((await pg.textContent('.card .unit')).includes('/l') || (await pg.textContent('.card .unit')).includes('/kg'), 'prezzo unitario sulle card');
    // pagamento
    await pg.goto(base + 'pagamento.html');
    await pg.click('[data-co-panel="1"] button[type=submit]');
    ok(await pg.isVisible('#err-email'), 'validazione: errori mostrati');
    await pg.fill('#f-email', 'prova@esempio.it'); await pg.fill('#f-nome', 'Anna'); await pg.fill('#f-cognome', 'Rossi');
    await pg.fill('#f-indirizzo', 'Via Roma 1'); await pg.fill('#f-cap', '55100'); await pg.fill('#f-citta', 'Lucca'); await pg.fill('#f-provincia', 'lu');
    await pg.click('[data-co-panel="1"] button[type=submit]');
    ok(await pg.isVisible('[data-co-panel="2"]'), 'passo 2 spedizione');
    await pg.check('input[value=express]');
    await pg.check('input[name=sample][value=siero-vinacce]');
    ok((await pg.textContent('[data-co-summary]')).includes('Siero viso alle vinacce'), 'campione omaggio nel riepilogo');
    ok((await pg.textContent('[data-co-summary]')).includes('8,90'), 'riepilogo con espressa');
    await pg.click('[data-co-next]'); await pg.click('[data-co-place]');
    ok((await pg.textContent('[data-co-done-text]')).includes('MB-DEMO-') && (await pg.textContent('[data-co-done-text]')).includes('campione'), 'ordine simulato confermato, con campione');
    ok((await pg.textContent('[data-cart-count]')).trim() === '0', 'carrello svuotato');
    // newsletter
    await pg.goto(base + 'index.html');
    await pg.fill('#nl-email', 'x@y.it'); await pg.click('.nl-form button');
    ok(await pg.isVisible('.form-err'), 'newsletter senza consenso: errore');
    await pg.check('.nl-form input[type=checkbox]'); await pg.click('.nl-form button');
    ok(await pg.isVisible('[data-form-msg]'), 'newsletter ok');
    if (vp.touch) { await pg.click('[data-menu]'); ok(await pg.isVisible('#menu a[href="bottega.html"]'), 'menu telefono'); }
    ok(errs.length === 0, 'nessun errore JS ' + errs.join(' | '));
    await ctx.close();
  }
  await b.close();
})();
