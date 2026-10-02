const { chromium } = require('C:/Users/Claude FK/.claude/projects/hedonè progetto serio/node_modules/playwright');
const base = 'http://localhost:8991/';
const ok = (c, m) => { console.log((c ? 'OK  ' : 'ERR ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ width: 1366, height: 860, n: 'PC' }, { width: 375, height: 760, n: 'telefono' }]) {
    console.log('--- ' + vp.n);
    const ctx = await b.newContext({ viewport: vp }); const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto(base + 'index.html');
    ok(!(await pg.isVisible('[data-promo]')), 'popup non subito all\'ingresso');
    await pg.waitForTimeout(6500);
    ok(await pg.isVisible('[data-promo]'), 'popup dopo 6 secondi');
    ok(await pg.evaluate(() => document.activeElement.id === 'promo-email'), 'focus sul campo email');
    await pg.fill('#promo-email', 'anna@esempio.it'); await pg.click('[data-promo] button[type=submit]');
    ok(await pg.isVisible('[data-promo] .form-err'), 'senza consenso: errore');
    await pg.check('[data-promo] input[type=checkbox]'); await pg.click('[data-promo] button[type=submit]');
    ok(await pg.isVisible('[data-promo] [data-form-msg]'), 'iscrizione: messaggio di conferma');
    await pg.click('[data-promo] [data-form-msg] [data-promo-close]');
    ok(!(await pg.isVisible('[data-promo]')), 'popup chiuso');
    await pg.goto(base + 'opera-crema-iris.html'); await pg.click('[data-add-qty]'); await pg.waitForTimeout(400);
    const foot = (await pg.textContent('[data-cart-foot]')).replace(/\s+/g, ' ');
    ok(foot.includes('Sconto di benvenuto') && foot.includes('−2,80') && foot.includes('Totale30,10'), 'carrello: 28 € − 2,80 + 4,90 spedizione = 30,10 → ' + foot.slice(0, 160));
    await pg.goto(base + 'pagamento.html'); await pg.waitForTimeout(7000);
    ok(!(await pg.isVisible('[data-promo]')), 'nessun popup nel pagamento');
    ok((await pg.textContent('[data-co-summary]')).includes('−2,80'), 'sconto nel riepilogo del pagamento');
    await pg.fill('#f-email', 'anna@esempio.it'); await pg.fill('#f-nome', 'Anna'); await pg.fill('#f-cognome', 'Rossi'); await pg.fill('#f-indirizzo', 'Via Roma 1'); await pg.fill('#f-cap', '55100'); await pg.fill('#f-citta', 'Lucca'); await pg.fill('#f-provincia', 'LU');
    await pg.click('[data-co-panel="1"] button[type=submit]'); await pg.click('[data-co-next]'); await pg.click('[data-co-place]');
    ok((await pg.textContent('[data-co-done-text]')).includes('risparmiato 2,80'), 'conferma: sconto usato');
    await pg.goto(base + 'opera-crema-iris.html'); await pg.click('[data-add-qty]'); await pg.waitForTimeout(400);
    ok(!(await pg.textContent('[data-cart-foot]')).includes('Sconto di benvenuto'), 'secondo ordine: niente sconto');
    await pg.goto(base + 'index.html'); await pg.waitForTimeout(6500);
    ok(!(await pg.isVisible('[data-promo]')), 'già iscritto: niente popup');
    ok(errs.length === 0, 'nessun errore JS ' + errs.join(' | '));
    await ctx.close();
    // visitatore che dice "No grazie"
    const c2 = await b.newContext({ viewport: vp }); const p2 = await c2.newPage();
    await p2.goto(base + 'opere.html'); await p2.mouse.wheel(0, 3000); await p2.waitForTimeout(800);
    ok(await p2.isVisible('[data-promo]'), 'popup dopo lo scorrimento (prima dei 6 s)');
    await p2.click('.promo__no'); await p2.goto(base + 'index.html'); await p2.waitForTimeout(6500);
    ok(!(await p2.isVisible('[data-promo]')), '"No grazie": non ricompare');
    await c2.close();
  }
  await b.close();
})();
