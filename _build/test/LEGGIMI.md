# Test automatici (Playwright)

Prima avvia il sito in locale: `npx http-server -p 8991 -s -c-1 .` (dalla cartella del progetto).

- `node _build/test/percorsi.js` — carrello, regalo, INCI leggibile, filtri, lotto, rituale (guidato e componi tu), striscia della bottega, salvati, pagamento completo, newsletter, menu (PC + telefono). Atteso: 85 OK.
- `node _build/test/popup-sconto.js` — popup di benvenuto e sconto 10% (comparsa, consenso, sconto in carrello e pagamento, una sola volta, "No grazie"). Atteso: 30 OK.
- Controllo impaginazione: `node "C:/Users/Claude FK/.claude/_studio/scripts/scan-sito.js" <cartella> <pagine.html,...>`.

Per aprire le pagine come file invece che dal server: `BASE="file:///.../" node _build/test/percorsi.js`.
