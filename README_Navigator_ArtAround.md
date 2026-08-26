# Navigator ArtAround

Questo README descrive lo stato attuale del modulo **Navigator** e della nuova estensione per le **visite sincronizzate docente/studenti**.

Il Navigator è la parte dell’applicazione pensata per il visitatore del museo. Permette di leggere un QR code, selezionare una visita, navigare tra le tappe, ascoltare i contenuti delle opere e visualizzare una planimetria con marker.

---

## 1. Tecnologie usate

Il Navigator è sviluppato con:

```text
Vue 3 + TypeScript + Vite
```

Motivi principali:

- Vue permette di costruire pagine e componenti riutilizzabili;
- TypeScript aiuta a gestire meglio i dati ricevuti dal backend;
- Vite consente sviluppo rapido e build statica;
- la build finale viene servita dal server Express sotto `/navigator/`.

---

## 2. Struttura principale

La struttura attuale è:

```text
LuigiTechweb/
  Server/
    Models/
    Controllers/
    Routes/
    Data/
    public/
      navigator/        ← build finale del Navigator

  Navigator/
    src/
      components/
      layouts/
      pages/
      services/
      utils/
    public/
    vite.config.ts
```

La cartella `Navigator/` contiene il codice sorgente Vue.

La cartella `Server/public/navigator/` contiene la build prodotta da:

```powershell
npm run build
```

---

## 3. Configurazione Vite

Il file `Navigator/vite.config.ts` usa:

```ts
base: "/navigator/"
```

e genera la build in:

```text
Server/public/navigator
```

Durante lo sviluppo Vite inoltra le chiamate `/api` al backend Express su `localhost:8000`.

---

## 4. Differenza tra localhost:5173 e localhost:8000

| Indirizzo | Uso |
|---|---|
| `localhost:5173` | server Vite per sviluppo frontend |
| `localhost:8000` | server Express per backend e build integrata |

Durante lo sviluppo si usa:

```text
http://localhost:5173/navigator/
```

Per testare la versione integrata si usa:

```text
http://localhost:8000/navigator/
```

Dopo modifiche al frontend, per aggiornare la versione su `localhost:8000` bisogna eseguire:

```powershell
cd C:\progetti\repoluigitechweb\LuigiTechweb\Navigator
npm run build
```

---

## 5. Route principali del Navigator

Il router Vue usa:

```ts
createWebHistory(import.meta.env.BASE_URL)
```

Le route principali sono:

```text
/navigator/
```

Pagina iniziale con scanner QR.

```text
/navigator/museums/:museumId/visits
```

Lista delle visite disponibili per il museo.

```text
/navigator/museums/:museumId/items
```

Lista delle opere disponibili.

```text
/navigator/museums/:museumId/visits/:visitId/navigator
```

Pagina di navigazione della visita.

---

## 6. Pagine principali

Le pagine principali sono:

```text
Navigator/src/pages/MuseumSelectPage.vue
Navigator/src/pages/VisitSelectPage.vue
Navigator/src/pages/ItemsPage.vue
Navigator/src/pages/NavigatorPage.vue
```

### `MuseumSelectPage.vue`

Pagina iniziale. Permette di scansionare o caricare un QR code.

Il QR contiene l’identificativo del museo, ad esempio:

```text
01
```

### `VisitSelectPage.vue`

Mostra le visite disponibili per il museo selezionato.

### `ItemsPage.vue`

Mostra le opere disponibili lette dal backend.

### `NavigatorPage.vue`

Gestisce la visita ordinaria:

- tappa corrente;
- pulsanti precedente/successivo;
- ascolto tramite sintesi vocale;
- livelli di dettaglio;
- planimetria;
- marker della tappa corrente.

---

## 7. Componenti principali

Componenti principali:

```text
Navigator/src/components/QrScanner.vue
Navigator/src/components/MuseumMap.vue
Navigator/src/components/AppNav.vue
Navigator/src/layouts/AppShell.vue
```

### `QrScanner.vue`

Gestisce scansione QR da fotocamera e caricamento immagine QR da file.

Usa:

```text
@zxing/browser
```

### `MuseumMap.vue`

Mostra planimetria e marker della tappa corrente.

Le coordinate del marker sono percentuali:

```json
{ "x": 32, "y": 58 }
```

### `AppNav.vue`

Menu inferiore in stile app mobile.

Voci:

```text
Scanner | Visite | Opere | Navigator
```

