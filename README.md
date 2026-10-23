# Reboot — Ripartiamo, Insieme, Avanti

Prototipo di web app installabile (PWA) per una lista d'istituto. Interfaccia in italiano, responsive, stile bianco/blu.

## Funzioni incluse nella demo
- Sondaggi consultivi con risultati percentuali
- Invio di proposte/segnalazioni
- News e calendario con data facoltativa
- Area amministratore demo per creare e cancellare sondaggi/news e consultare/eliminare proposte
- Layout mobile e manifest/service worker per installazione PWA

## Limite fondamentale della versione attuale
Questa è una **demo statica**. I contenuti vengono salvati in `localStorage`, quindi:
- restano solo nel browser e nel dispositivo che li ha creati;
- non vengono condivisi automaticamente con gli altri studenti;
- cancellando i dati del browser si possono perdere;
- il PIN admin è nel codice JavaScript e NON è una vera autenticazione: chi conosce gli strumenti del browser può leggerlo o aggirarlo;
- i sondaggi sono facilmente manipolabili e non garantiscono un voto per persona.

**Non raccogliere dati personali, segnalazioni delicate o contenuti riservati con questa demo.** Prima di un lancio reale serve un backend condiviso, autenticazione amministratori, regole di sicurezza, protezione anti-abuso, informativa privacy e approvazione/consenso dell'istituto quando necessario.

## Provare in locale
1. Estrai lo ZIP.
2. Apri `index.html` in un browser. Le funzioni base dovrebbero funzionare; l'installazione PWA/service worker richiede HTTPS o localhost.
3. PIN demo dell'area admin: `2468`.
4. Per un server locale, se hai Python installato, apri un terminale nella cartella e lancia:
   ```bash
   python -m http.server 8000
   ```
   Poi visita `http://localhost:8000`.

## Pubblicare gratuitamente con GitHub Pages
1. Crea un account GitHub se non ne hai uno e accedi.
2. Crea un nuovo repository pubblico, ad esempio `reboot-lista-istituto`.
3. Carica i file di questa cartella nella root del repository: `index.html`, `styles.css`, `app.js`, `manifest.json`, `sw.js`, `icon.svg`.
4. Apri **Settings → Pages**.
5. In **Build and deployment**, scegli **Deploy from a branch**, seleziona `main` e `/ (root)`, poi salva.
6. Attendi il completamento del deployment. L'indirizzo sarà simile a `https://TUO-USERNAME.github.io/reboot-lista-istituto/`.
7. Apri il link su iPhone. In Safari: **Condividi → Aggiungi alla schermata Home**. Su Android, usa il menu del browser e scegli installa/aggiungi alla schermata Home se disponibile.

GitHub Pages offre hosting statico gratuito per repository pubblici, ma non fornisce un database condiviso né autenticazione admin per questa app.

## Come personalizzare il PIN demo
In `app.js`, cambia `const ADMIN_PIN = "2468";`. Questo serve solo per testare l'interfaccia: non protegge davvero l'area amministratore e non rende sicura la pubblicazione di contenuti privati.

## Prossimo passo per una vera versione condivisa
Per rendere sondaggi, proposte, news e area admin condivisi tra dispositivi, bisogna collegare un backend. Una possibilità è Supabase con piano gratuito, dopo aver verificato i limiti e configurato correttamente le policy di sicurezza (RLS). L'area admin deve usare autenticazione reale, non un PIN nel JavaScript. Non pubblicare chiavi segrete nel repository; le chiavi pubbliche client-side devono essere protette dalle policy del database.
