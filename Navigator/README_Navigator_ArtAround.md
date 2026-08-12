# Navigator ArtAround

Questo documento descrive le scelte progettuali adottate per il modulo **Navigator** e spiega come integrarlo con il backend e con il Marketplace/Editor.

## 1. Obiettivo del modulo

Il modulo **Navigator** è la parte dell'applicazione pensata per il visitatore del museo.

Il flusso previsto è:

1. il visitatore apre il Navigator;
2. scansiona o carica il QR code del museo;
3. accede all'elenco delle visite disponibili;
4. seleziona una visita;
5. naviga tra le tappe della visita;
6. ascolta o legge i contenuti associati alle opere;
7. visualizza una planimetria con un marker della tappa corrente.

Il QR code contiene soltanto l'identificativo del museo, ad esempio:

```text
demo-museum
```

oppure:

```text
brera
```

L'identificativo letto dal QR viene usato dal client per costruire le route interne e per caricare la planimetria corretta.

---

## 2. Tecnologia scelta

Per il Navigator è stato scelto:

```text
Vue 3 + TypeScript + Vite
```

La scelta è motivata da alcuni aspetti pratici:

- Vue consente di organizzare l'interfaccia in componenti piccoli e riutilizzabili;
- TypeScript aiuta a controllare meglio la struttura dei dati ricevuti dal backend;
- Vite permette uno sviluppo rapido in locale e una build statica facilmente servibile dal server Express;
- il modulo può restare separato dal Marketplace/Editor, evitando conflitti tra codice Vue e JavaScript statico del template.

---

## 3. Struttura delle cartelle

La struttura di integrazione prevista è:

```text
ArtAround-integrazione/
  Server/
    server.js
    package.json
    Config/
    Controllers/
    Models/
    Routes/
    public/
      navigator/          ← build finale del Navigator

  MarketPlace-Editor/
    Index.html
    ...

  Navigator/
    index.html
    package.json
    vite.config.ts
    public/
      img/
        museums/
          demo-museum/
            floorplan.png
    src/
      components/
      layouts/
      pages/
      services/
      utils/
```

La cartella `Navigator/` contiene il codice sorgente Vue.

La cartella `Server/public/navigator/` contiene invece la build finale generata da Vite. Non viene modificata manualmente: viene aggiornata con:

```bash
npm run build
```

---

## 4. Configurazione Vite