### `AppShell.vue`

Layout comune con intestazione, contenitore pagina e menu inferiore.

---

## 8. Collegamento con il backend

Il Navigator usa principalmente:

```text
GET /api/items
GET /api/visits
```

Il service principale è:

```text
Navigator/src/services/api.ts
```

Il backend restituisce visite basate su `sequence`, mentre il Navigator lavora con una struttura più adatta alla navigazione. Per questo `api.ts` normalizza i dati:

```text
sequence → steps
```

Ogni elemento della `sequence` diventa una tappa del Navigator.

---

## 9. Planimetria e marker

Nel database attuale la `sequence` contiene `itemId` e `order`, ma non contiene ancora coordinate reali di mappa.

Per questo il Navigator assegna marker provvisori in base all’indice della tappa.

Possibile soluzione futura:

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

---

## 10. Sintesi vocale e livelli di dettaglio

La lettura dei contenuti usa la Web Speech API del browser:

```ts
SpeechSynthesisUtterance
```

Lingua:

```text
it-IT
```

I livelli di durata usati sono:

```ts
["3s", "15s", "40s", "1min", "4min"]
```

I pulsanti `Di più` e `Di meno` cambiano la durata preferita del contenuto.

---

# Estensione: visite sincronizzate docente/studenti

È stata aggiunta una modalità di visita sincronizzata per una docente o guida.

La docente controlla la visita; gli studenti si collegano con un codice e seguono la tappa scelta dalla docente.

Codice di esempio usato nei test:

```text
RINASCIMENTO
```

---

## 11. Route della modalità sincronizzata

Sono state aggiunte queste route Vue:

```text
/navigator/sync
/navigator/sync/:code/student
/navigator/sync/:code/teacher
```

Esempi:

```text
http://localhost:5173/navigator/sync
http://localhost:5173/navigator/sync/RINASCIMENTO/teacher
http://localhost:5173/navigator/sync/RINASCIMENTO/student?name=Mario%20Rossi
```

Nella versione integrata:

```text
http://localhost:8000/navigator/sync
http://localhost:8000/navigator/sync/RINASCIMENTO/teacher
http://localhost:8000/navigator/sync/RINASCIMENTO/student?name=Mario%20Rossi
```

---

## 12. Funzioni lato docente

Il pannello docente consente di:

- attivare la visita;
- vedere la tappa corrente;
- andare alla tappa precedente o successiva;
- avviare e fermare l’audio sugli studenti;
- vedere gli studenti collegati;
- controllare se gli studenti risultano online o non aggiornati;
- vedere le richieste degli studenti;
- aprire o chiudere il quiz;
- visualizzare i punteggi del quiz.

File:

```text
Navigator/src/pages/SyncTeacherPage.vue
```

---

## 13. Funzioni lato studente

Lo studente può:

- entrare con codice visita e nome;
- vedere solo la tappa scelta dalla docente;
- ascoltare l’audio avviato dalla docente;
- riascoltare localmente il contenuto;
- chiedere più dettagli;
- chiedere un linguaggio più semplice;
- rispondere al quiz finale.

Lo studente non può andare avanti o indietro autonomamente.

File:

```text
Navigator/src/pages/SyncStudentPage.vue
```

---

## 14. Scelta tecnica: polling

La sincronizzazione usa polling.

Ogni studente aggiorna periodicamente lo stato leggendo dal backend:

```text
currentIndex
isPlaying
quizOpen
```

Inoltre aggiorna il proprio `lastSeen`, così il pannello docente può indicare se lo studente è ancora online.

Questa soluzione è più semplice dei WebSocket ed è adeguata per una demo prototipale.

---

## 15. Backend visite sincronizzate

File modificati:

```text
Server/Models/visits.js
Server/Controllers/visitController.js
Server/Routes/VisitRoutes.js
```

Campi principali aggiunti/usati nel modello `Visit`:

```text
synchronized
syncCode
active
startedAt
currentIndex
isPlaying
participants
requests
quizOpen
quiz
quizAnswers
```

---

## 16. Endpoint visite sincronizzate

Base path:

```text
/api/visits/sync/:code
```

Endpoint:

