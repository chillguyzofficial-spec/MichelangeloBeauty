/* Michelangelo Beauty — carrello, INCI leggibile, lotto, rituale, negozio, pagamento simulato */
(function () {
  'use strict';
  const MB = window.MB;
  const q = (s, r = document) => r.querySelector(s);
  const qa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const eur = n => n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+,)/, '.') + ' €'; // 1.066,67 €
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const mobile = () => window.matchMedia('(max-width: 700px)').matches;

  // ---------- memoria del browser (può non essere disponibile: il sito funziona lo stesso) ----------
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* niente */ } }
  };
  let cart = store.get('mb-cart', []).filter(l => MB.P[l.id] && l.qty > 0);
  let gift = store.get('mb-gift', { on: false, msg: '' });
  const save = () => { store.set('mb-cart', cart); store.set('mb-gift', gift); };
  const subtotal = () => cart.reduce((a, l) => a + MB.P[l.id].price * l.qty, 0);
  const count = () => cart.reduce((a, l) => a + l.qty, 0);
  const giftCost = () => (gift.on && cart.length ? MB.GIFT : 0);
  let shipPref = store.get('mb-ship', 'standard'); // standard | express, scelta nel carrello e al pagamento
  // sconto di benvenuto: 10% sui prodotti del primo ordine, attivo da solo dopo l'iscrizione alla newsletter
  let promo = store.get('mb-promo', null); // { email, used }
  const promoOn = () => !!(promo && !promo.used);
  const discount = () => (promoOn() && cart.length ? Math.round(subtotal() * 10) / 100 : 0);
  const itemsTotal = () => subtotal() - discount(); // vale anche per la soglia della spedizione gratuita

  // ---------- date di consegna ----------
  const DAYS = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  const DAYS_LONG = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  const MONTHS = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
  const isBiz = d => d.getDay() !== 0 && d.getDay() !== 6;
  function shipDay() { const x = new Date(); if (isBiz(x) && x.getHours() < 12) return x; do { x.setDate(x.getDate() + 1); } while (!isBiz(x)); return x; }
  function addBiz(n) { const x = shipDay(); let k = 0; while (k < n) { x.setDate(x.getDate() + 1); if (isBiz(x)) k++; } return x; }
  function between(a, b) {
    const d1 = addBiz(a), d2 = addBiz(b), s = d => DAYS[d.getDay()] + ' ' + d.getDate();
    return 'tra ' + s(d1) + (d1.getMonth() !== d2.getMonth() ? ' ' + MONTHS[d1.getMonth()] : '') + ' e ' + s(d2) + ' ' + MONTHS[d2.getMonth()];
  }
  qa('[data-delivery]').forEach(el => { el.textContent = between(2, 4); });
  qa('[data-delivery-exp]').forEach(el => { el.textContent = between(1, 2); });

  // ---------- avviso breve ----------
  const toast = q('[data-toast]');
  let toastT;
  function say(msg, action, onAction) {
    if (!toast) return;
    toast.textContent = msg;
    if (action) { const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'toast__act'; bt.textContent = action; bt.addEventListener('click', () => { toast.classList.remove('is-on', 'has-act'); onAction(); }); toast.append(' · ', bt); }
    toast.classList.toggle('has-act', !!action); toast.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('is-on', 'has-act'), action ? 6000 : 2200);
  }

  // ---------- blocco dello scroll (overflow solo su html, mai position:fixed) ----------
  // NON mettere overflow:hidden anche sul body: diventerebbe un contenitore di scorrimento a sé,
  // l'header sticky si aggancerebbe al body e tornerebbe in cima alla pagina (menu sparito a metà pagina)
  let locks = 0;
  function lock(on) { locks = Math.max(0, locks + (on ? 1 : -1)); document.documentElement.style.overflow = locks ? 'hidden' : ''; }

  // ---------- menu telefono ----------
  const menuBtn = q('[data-menu]'), menu = q('#menu');
  if (menuBtn && menu) {
    const header = q('.site-header');
    const setMenu = open => {
      if (open) menu.style.setProperty('--menu-h', Math.max(200, window.innerHeight - header.getBoundingClientRect().bottom) + 'px'); // il pannello arriva esattamente in fondo allo schermo
      menuBtn.setAttribute('aria-expanded', String(open)); menu.hidden = !open; menuBtn.textContent = open ? 'Chiudi' : 'Menu';
      if (String(open) !== menu.dataset.locked) { lock(open); menu.dataset.locked = String(open); }
    };
    menu.dataset.locked = 'false';
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
    window.addEventListener('resize', () => { if (!menu.hidden && window.innerWidth >= 960) setMenu(false); });
  }

  // ---------- tendina "Le opere" (PC): si apre al passaggio, al clic sulla freccia e da tastiera ----------
  qa('[data-drop]').forEach(d => {
    const t = q('[data-drop-toggle]', d);
    t.addEventListener('click', () => { const o = !d.classList.contains('is-open'); d.classList.toggle('is-open', o); t.setAttribute('aria-expanded', String(o)); });
    d.addEventListener('mouseenter', () => t.setAttribute('aria-expanded', 'true'));
    d.addEventListener('mouseleave', () => { if (!d.classList.contains('is-open')) t.setAttribute('aria-expanded', 'false'); });
    document.addEventListener('click', e => { if (!d.contains(e.target)) { d.classList.remove('is-open'); t.setAttribute('aria-expanded', 'false'); } });
    d.addEventListener('keydown', e => { if (e.key === 'Escape') { d.classList.remove('is-open'); t.setAttribute('aria-expanded', 'false'); if (document.activeElement) document.activeElement.blur(); } });
  });

  // ---------- carrello ----------
  const drawer = q('#carrello'), overlay = q('[data-overlay]');
  const body = q('[data-cart-body]'), foot = q('[data-cart-foot]');
  let lastFocus = null;
  function thumb(p) {
    const l = MB.LINES[p.line];
    return `<a class="line__img" href="${p.url}" style="--line:${l.bg};--line-fg:${l.fg}" tabindex="-1" aria-hidden="true">${p.img ? `<img src="${p.img}" alt="" loading="lazy">` : `<span>${p.opera}</span>`}</a>`;
  }
  function renderCart() {
    qa('[data-cart-count]').forEach(el => { const n = count(); el.textContent = n; el.toggleAttribute('data-zero', n === 0); });
    const cb = q('[data-cart-open]'); if (cb) cb.setAttribute('aria-label', count() ? 'Apri il carrello, ' + count() + (count() === 1 ? ' prodotto' : ' prodotti') : 'Apri il carrello, vuoto');
    if (!body) return;
    if (!cart.length) {
      body.innerHTML = `<div class="cart-empty"><svg viewBox="0 0 120 120" aria-hidden="true"><path d="M30 46h60l-6 56H36z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M44 46c0-12 7-20 16-20s16 8 16 20" fill="none" stroke="currentColor" stroke-width="2"/></svg><p>Il carrello è vuoto.</p><a class="btn btn--ghost" href="opere.html">Guarda le opere</a></div>`;
      foot.innerHTML = '';
    } else {
      // in cima, così si vede subito anche con tanti prodotti (solo da 2 prodotti in su)
      body.innerHTML = (cart.length >= 2 ? `<div class="cart-clear"><span>${count()} ${count() === 1 ? 'pezzo' : 'pezzi'} nel carrello</span><button type="button" class="link" data-cart-clear>Svuota il carrello</button></div>` : '') + cart.map(l => { const p = MB.P[l.id], ln = MB.LINES[p.line]; return `<div class="line" data-line="${l.id}" style="--line:${ln.bg};--line-fg:${ln.fg}">${thumb(p)}<div><a class="line__name" href="${p.url}">${esc(p.name)}</a><p class="line__meta">Opera n. ${p.opera} · ${p.size} · ${eur(p.price)}</p><div class="line__row"><div class="qty"><button type="button" data-line-dec="${l.id}" aria-label="Diminuisci ${esc(p.name)}">−</button><span aria-live="polite">${l.qty}</span><button type="button" data-line-inc="${l.id}" aria-label="Aumenta ${esc(p.name)}">+</button></div><strong>${eur(p.price * l.qty)}</strong></div><button type="button" class="link line__rm" data-line-rm="${l.id}">Rimuovi</button></div></div>`; }).join('') +
        `<div class="gift"><label><input type="checkbox" data-gift ${gift.on ? 'checked' : ''}> <span><strong>Confezione regalo</strong> con biglietto scritto a mano (+${eur(MB.GIFT)})</span></label>${gift.on ? `<label for="gift-msg" class="sr">Messaggio del biglietto</label><textarea id="gift-msg" data-gift-msg maxlength="200" placeholder="Il tuo messaggio (lo scriviamo a mano)">${esc(gift.msg)}</textarea>` : ''}</div>` +
        `<fieldset class="cart-ship"><legend>Spedizione</legend>${[['standard', 'Standard', itemsTotal() >= MB.FREE ? 'Gratuita' : eur(MB.STD), between(2, 4)], ['express', 'Espressa', eur(MB.EXP), between(1, 2)]].map(([v, n, c, w]) => `<label class="radio radio--compact"><input type="radio" name="cart-ship" value="${v}"${shipPref === v ? ' checked' : ''} data-cart-ship><span><strong>${n}</strong> · ${c}<br><span class="muted">arriva ${w}</span></span></label>`).join('')}</fieldset>`;
      const sub = subtotal(), disc = discount(), net = sub - disc, ship = shipPref === 'express' ? MB.EXP : net >= MB.FREE ? 0 : MB.STD;
      const freeMsg = net >= MB.FREE ? 'Spedizione gratuita raggiunta.' : 'Ti mancano <strong>' + eur(MB.FREE - net) + '</strong> alla spedizione gratuita.';
      foot.innerHTML = `<div class="free">${freeMsg}<div class="free__bar"><span style="width:${Math.min(100, net / MB.FREE * 100)}%"></span></div></div>
        <div class="totals"><div><span>Subtotale</span><span>${eur(sub)}</span></div>${disc ? `<div class="totals__disc"><span>Sconto di benvenuto (10%)</span><span>−${eur(disc)}</span></div>` : ''}${gift.on ? `<div><span>Confezione regalo</span><span>${eur(MB.GIFT)}</span></div>` : ''}<div><span>Spedizione ${shipPref === 'express' ? 'espressa' : 'standard'}</span><span>${ship ? eur(ship) : 'Gratuita'}</span></div><div class="totals__sum"><span>Totale</span><span>${eur(net + ship + giftCost())}</span></div></div>
        <p class="small muted">Arriva ${shipPref === 'express' ? between(1, 2) : between(2, 4)} · reso entro 14 giorni · campione omaggio in ogni pacco</p>
        <a class="btn btn--primary" href="pagamento.html">Vai al pagamento</a>`;
    }
    updateShipLine();
  }
  function setQty(id, n) { cart = n <= 0 ? cart.filter(l => l.id !== id) : cart.map(l => (l.id === id ? { id, qty: Math.min(n, 20) } : l)); save(); renderCart(); renderSummary(); }
  function add(id, n, silent) {
    const i = cart.findIndex(l => l.id === id);
    if (i >= 0) cart[i] = { id, qty: Math.min(cart[i].qty + n, 20) }; else cart.push({ id, qty: n });
    save(); renderCart();
    if (!silent) {
      openCart();
      // il prodotto appena aggiunto deve vedersi anche se è in fondo alla lista
      const ln = body && q('[data-line="' + id + '"]', body);
      if (ln) body.scrollTop += ln.getBoundingClientRect().top - body.getBoundingClientRect().top - 8;
    }
  }
  function openCart() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    overlay.hidden = false; drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); lock(true);
    setTimeout(() => q('[data-cart-close]', drawer).focus(), 50);
  }
  function closeCart() {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); overlay.hidden = true; lock(false);
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-cart-open],[data-cart-close],[data-overlay],[data-add],[data-line-inc],[data-line-dec],[data-line-rm],[data-cart-clear]');
    if (!t) return;
    if (t.matches('[data-cart-open]')) openCart();
    else if (t.matches('[data-cart-close],[data-overlay]')) { closeCart(); closeSheet(); }
    else if (t.matches('[data-add]')) {
      const n = t.hasAttribute('data-add-qty') ? pqty : 1;
      add(t.dataset.add, n);
      if (t.hasAttribute('data-add-qty')) { pqty = 1; showQty(); }
    }
    else if (t.matches('[data-line-inc]')) { const l = cart.find(x => x.id === t.dataset.lineInc); setQty(l.id, l.qty + 1); }
    else if (t.matches('[data-line-dec]')) { const l = cart.find(x => x.id === t.dataset.lineDec); setQty(l.id, l.qty - 1); }
    else if (t.matches('[data-line-rm]')) { setQty(t.dataset.lineRm, 0); say('Rimosso dal carrello'); }
    else if (t.matches('[data-cart-clear]')) {
      const prevCart = cart.slice(), prevGift = Object.assign({}, gift);
      cart = []; gift = { on: false, msg: '' }; save(); renderCart(); renderSummary();
      const cl = q('[data-cart-close]'); if (cl) cl.focus();
      say('Carrello svuotato', 'Annulla', () => { cart = prevCart; gift = prevGift; save(); renderCart(); renderSummary(); say('Carrello ripristinato'); });
    }
  });
  document.addEventListener('change', e => {
    if (e.target.matches('[data-cart-ship]')) { shipPref = e.target.value; store.set('mb-ship', shipPref); renderCart(); const r = q('[data-cart-ship]:checked'); if (r) r.focus(); return; }
    if (e.target.matches('[data-gift]')) { gift.on = e.target.checked; save(); renderCart(); renderSummary(); const ta = q('[data-gift-msg]'); if (ta) ta.focus(); }
  });
  document.addEventListener('input', e => { if (e.target.matches('[data-gift-msg]')) { gift.msg = e.target.value; save(); } });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCart(); closeSheet(); }
    // il focus resta dentro il carrello aperto
    if (e.key === 'Tab' && drawer && drawer.classList.contains('is-open')) {
      const f = qa('a[href],button,input,textarea', drawer).filter(x => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // ---------- salva per dopo (senza account, nella memoria del browser) ----------
  let saved = store.get('mb-saved', []).filter(id => MB.P[id]);
  function renderSaved() {
    qa('[data-saved-count]').forEach(el => { el.textContent = saved.length; el.toggleAttribute('data-zero', !saved.length); });
    qa('[data-save]').forEach(b => {
      const on = saved.includes(b.dataset.save); b.setAttribute('aria-pressed', String(on));
      const lab = q('[data-save-label]', b); if (lab) lab.textContent = on ? 'Salvata: la trovi in Opere salvate' : 'Salva per dopo';
    });
    const grid = q('[data-saved-grid]');
    if (grid) {
      grid.innerHTML = saved.map(id => { const p = MB.P[id], l = MB.LINES[p.line]; return `<article class="card" style="--line:${l.bg};--line-fg:${l.fg}"><div class="card__mediawrap"><a class="card__media" href="${p.url}" tabindex="-1" aria-hidden="true">${p.img ? `<img class="ph-img" src="${p.img}" alt="" loading="lazy">` : ''}</a><button type="button" class="save" data-save="${id}" aria-pressed="true" aria-label="Togli ${esc(p.name)} dalle salvate"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 20s-7.5-4.6-9.2-9.3C1.6 7.3 3.9 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.3 0 5.6 3.3 4.4 6.7C19.5 15.4 12 20 12 20Z" fill="var(--heart-fill,none)" stroke="currentColor" stroke-width="1.6"/></svg></button></div><div class="card__band"><span>Opera n. ${p.opera}</span><span>${l.name}</span></div><div class="card__body"><h2 class="card__name"><a href="${p.url}">${esc(p.name)}</a></h2><p class="card__meta">${p.size} · <strong>${eur(p.price)}</strong><span class="unit">${p.unit}</span></p><button class="btn btn--add" type="button" data-add="${id}">Aggiungi <span class="sr">${esc(p.name)} al carrello</span></button></div></article>`; }).join('');
      q('[data-saved-empty]').hidden = saved.length > 0;
    }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-save]'); if (!b) return;
    const id = b.dataset.save, on = saved.includes(id);
    saved = on ? saved.filter(x => x !== id) : saved.concat(id); store.set('mb-saved', saved);
    renderSaved(); say(on ? 'Tolta dalle opere salvate' : 'Salvata: la trovi in Opere salvate');
  });
  renderSaved();

  // ---------- orario limite reale: ordini entro le 12 dei giorni feriali partono in giornata ----------
  qa('[data-cutoff]').forEach(el => {
    const now = new Date(), s = shipDay(), tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const when = s.toDateString() === now.toDateString() ? null : s.toDateString() === tomorrow.toDateString() ? 'domani' : DAYS_LONG[s.getDay()];
    el.textContent = when ? ' · se ordini ora, parte ' + when : ' · ordina entro le 12:00 e parte oggi';
  });

  // ---------- scheda prodotto: quantità e spedizione ----------
  let pqty = 1;
  const qtyVal = q('[data-qty-val]');
  function showQty() { if (qtyVal) qtyVal.textContent = pqty; updateShipLine(); }
  qa('[data-qty-inc]').forEach(b => b.addEventListener('click', () => { pqty = Math.min(pqty + 1, 20); showQty(); }));
  qa('[data-qty-dec]').forEach(b => b.addEventListener('click', () => { pqty = Math.max(pqty - 1, 1); showQty(); }));
  function updateShipLine() {
    const el = q('[data-ship-line]'); if (!el) return;
    const sub = itemsTotal(), after = sub + parseFloat(el.dataset.price) * pqty * (promoOn() ? 0.9 : 1);
    el.textContent = sub >= MB.FREE ? 'Spedizione gratuita: il carrello supera già i 49 €'
      : after >= MB.FREE ? 'Spedizione gratuita con questo acquisto (soglia 49 €)'
        : 'Spedizione 4,90 € · gratuita da 49 € (ti mancano ' + eur(MB.FREE - after) + ')';
  }

  // ---------- INCI leggibile ----------
  let sheetPanel = null;
  function closeSheet() {
    if (!sheetPanel) return;
    const p = sheetPanel; sheetPanel = null;
    p.hidden = true; p.classList.remove('is-sheet');
    const on = q('.inci__chip[aria-expanded="true"]', p.closest('[data-inci]'));
    if (on) { on.setAttribute('aria-expanded', 'false'); on.focus(); }
    if (overlay && !(drawer && drawer.classList.contains('is-open'))) overlay.hidden = true;
    lock(false);
  }
  qa('[data-inci]').forEach(box => {
    const panel = q('[data-inci-panel]', box);
    box.addEventListener('click', e => {
      const chip = e.target.closest('.inci__chip');
      if (e.target.closest('[data-inci-close]')) { closeSheet(); return; }
      if (!chip) return;
      const wasOpen = chip.getAttribute('aria-expanded') === 'true';
      qa('.inci__chip', box).forEach(c => c.setAttribute('aria-expanded', 'false'));
      if (sheetPanel) { sheetPanel.classList.remove('is-sheet'); sheetPanel = null; lock(false); if (overlay) overlay.hidden = true; }
      if (wasOpen) { panel.hidden = true; return; }
      const name = chip.dataset.inciName, g = MB.GLOSS[name] || [name, 'Ingrediente della formula.'];
      chip.setAttribute('aria-expanded', 'true');
      panel.innerHTML = `<button type="button" class="icon-btn inci__close" data-inci-close aria-label="Chiudi la spiegazione"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8"/></svg></button><h4>${esc(g[0])}</h4><p class="inci__latin">${esc(name)}</p><p>${esc(g[1])}</p>`;
      panel.hidden = false;
      if (mobile()) { panel.classList.add('is-sheet'); sheetPanel = panel; if (overlay) overlay.hidden = false; lock(true); }
    });
  });

  // ---------- negozio: filtri e ordinamento ----------
  const grid = q('[data-shop-grid]');
  if (grid) {
    const f = { linea: 'tutte', pelle: 'tutte', formato: 'tutti' };
    const params = new URLSearchParams(location.search);
    if (params.get('linea') && MB.LINES[params.get('linea')]) f.linea = params.get('linea');
    const cards = qa('.card', grid);
    function apply() {
      qa('[data-filter]').forEach(c => c.setAttribute('aria-pressed', String(f[c.dataset.filter] === c.dataset.value)));
      let n = 0;
      cards.forEach(c => {
        const ok = (f.linea === 'tutte' || c.dataset.line === f.linea) && (f.pelle === 'tutte' || c.dataset.skin.split('|').includes(f.pelle)) && (f.formato === 'tutti' || c.dataset.format === f.formato);
        c.hidden = !ok; if (ok) n++;
      });
      q('[data-shop-count]').textContent = n === 1 ? '1 opera' : n + ' opere';
      q('[data-shop-empty]').hidden = n > 0;
    }
    function sort(v) {
      const by = { 'prezzo-asc': (a, b) => a.dataset.price - b.dataset.price, 'prezzo-desc': (a, b) => b.dataset.price - a.dataset.price, nome: (a, b) => a.dataset.name.localeCompare(b.dataset.name, 'it'), evidenza: (a, b) => a.dataset.order - b.dataset.order }[v];
      cards.slice().sort(by).forEach(c => grid.appendChild(c));
    }
    qa('[data-filter]').forEach(c => c.addEventListener('click', () => {
      f[c.dataset.filter] = c.dataset.value; apply();
      if (c.dataset.filter === 'linea') { const u = new URL(location.href); if (f.linea === 'tutte') u.searchParams.delete('linea'); else u.searchParams.set('linea', f.linea); history.replaceState(null, '', u); }
    }));
    q('[data-sort]').addEventListener('change', e => sort(e.target.value));
    q('[data-filter-reset]').addEventListener('click', () => { f.linea = 'tutte'; f.pelle = 'tutte'; f.formato = 'tutti'; apply(); history.replaceState(null, '', location.pathname); });
    apply();
  }

  // ---------- traccia il lotto ----------
  const lotForm = q('[data-lot-form]');
  if (lotForm) {
    const input = q('input', lotForm), out = q('[data-lot-result]');
    const norm = v => { const d = (v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); const m = d.match(/^MB(\d{2})(\d{3})$/); return m ? 'MB-' + m[1] + '-' + m[2] : (v || '').trim().toUpperCase(); };
    function show(code, focus) {
      const L = MB.LOTS[code];
      if (!L) { out.innerHTML = `<div class="lot-none"><p><strong>Non troviamo il lotto ${esc(code)}.</strong></p><p>Controlla il numero sul fondo della confezione: ha la forma MB-26-118. Se è giusto, scrivici e lo cerchiamo nel registro.</p></div>`; }
      else {
        const p = MB.P[L.id];
        out.innerHTML = `<article class="lot-card" style="--line:${MB.LINES[p.line].bg}"><p class="lot-card__code">Lotto ${code}</p><h2>${esc(p.name)} · ${p.size}</h2><dl>
          <div><dt>Prodotto il</dt><dd>${L.date}${L.cure ? ', ' + L.cure : ''}</dd></div>
          <div><dt>Fatto da</dt><dd>${esc(MB.PEOPLE[L.maker.toLowerCase()] || L.maker)}</dd></div>
          <div><dt>Pezzi del lotto</dt><dd>${L.pieces}</dd></div>
          ${L.origin.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
          <div><dt>Da usare entro</dt><dd>${L.best} se chiuso · PAO ${p.pao} dopo l'apertura</dd></div>
        </dl><a class="btn btn--ghost" href="${p.url}">Vai all'opera n. ${p.opera}</a></article>`;
      }
      if (focus) out.focus();
    }
    lotForm.addEventListener('submit', e => { e.preventDefault(); const c = norm(input.value); input.value = c; show(c, true); history.replaceState(null, '', '?lotto=' + encodeURIComponent(c)); });
    qa('[data-lot-try]').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.lotTry; show(b.dataset.lotTry, true); }));
    const pre = new URLSearchParams(location.search).get('lotto');
    if (pre) { const c = norm(pre); input.value = c; show(c, false); }
  }

  // ---------- strisce di foto a scorrimento: frecce, contatore, tastiera ----------
  qa('[data-strip]').forEach(st => {
    const track = q('[data-strip-track]', st), items = qa('.strip__item', st), cnt = q('[data-strip-count]', st);
    const prev = q('[data-strip-prev]', st), next = q('[data-strip-next]', st);
    const current = () => { const x = track.scrollLeft; let best = 0; items.forEach((it, i) => { if (Math.abs(it.offsetLeft - track.offsetLeft - x) < Math.abs(items[best].offsetLeft - track.offsetLeft - x)) best = i; }); return best; };
    const update = () => { const i = current(), end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4; cnt.textContent = (end ? items.length : i + 1) + ' / ' + items.length; prev.disabled = track.scrollLeft <= 4; next.disabled = end; };
    const go = d => { const i = Math.max(0, Math.min(items.length - 1, current() + d)); track.scrollTo({ left: items[i].offsetLeft - track.offsetLeft, behavior: 'smooth' }); };
    prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } });
    track.addEventListener('scroll', () => { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update); update();
  });

  // ---------- il tuo rituale: 5 domande, poi il risultato si modifica (togli / aggiungi, senza limiti) ----------
  const quiz = q('[data-quiz]');
  if (quiz) {
    const order = ['pelle', 'momento', 'zona', 'profumo', 'per'];
    const ans = { zona: [] };
    const qs = qa('[data-quiz-q]', quiz), back = q('[data-quiz-back]', quiz), res = q('[data-quiz-result]', quiz), steps = qa('[data-quiz-step]', quiz);
    let cur = 0;
    // ordine d'uso: prima si deterge, poi si leviga, poi i trattamenti leggeri, poi quelli ricchi
    const USE = { 'sapone-calendula': 1, 'sapone-argilla': 1, 'shampoo-rosmarino': 1, 'scrub-marmo': 2, 'siero-vinacce': 3, 'crema-iris': 4, 'olio-lavanda': 4, 'crema-mani': 5, 'balsamo-labbra': 6, 'cofanetto-bottega': 7 };
    const SCENTED = ['olio-lavanda', 'scrub-marmo', 'sapone-argilla', 'shampoo-rosmarino'];
    const WHY = {
      'crema-iris': (a) => 'Idrata e lascia la pelle vellutata.' + (a.momento === 'sera' ? ' La sera, dopo il siero.' : ' Al mattino, un minuto prima del trucco.'),
      'siero-vinacce': (a) => 'Soli oli leggeri, da premere sul viso ancora umido.' + (a.momento === 'mattina' ? ' Al mattino bastano due gocce.' : ' È il gesto della sera.'),
      'sapone-calendula': () => 'Deterge delicatamente viso e corpo senza seccare la pelle. Non è profumato.',
      'sapone-argilla': () => 'L\'argilla verde assorbe il sebo in eccesso: per pelli miste e grasse. Profuma di rosmarino.',
      'scrub-marmo': () => 'Una o due volte a settimana sotto la doccia, per levigare il corpo. Profuma di limone.',
      'olio-lavanda': (a) => 'Dopo la doccia, su pelle umida: la lascia morbida' + (a.momento === 'mattina' ? ' e si assorbe in pochi minuti.' : ' e profumata prima di dormire.'),
      'crema-mani': () => 'Si assorbe in fretta: tienila vicino al lavandino. Non è profumata.',
      'balsamo-labbra': () => 'Il vasetto sta in borsa: protegge le labbra secche quando serve.',
      'shampoo-rosmarino': (a) => 'Lava con delicatezza i capelli che si ungono in fretta.' + (a.pelle === 'Mista o grassa' ? '' : ' Con cute secca, usalo a lavaggi alterni.'),
      'cofanetto-bottega': () => 'Quattro saponi in una scatola con biglietto scritto a mano: un regalo pronto.'
    };
    function suggest(a) {
      const dry = a.pelle !== 'Mista o grassa', noScent = a.profumo === 'no';
      const soap = dry || noScent ? 'sapone-calendula' : 'sapone-argilla';
      const out = [];
      a.zona.forEach(z => {
        if (z === 'viso') out.push(...(!dry ? [soap, 'siero-vinacce'] : a.momento === 'mattina' ? [soap, 'crema-iris'] : [soap, 'siero-vinacce', 'crema-iris']));
        if (z === 'corpo') out.push(soap, ...(a.pelle === 'Sensibile' ? [] : ['scrub-marmo']), 'olio-lavanda');
        if (z === 'mani-labbra') out.push('crema-mani', 'balsamo-labbra');
        if (z === 'capelli') out.push('shampoo-rosmarino');
      });
      let ids = [...new Set(out)];
      if (noScent) ids = ids.filter(id => !SCENTED.includes(id));
      return ids;
    }
    let chosen = [], giftOn = false, notes = [];
    function go(i) {
      cur = i;
      qs.forEach((f, k) => { f.hidden = k !== i; });
      steps.forEach((st, k) => { if (k === i) st.setAttribute('aria-current', 'step'); else st.removeAttribute('aria-current'); st.classList.toggle('is-done', k < i); });
      back.hidden = i === 0 || i >= qs.length; res.hidden = i < qs.length;
      if (i < qs.length && i > 0) { const bt = q('.quiz__opt', qs[i]); if (bt) bt.focus(); }
    }
    function renderResult() {
      const ord = chosen.slice().sort((x, y) => USE[x] - USE[y]);
      const others = Object.keys(MB.P).filter(id => !chosen.includes(id)).sort((x, y) => (ans.per === 'regalo' && x === 'cofanetto-bottega' ? -1 : 0) - (ans.per === 'regalo' && y === 'cofanetto-bottega' ? -1 : 0));
      const tot = ord.reduce((t, id) => t + MB.P[id].price, 0) + (giftOn && ord.length ? MB.GIFT : 0);
      const when = { mattina: 'la mattina', sera: 'la sera', entrambi: 'mattina e sera' }[ans.momento];
      const zones = ans.zona.length > 2 ? 'un po\' di tutto' : ans.zona.map(z => MB.LINES[z] ? MB.LINES[z].name.toLowerCase() : z).join(', ');
      res.innerHTML = `<p class="roman">Il tuo rituale</p><h2>Pelle ${ans.pelle.toLowerCase()}, ${when}: ${zones}.</h2>
        <p>${ord.length ? 'Ecco cosa ti proponiamo, nell\'ordine in cui usarlo. Togli quello che non ti serve, aggiungi quello che ti piace: anche per altre zone, qui sotto.' : 'Il rituale è vuoto: aggiungi le opere che ti interessano qui sotto.'}</p>
        ${notes.map(n => `<p class="quiz__note">${n}</p>`).join('')}
        <ol class="ritual">${ord.map((id, i) => { const p = MB.P[id]; return `<li style="--line:${MB.LINES[p.line].bg}"><span class="ritual__n">${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i]}</span><div><p class="ritual__name"><a href="${p.url}">${esc(p.name)}</a></p><p class="ritual__why">${esc((WHY[id] || (() => ''))(ans))}</p></div><div class="ritual__end"><span class="ritual__price">${eur(p.price)}</span><button type="button" class="link ritual__rm" data-rit-rm="${id}" aria-label="Togli ${esc(p.name)}">Togli</button></div></li>`; }).join('')}</ol>
        <label class="ritual__gift"><input type="checkbox" data-rit-gift${giftOn ? ' checked' : ''}> <span><strong>Confezione regalo</strong> con biglietto scritto a mano (+${eur(MB.GIFT)})</span></label>
        <div class="ritual-total"><button type="button" class="btn btn--primary" data-ritual-add${ord.length ? '' : ' disabled'}>Aggiungi il rituale al carrello · ${eur(tot)}</button><button type="button" class="link" data-quiz-restart>Ricomincia</button></div>
        <div class="extras"><h3>Aggiungi altro al tuo rituale</h3>
          <div class="extras__grid">${others.map(id => { const p = MB.P[id], l = MB.LINES[p.line]; return `<button type="button" class="extra" data-rit-add="${id}" style="--line:${l.bg};--line-fg:${l.fg}">${p.img ? `<img src="${p.img}" alt="" loading="lazy">` : '<span class="extra__ph"></span>'}<span class="extra__t">${ans.per === 'regalo' && id === 'cofanetto-bottega' ? '<em>Idea regalo</em>' : ''}${esc(p.name)}<small>${p.size} · ${eur(p.price)}</small></span><span class="extra__plus" aria-hidden="true">+</span><span class="sr">Aggiungi al rituale</span></button>`; }).join('')}</div>
        </div>`;
    }
    function result() {
      chosen = suggest(ans); giftOn = ans.per === 'regalo'; notes = [];
      if (ans.profumo === 'no') {
        const out = SCENTED.filter(id => (ans.zona.includes('corpo') && ['olio-lavanda', 'scrub-marmo'].includes(id)) || (ans.zona.includes('capelli') && id === 'shampoo-rosmarino'));
        if (out.length) notes.push('Hai scelto senza profumo: abbiamo tolto ' + out.map(id => MB.P[id].name.toLowerCase()).join(' e ') + '. Se vuoi, li trovi qui sotto.');
      }
      renderResult(); go(qs.length); res.focus();
    }
    // risposte singole: un tocco e si va avanti; la domanda "Cosa ti interessa" è a scelta multipla con "Continua"
    qs.forEach((f, i) => {
      const multi = f.hasAttribute('data-multi'), nextBtn = q('[data-quiz-next]', f);
      qa('.quiz__opt', f).forEach(bt => bt.addEventListener('click', () => {
        const v = bt.dataset.quizValue;
        if (multi) {
          ans.zona = ans.zona.includes(v) ? ans.zona.filter(x => x !== v) : ans.zona.concat(v);
          bt.setAttribute('aria-pressed', String(ans.zona.includes(v))); nextBtn.disabled = !ans.zona.length; return;
        }
        if (order[i] === 'zona') ans.zona = v === 'tutto' ? ['viso', 'corpo', 'mani-labbra'] : [v]; else ans[order[i]] = v;
        if (i < qs.length - 1) go(i + 1); else result();
      }));
      if (nextBtn) nextBtn.addEventListener('click', () => go(i + 1));
    });
    back.addEventListener('click', () => go(Math.max(0, cur - 1)));
    res.addEventListener('click', e => {
      const rm = e.target.closest('[data-rit-rm]'), ad = e.target.closest('[data-rit-add]');
      if (rm) { chosen = chosen.filter(id => id !== rm.dataset.ritRm); renderResult(); say('Tolta dal rituale'); }
      else if (ad) { chosen.push(ad.dataset.ritAdd); renderResult(); say('Aggiunta al rituale'); }
      else if (e.target.closest('[data-quiz-restart]')) { ans.zona = []; qa('[data-multi] .quiz__opt', quiz).forEach(x => x.setAttribute('aria-pressed', 'false')); qa('[data-quiz-next]', quiz).forEach(x => { x.disabled = true; }); go(0); }
      else if (e.target.closest('[data-ritual-add]')) {
        chosen.slice().sort((x, y) => USE[x] - USE[y]).forEach(id => add(id, 1, true));
        if (giftOn) { gift.on = true; save(); renderCart(); }
        openCart();
      }
    });
    res.addEventListener('change', e => { if (e.target.matches('[data-rit-gift]')) { giftOn = e.target.checked; renderResult(); const g = q('[data-rit-gift]', res); if (g) g.focus(); } });
  }

  // ---------- moduli dimostrativi (newsletter, contatti) ----------
  qa('[data-demo-form]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    const bad = qa('[required]', form).find(el => (el.type === 'checkbox' ? !el.checked : !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value))));
    let err = q('.form-err', form);
    if (bad) { if (!err) { err = document.createElement('p'); err.className = 'form-err'; err.setAttribute('role', 'alert'); form.appendChild(err); } err.textContent = bad.type === 'checkbox' ? 'Per iscriverti serve il consenso.' : bad.type === 'email' ? 'Inserisci un indirizzo email valido.' : 'Compila tutti i campi obbligatori.'; bad.focus(); return; }
    if (err) err.remove();
    if (form.hasAttribute('data-newsletter')) activatePromo(q('input[type=email]', form).value.trim());
    q('[data-form-msg]', form).hidden = false;
    qa('input,textarea,button:not([data-promo-close])', form).forEach(el => { el.disabled = true; });
  }));

  // ---------- iscrizione: attiva lo sconto (una sola volta, sul primo ordine) ----------
  function activatePromo(email) {
    if (!promo) { promo = { email, used: false }; store.set('mb-promo', promo); }
    renderCart(); renderSummary();
    say(promoOn() ? 'Sconto del 10% attivo nel carrello' : 'Iscrizione registrata');
  }

  // ---------- popup di benvenuto: dopo 1,5 secondi (pagina già disegnata) o a un terzo di pagina, mai in pagamento ----------
  const pop = q('[data-promo]');
  if (pop) {
    const WEEK = 7 * 24 * 3600 * 1000;
    const dismissed = store.get('mb-promo-dismiss', 0);
    const can = () => !promo && Date.now() - dismissed > WEEK && !document.body.classList.contains('is-checkout');
    // qualcosa è aperto (menu telefono, carrello, pannello INCI)? allora il popup aspetta
    const busy = () => (drawer && drawer.classList.contains('is-open')) || (menu && !menu.hidden) || !!sheetPanel || locks > 0;
    let shown = false, popLast = null, timer;
    function openPop() {
      if (shown || !can()) return;
      if (busy()) { clearTimeout(timer); timer = setTimeout(openPop, 1500); return; } // riprova quando l'utente ha chiuso
      shown = true;
      popLast = document.activeElement; pop.hidden = false; lock(true);
      requestAnimationFrame(() => pop.classList.add('is-open'));
      setTimeout(() => q('input[type=email]', pop).focus(), 60);
      window.removeEventListener('scroll', onScroll); clearTimeout(timer);
    }
    function closePop() {
      if (pop.hidden) return;
      pop.classList.remove('is-open'); pop.hidden = true; lock(false);
      if (!promo) store.set('mb-promo-dismiss', Date.now());
      if (popLast && popLast.focus) popLast.focus();
    }
    function onScroll() { const h = document.documentElement; if (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) > 0.33) openPop(); }
    if (can()) { timer = setTimeout(openPop, 1500); window.addEventListener('scroll', onScroll, { passive: true }); }
    pop.addEventListener('click', e => { if (e.target === pop || e.target.closest('[data-promo-close]')) closePop(); });
    document.addEventListener('keydown', e => {
      if (pop.hidden) return;
      if (e.key === 'Escape') closePop();
      if (e.key === 'Tab') { const f = qa('a[href],button:not([disabled]),input:not([disabled])', pop); if (!f.length) return; if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
    });
  }

  // ---------- pagamento simulato ----------
  const co = q('[data-checkout]');
  let renderSummary = () => {};
  if (co) {
    const panels = qa('[data-co-panel]', co), stepEls = qa('[data-co-step]', co);
    const sumBox = q('[data-co-summary]', co);
    let step = 1, order = null;
    const shipSel = () => (q('input[name=ship]:checked', co) || {}).value || 'standard';
    const shipCost = () => (shipSel() === 'express' ? MB.EXP : itemsTotal() >= MB.FREE ? 0 : MB.STD);
    const sampleSel = () => { const r = q('input[name=sample]:checked', co); return r && r.value !== 'nessuno' ? r.closest('label').querySelector('strong').textContent : ''; };
    renderSummary = function () {
      const lines = order ? order.lines : cart, sub = order ? order.sub : subtotal(), ship = order ? order.ship : shipCost(), g = order ? order.gift : giftCost(), d = order ? order.disc : discount();
      sumBox.innerHTML = lines.map(l => { const p = MB.P[l.id]; return `<div class="line" style="--line:${MB.LINES[p.line].bg};--line-fg:${MB.LINES[p.line].fg}">${thumb(p)}<div><p class="line__name">${esc(p.name)}</p><p class="line__meta">${l.qty} × ${eur(p.price)}</p></div></div>`; }).join('') +
        `<div class="totals" style="margin-top:12px"><div><span>Subtotale</span><span>${eur(sub)}</span></div>${d ? `<div class="totals__disc"><span>Sconto di benvenuto (10%)</span><span>−${eur(d)}</span></div>` : ''}${g ? `<div><span>Confezione regalo</span><span>${eur(g)}</span></div>` : ''}<div><span>Spedizione</span><span>${ship ? eur(ship) : 'Gratuita'}</span></div><div class="totals__sum"><span>Totale</span><span>${eur(sub - d + ship + g)}</span></div></div>${(order ? order.sample : sampleSel()) ? `<p class="small muted" style="margin-top:10px">Campione omaggio: ${esc(order ? order.sample : sampleSel())}</p>` : ''}`;
      const std = q('[data-ship-std]', co); if (std) std.textContent = itemsTotal() >= MB.FREE ? 'Gratuita' : eur(MB.STD);
    };
    function show(n) {
      step = n;
      panels.forEach(p => { p.hidden = +p.dataset.coPanel !== n; });
      stepEls.forEach(s => { const k = +s.dataset.coStep; s.classList.toggle('is-done', k < n); if (k === n) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current'); });
      renderSummary(); window.scrollTo(0, 0);
      const h = q('[data-co-panel="' + n + '"] h1', co); if (h && n > 1) { h.setAttribute('tabindex', '-1'); h.focus(); }
    }
    if (cart.length) { q('[data-co-empty]', co).hidden = true; q('.co-summary', co).hidden = false; show(1); }
    const form = q('[data-co-panel="1"]', co);
    const rules = {
      email: v => /^\S+@\S+\.\S+$/.test(v) || 'Inserisci un indirizzo email valido.',
      nome: v => !!v.trim() || 'Campo obbligatorio.', cognome: v => !!v.trim() || 'Campo obbligatorio.',
      indirizzo: v => !!v.trim() || 'Campo obbligatorio.', citta: v => !!v.trim() || 'Campo obbligatorio.',
      cap: v => /^\d{5}$/.test(v.trim()) || 'Il CAP ha 5 cifre.',
      provincia: v => /^[A-Za-z]{2}$/.test(v.trim()) || 'Due lettere, per esempio LU.'
    };
    const data = {};
    form.addEventListener('submit', e => {
      e.preventDefault();
      let first = null;
      Object.keys(rules).forEach(k => {
        const el = form.elements[k], ok = rules[k](el.value), err = q('#err-' + k);
        if (ok === true) { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); err.hidden = true; }
        else { el.setAttribute('aria-invalid', 'true'); el.setAttribute('aria-describedby', 'err-' + k); err.textContent = ok; err.hidden = false; if (!first) first = el; }
      });
      if (first) { first.focus(); return; }
      ['email', 'nome', 'cognome', 'indirizzo', 'cap', 'citta', 'provincia', 'telefono'].forEach(k => { data[k] = form.elements[k].value.trim(); });
      q('[data-co-address]', co).textContent = 'Spediamo a: ' + data.nome + ' ' + data.cognome + ', ' + data.indirizzo + ', ' + data.cap + ' ' + data.citta + ' (' + data.provincia.toUpperCase() + ')';
      show(2);
    });
    const pre = q('input[name=ship][value="' + shipPref + '"]', co); if (pre) pre.checked = true;
    qa('input[name=ship]', co).forEach(r => r.addEventListener('change', () => { shipPref = r.value; store.set('mb-ship', shipPref); renderCart(); }));
    qa('input[name=ship], input[name=sample]', co).forEach(r => r.addEventListener('change', renderSummary));
    qa('[data-co-back]', co).forEach(b => b.addEventListener('click', () => show(step - 1)));
    q('[data-co-next]', co).addEventListener('click', () => show(3));
    q('[data-login-toggle]', co).addEventListener('click', e => { const n = q('[data-login-note]', co); n.hidden = !n.hidden; e.currentTarget.setAttribute('aria-expanded', String(!n.hidden)); });
    q('[data-co-cart]', co).addEventListener('click', e => { e.preventDefault(); openCart(); });
    q('[data-co-place]', co).addEventListener('click', () => {
      const num = 'MB-DEMO-' + String(Math.floor(1000 + Math.random() * 9000));
      order = { lines: cart.slice(), sub: subtotal(), ship: shipCost(), gift: giftCost(), sample: sampleSel(), disc: discount() };
      if (order.disc) { promo.used = true; store.set('mb-promo', promo); } // lo sconto vale solo sul primo ordine
      const when = shipSel() === 'express' ? between(1, 2) : between(2, 4);
      q('[data-co-done-text]', co).innerHTML = `Ordine <strong>${num}</strong>. In un negozio vero ti arriverebbe una conferma a <strong>${esc(data.email)}</strong> e il pacco ${when}.${gift.on ? ' Con confezione regalo e biglietto scritto a mano.' : ''}${order.sample ? ' Nel pacco anche il campione: ' + esc(order.sample) + '.' : ''}${order.disc ? ' Hai risparmiato ' + eur(order.disc) + ' con lo sconto di benvenuto.' : ''}`;
      cart = []; gift = { on: false, msg: '' }; save(); renderCart();
      show(4); q('[data-co-panel="4"]', co).focus();
    });
  }

  renderCart();
})();
