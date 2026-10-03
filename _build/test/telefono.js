// Controllo su telefono e tablet con emulazione completa (schermo, tocco, user agent): iPhone 13, iPhone SE, Pixel 7, iPad
const pw = require('C:/Users/Claude FK/.claude/projects/hedonè progetto serio/node_modules/playwright');
const base = process.env.BASE || 'http://localhost:8991/';
const fs = require('fs'), path = require('path');
const pages = fs.readdirSync(path.join(__dirname, '..', '..')).filter(f => f.endsWith('.html'));
const ok = (c, m) => { if (!c) { console.log('ERR ' + m); process.exitCode = 1; } else if (process.env.V) console.log('OK  ' + m); return c; };
(async () => {
  const b = await pw.chromium.launch();
  let n = 0;
  for (const devName of ['iPhone 13', 'iPhone SE', 'Pixel 7', 'iPhone 13 landscape', 'iPad (gen 7)', 'iPad (gen 7) landscape']) {
    const dev = pw.devices[devName];
    // 1) ogni pagina: niente scroll laterale, niente immagini fuori dai margini o attaccate a un solo bordo
    const c = await b.newContext({ ...dev }); await c.addInitScript(() => { try { localStorage.setItem('mb-promo-dismiss', String(Date.now())); } catch (e) {} });
    const p = await c.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    for (const f of pages) {
      await p.goto(base + f); await p.waitForTimeout(250);
      const r = await p.evaluate(() => {
        const vw = document.documentElement.clientWidth, out = [];
        if (document.documentElement.scrollWidth > vw + 1) out.push('scroll laterale ' + document.documentElement.scrollWidth);
        document.querySelectorAll('main img, main .ph').forEach(el => {
          if (el.closest('.strip__track,.card,.pick,.extra,.line,.drop')) return; // dentro contenitori che scorrono o card
          const b = el.getBoundingClientRect(); if (!b.width) return;
          const l = Math.round(b.left), rr = Math.round(vw - b.right);
          if (l < -1 || rr < -1) out.push('immagine fuori schermo ' + l + '/' + rr + ' ' + (el.getAttribute('src') || '').split('/').pop());
          else if ((l === 0) !== (rr === 0) && Math.abs(l - rr) > 4) out.push('immagine attaccata a un solo bordo ' + l + '/' + rr + ' ' + (el.getAttribute('src') || '').split('/').pop());
        });
        return out;
      });
      ok(!r.length, devName + ' ' + f + ': ' + r.join(' · ')); n++;
    }
    ok(!errs.length, devName + ': errori JS ' + errs.join(' | '));
    await c.close();
    // 2) menu (solo dove c'è il pulsante Menu) + popup che non deve coprirlo + carrello
    const c2 = await b.newContext({ ...dev }); const q = await c2.newPage(); const errs2 = []; q.on('pageerror', e => errs2.push(e.message));
    await q.goto(base + 'index.html'); await q.waitForTimeout(300);
    if (await q.isVisible('[data-menu]')) {
      for (let k = 0; k < 3; k++) {
        await q.tap('[data-menu]'); await q.waitForTimeout(250);
        ok(await q.isVisible('#menu'), devName + ': menu aperto (giro ' + (k + 1) + ')');
        if (k === 0) { await q.waitForTimeout(2500); ok(!(await q.isVisible('[data-promo]')), devName + ': il popup non compare sopra il menu aperto'); }
        await q.tap('[data-menu]', { timeout: 4000 }); await q.waitForTimeout(250);
        ok(!(await q.isVisible('#menu')), devName + ': menu chiuso (giro ' + (k + 1) + ')');
      }
      ok(await q.evaluate(() => getComputedStyle(document.documentElement).overflow !== 'hidden') || await q.isVisible('[data-promo]'), devName + ': scroll sbloccato dopo il menu');
      await q.waitForTimeout(2000);
      ok(await q.isVisible('[data-promo]'), devName + ': il popup compare dopo che il menu è stato chiuso');
      await q.tap('.promo__no'); await q.waitForTimeout(300);
      ok(await q.evaluate(() => getComputedStyle(document.documentElement).overflow !== 'hidden'), devName + ': scroll sbloccato dopo il popup');
      // menu aperto a metà pagina e in fondo: l'header (sticky) deve restare in cima allo schermo e il menu visibile.
      // Tocco a coordinate (q.tap ricentra il pulsante e sposta la pagina). Bug reale 2026-10-03: overflow:hidden sul body
      // agganciava l'header al body → tornava in cima al documento e il menu "spariva"
      for (const pos of [0.5, 1]) {
        await q.evaluate(x => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * x), pos); await q.waitForTimeout(150);
        const tapMenu = async () => { const bb = await (await q.$('[data-menu]')).boundingBox(); await q.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await q.waitForTimeout(250); };
        const y0 = await q.evaluate(() => scrollY);
        await tapMenu();
        const r = await q.evaluate(() => ({ h: document.querySelector('.site-header').getBoundingClientRect().top, m: document.querySelector('#menu').getBoundingClientRect().top }));
        ok(Math.abs(r.h) <= 1 && r.m > 0, devName + ': menu aperto al ' + pos * 100 + '% della pagina resta sullo schermo (header ' + Math.round(r.h) + ')');
        await tapMenu();
        ok(Math.abs(await q.evaluate(() => scrollY) - y0) <= 2, devName + ': chiudendo il menu la pagina resta dov\'era');
      }
      await q.evaluate(() => window.scrollTo(0, 0)); await q.waitForTimeout(150);
      // un link del menu porta davvero alla pagina
      await q.tap('[data-menu]'); await q.waitForTimeout(250); await Promise.all([q.waitForURL(/bottega.html/, { timeout: 8000 }).catch(() => {}), q.tap('#menu .menu__main a[href="bottega.html"]')]);
      ok(q.url().endsWith('bottega.html'), devName + ': link del menu funziona');
    } else {
      await q.waitForTimeout(2000); if (await q.isVisible('[data-promo]')) await q.click('.promo__no');
      await q.hover('.nav__drop > a'); await q.waitForTimeout(300);
      ok(await q.isVisible('#drop-opere'), devName + ': tendina Le opere visibile');
    }
    await q.goto(base + 'opera-crema-iris.html'); await q.waitForTimeout(300);
    await q.tap('[data-add-qty]'); await q.waitForTimeout(400);
    ok(await q.$eval('#carrello', d => d.classList.contains('is-open')), devName + ': carrello aperto dopo Aggiungi');
    await q.tap('[data-cart-close]'); await q.waitForTimeout(400);
    ok(!(await q.$eval('#carrello', d => d.classList.contains('is-open'))) && await q.evaluate(() => getComputedStyle(document.documentElement).overflow !== 'hidden'), devName + ': carrello chiuso e scroll sbloccato');
    ok(!errs2.length, devName + ': errori JS (menu/carrello) ' + errs2.join(' | '));
    await c2.close();
  }
  console.log('pagine controllate: ' + n + (process.exitCode ? ' — CI SONO PROBLEMI' : ' — tutto ok'));
  await b.close();
})();