| Metodo | Endpoint | Funzione |
|---|---|---|
| `GET` | `/api/visits/sync/:code` | recupera la visita sincronizzata |
| `PUT` | `/api/visits/sync/:code/activate` | attiva la visita |
| `POST` | `/api/visits/sync/:code/join` | collega o aggiorna uno studente |
| `PUT` | `/api/visits/sync/:code/state` | aggiorna tappa e stato audio |
| `POST` | `/api/visits/sync/:code/request` | salva una richiesta dello studente |
| `PUT` | `/api/visits/sync/:code/quiz` | apre o chiude il quiz |
| `POST` | `/api/visits/sync/:code/quiz-answer` | invia risposte e calcola punteggio |

---

## 17. Service frontend per sincronizzazione

È stato aggiunto:

```text
Navigator/src/services/syncApi.ts
```

Funzioni principali:

```text
getVisit
activateVisit
joinVisit
updateState
createRequest
setQuizOpen
submitQuizAnswer
```

---

## 18. Dati di esempio per visita sincronizzata

Per testare la modalità sincronizzata serve una visita con almeno:

```json
{
  "synchronized": true,
  "syncCode": "RINASCIMENTO",
  "active": false,
  "currentIndex": 0,
  "isPlaying": false,
  "quizOpen": false,
  "participants": [],
  "requests": [],
  "quizAnswers": []
}
```

Esempio quiz:

```json
"quiz": [
  {
    "question": "Chi è l'autore dell'opera?",
    "answers": ["Giotto", "Amico Aspertini", "Raffaello"],
    "correctIndex": 1
  }
]
```

---

## 19. Avvio del progetto

### Backend

```powershell
cd C:\progetti\repoluigitechweb\LuigiTechweb\Server
npm start
```

Backend disponibile su:

```text
http://localhost:8000
```

### Frontend in sviluppo

```powershell
cd C:\progetti\repoluigitechweb\LuigiTechweb\Navigator
npm run dev
```

Navigator disponibile su:

```text
http://localhost:5173/navigator/
```

---

## 20. Build integrata

Per aggiornare la versione servita da Express:

```powershell
cd C:\progetti\repoluigitechweb\LuigiTechweb\Navigator
npm run build
```

Poi aprire:

```text
http://localhost:8000/navigator/
```

---

## 21. File da non caricare su GitHub

Non caricare:

```text
node_modules/
.env
```

Il file `.env` resta locale.

Esempio configurazione locale:

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/artaround
```

---

## 22. Limiti attuali

- I marker sulla planimetria sono provvisori;
- la sincronizzazione usa polling, non WebSocket;
- non è presente autenticazione docente/studente;
- il pannello docente è accessibile conoscendo il codice visita;
- nella versione prototipale le risposte corrette del quiz sono presenti nel payload.

---

## 23. Possibili sviluppi futuri

- aggiungere coordinate reali alle tappe della visita;
- completare gestione planimetrie per museo;
- usare WebSocket per sincronizzazione in tempo reale;
- aggiungere autenticazione e ruoli;
- nascondere le risposte corrette al client studente;
- gestire contenuti privati creati dalla docente;
- esportare risultati del quiz.

---

## 24. File principali modificati

Frontend:

```text
Navigator/src/router.ts
Navigator/src/services/api.ts
Navigator/src/services/syncApi.ts
Navigator/src/pages/MuseumSelectPage.vue
Navigator/src/pages/VisitSelectPage.vue
Navigator/src/pages/ItemsPage.vue
Navigator/src/pages/NavigatorPage.vue
Navigator/src/pages/SyncEntryPage.vue
Navigator/src/pages/SyncStudentPage.vue
Navigator/src/pages/SyncTeacherPage.vue
```

Backend:

```text
Server/Models/visits.js
Server/Controllers/visitController.js
Server/Routes/VisitRoutes.js
```

Build:

```text
Server/public/navigator/
```

---

## 25. Comandi Git

Dalla root:

```powershell
cd C:\progetti\repoluigitechweb\LuigiTechweb
git status
```

Aggiungere i file modificati:

```powershell
git add Navigator/src/router.ts
git add Navigator/src/services/syncApi.ts
git add Navigator/src/pages/SyncEntryPage.vue
git add Navigator/src/pages/SyncStudentPage.vue
git add Navigator/src/pages/SyncTeacherPage.vue
git add Server/Models/visits.js
git add Server/Controllers/visitController.js
git add Server/Routes/VisitRoutes.js
git add Server/public/navigator
```

Commit:

```powershell
git commit -m "Aggiunge visite sincronizzate docente studenti"
```

Push:

```powershell
git push
```