Il file `Navigator/vite.config.ts` è configurato per funzionare sia in sviluppo sia nella versione integrata.

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  base: "/navigator/",
  build: {
    outDir: path.resolve(__dirname, "../Server/public/navigator"),
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": "http://localhost:8000",
      "/data": "http://localhost:8000"
    }
  }
});
```

Significato delle parti principali:

- `base: "/navigator/"` indica che nella versione integrata l'app Vue sarà servita da `/navigator/`;
- `outDir` indica a Vite di generare la build dentro `Server/public/navigator`;
- `proxy` serve solo durante `npm run dev` e inoltra le chiamate `/api` al server Express sulla porta `8000`.

---

## 5. Route del Navigator

Il Navigator usa `vue-router`.

Le route principali sono:

```text
/navigator/
```

Pagina iniziale con scanner QR.

```text
/navigator/museums/:museumId/visits
```

Lista delle visite disponibili.

```text
/navigator/museums/:museumId/items
```

Lista delle opere/item disponibili.

```text
/navigator/museums/:museumId/visits/:visitId/navigator
```

Pagina di navigazione della visita.

Nel router è importante usare:

```ts
createWebHistory(import.meta.env.BASE_URL)
```

perché l'app non vive nella root del sito, ma sotto `/navigator/`.

---

## 6. Pagine principali

Le pagine sviluppate sono:

```text
src/pages/MuseumSelectPage.vue
src/pages/VisitSelectPage.vue
src/pages/ItemsPage.vue
src/pages/NavigatorPage.vue
```

### `MuseumSelectPage.vue`

È la pagina iniziale.

Contiene lo scanner QR e gestisce il valore letto.

Il QR deve contenere solo l'id del museo. Se il QR contiene URL, path o parametri non viene accettato.

Esempio accettato:

```text
demo-museum
```

Esempio non accettato:

```text
https://example.com/museums/demo-museum
```

### `VisitSelectPage.vue`

Carica le visite tramite il service `api.ts` e le mostra come card selezionabili.

Al click su una visita, l'utente viene portato alla pagina Navigator.

### `ItemsPage.vue`

Mostra gli item/opere restituiti dal backend.

Questa pagina è stata aggiunta per rendere visibile il collegamento tra il Navigator e i contenuti caricati tramite Marketplace/Editor.

### `NavigatorPage.vue`

È la pagina principale della visita.

Gestisce:

- step corrente;
- testo dell'item corrente;
- pulsanti precedente/successivo;
- pulsanti "Di più" e "Di meno";
- sintesi vocale;
- planimetria;
- marker sulla mappa.

---

## 7. Componenti principali

I componenti principali sono:

```text
src/components/QrScanner.vue
src/components/MuseumMap.vue
src/components/AppNav.vue
src/layouts/AppShell.vue
```

### `QrScanner.vue`

Gestisce:

- scansione QR tramite fotocamera;
- caricamento immagine QR da file.

Per la lettura del QR è stata usata la libreria:

```text
@zxing/browser
```

Questa scelta è stata fatta perché l'API nativa `BarcodeDetector` non è disponibile su tutti i browser.

### `MuseumMap.vue`

Mostra la planimetria e il marker della tappa corrente.

Riceve:

```ts
src: string
marker?: { x: number; y: number }
```

Le coordinate del marker sono percentuali:

```json
{ "x": 32, "y": 58 }
```

Questo significa:

- `x = 32%` della larghezza;
- `y = 58%` dell'altezza.

La scelta delle percentuali permette al marker di restare proporzionato anche su schermi diversi.

### `AppNav.vue`

È il menu di navigazione inferiore, in stile app mobile.

Contiene le voci:

```text
Scanner | Visite | Opere | Navigator
```

Alcune voci vengono disabilitate quando mancano i parametri necessari nella route.

Esempio:

- nella pagina iniziale non è ancora noto `museumId`, quindi "Visite", "Opere" e "Navigator" sono disabilitati;
- dopo la scansione del QR, "Visite" e "Opere" diventano disponibili;
- "Navigator" diventa disponibile quando è nota anche la visita selezionata.

### `AppShell.vue`

È il layout comune.

Contiene:

- sfondo museale;
- intestazione della pagina;
- contenitore comune;
- menu inferiore.

Tutte le pagine principali vengono renderizzate dentro `AppShell`.

---

## 8. Collegamento con il backend

Il backend attuale espone principalmente:

```text
GET /api/items
GET /api/visits
POST /api/visits
PUT /api/visits/:id
DELETE /api/visits/:id
GET /api/visits/:id/state
PUT /api/visits/:id/state
```

Il Navigator usa in particolare:

```text
GET /api/visits
GET /api/items
```

Il service del Navigator si trova in:

```text
src/services/api.ts
```

Dato che il backend non espone una route dedicata del tipo:

```text
GET /api/visits/:id
```

il Navigator recupera tutte le visite da:

```text
GET /api/visits
```

e poi seleziona lato client la visita con l'id corrispondente.

---

## 9. Adattamento dei dati

Il modello visita del backend usa una struttura basata su `sequence`.

Esempio concettuale:

```js
sequence: [
  {
    itemId,
    order
  }
]
```

Il Navigator, invece, lavora internamente con una struttura più adatta alla navigazione:

```ts
steps: [
  {
    directions: string,
    map?: { x: number, y: number },
    items: string[]
  }
]
```

Per questo in `api.ts` viene fatta una normalizzazione:

```text
sequence → steps
```

Ogni elemento della `sequence` diventa una tappa del Navigator.

---

## 10. Planimetrie dei musei

La planimetria viene caricata in base all'id del museo letto dal QR.

La convenzione usata è:

```text
Navigator/public/img/museums/<museumId>/floorplan.png
```

Esempio:

```text
Navigator/public/img/museums/demo-museum/floorplan.png
```

Se il QR contiene:

```text
demo-museum
```

il Navigator cercherà la planimetria in:

```text
/navigator/img/museums/demo-museum/floorplan.png
```

Questa scelta permette di aggiungere nuovi musei senza modificare il codice: basta creare una nuova cartella con lo stesso id del QR.

---

## 11. Marker sulla planimetria

Nel modello attuale del backend la `sequence` contiene `itemId` e `order`, ma non contiene ancora coordinate di mappa.

Per questo motivo il Navigator assegna coordinate provvisorie in base all'indice della tappa.

Questa soluzione consente di mostrare subito il funzionamento del marker, anche senza modificare il database.

Soluzione definitiva proposta:

```js
sequence: [
  {
    itemId,
    order,
    map: {
      x: Number,
      y: Number
    }
  }
]
```

In questo modo ogni tappa potrebbe avere coordinate reali sulla planimetria.

---

## 12. Sintesi vocale

Il Navigator usa la Web Speech API del browser.

Quando l'utente preme "Ascolta", viene creato un oggetto:

```ts
SpeechSynthesisUtterance
```

con lingua impostata su:

```ts
it-IT
```

La lettura può essere interrotta con il pulsante "Stop".

---

## 13. Livelli di dettaglio

Gli item possono avere durate diverse.

La scala usata è:

```ts
["3s", "15s", "40s", "1min", "4min"]
```

I pulsanti:

```text
Di più
Di meno
```

cambiano la durata preferita.

Il file che contiene questa logica è:

```text
src/utils/itemSelect.ts
```

Se esiste un item della durata richiesta, viene selezionato quello. Altrimenti viene scelto l'item più vicino disponibile.

---

## 14. Comandi per lo sviluppo

### Avviare il backend

```bash
cd C:\progetti\ArtAround-integrazione\Server
npm start
```

Il server deve essere disponibile su:

```text
http://localhost:8000
```

### Avviare il Navigator in sviluppo

In un secondo terminale:

```bash
cd C:\progetti\ArtAround-integrazione\Navigator
npm run dev
```

Durante lo sviluppo il Navigator viene aperto da Vite, di solito su:

```text
http://localhost:5173/navigator/
```

---

## 15. Comandi per la build integrata

Quando il Navigator funziona in sviluppo:

```bash
cd C:\progetti\ArtAround-integrazione\Navigator
npm run build
```

La build viene generata in:

```text
Server/public/navigator
```

Poi, con il server acceso, il Navigator integrato è disponibile su:

```text
http://localhost:8000/navigator/
```

---

## 16. File da non caricare su GitHub

Non devono essere caricati:

```text
node_modules/
.env
```

La configurazione locale deve stare nel file:

```text
Server/.env
```

mentre su GitHub va caricato solo:

```text
Server/.env.example
```

Esempio:

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/site252614
```

