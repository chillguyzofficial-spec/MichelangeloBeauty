# Test automatici (Playwright)

Prima avvia il sito in locale: `npx http-server -p 8991 -s -c-1 .` (dalla cartella del progetto).

- `node _build/test/percorsi.js` — carrello, regalo, INCI leggibile, filtri, lotto, rituale (5 domande, togli/aggiungi, regalo, senza profumo), striscia della bottega, salvati, pagamento completo, newsletter, menu (PC + telefono). Atteso: 101 OK.
- `node _build/test/popup-sconto.js` — popup di benvenuto e sconto 10% (comparsa, consenso, sconto in carrello e pagamento, una sola volta, "No grazie"). Atteso: 30 OK.
- Controllo impaginazione: `node "C:/Users/Claude FK/.claude/_studio/scripts/scan-sito.js" <cartella> <pagine.html,...>`.

Per aprire le pagine come file invece che dal server: `BASE="file:///.../" node _build/test/percorsi.js`.
- `node _build/test/telefono.js` — emulazione completa (schermo, tocco, user agent) su iPhone 13, iPhone SE, Pixel 7, iPhone in orizzontale, iPad verticale e orizzontale: ogni pagina senza scroll laterale e con le foto dentro i margini, menu aperto e chiuso 3 volte, popup che non copre il menu, carrello. Atteso: "tutto ok". (Non usare WebKit: su questo Windows Smart App Control lo blocca perché non è firmato.)