---

## 17. Miglioramenti futuri

Possibili sviluppi successivi:

1. aggiungere al backend un modello `Museum` con:
   - id museo;
   - nome;
   - planimetria;
   - descrizione;

2. aggiungere coordinate reali alla `sequence` delle visite;

3. consentire al Marketplace/Editor di caricare la planimetria del museo;

4. aggiungere una pagina Quiz usando il campo `quiz` già presente nel modello `Visit`;

5. migliorare la sincronizzazione dello stato visita usando:
   - `GET /api/visits/:id/state`;
   - `PUT /api/visits/:id/state`.

---

## 18. Sintesi delle scelte progettuali

Il Navigator è stato progettato come modulo separato ma integrato nel server unico.

Le scelte principali sono:

- Vue 3 + TypeScript per il client;
- build statica servita da Express sotto `/navigator/`;
- QR code con solo id museo;
- planimetria caricata per convenzione da `img/museums/<museumId>/floorplan.png`;
- normalizzazione dei dati backend in `api.ts`;
- compatibilità con l'attuale modello `Visit` basato su `sequence`;
- marker provvisorio in assenza di coordinate reali nel database;
- menu inferiore semplice in stile app mobile;
- pagina Opere per verificare i contenuti caricati nel backend;
- struttura pensata per essere integrabile senza modificare il Marketplace/Editor.
