# Avvio del Navigator e del Server (locale)

Questo README spiega **come far partire il progetto in locale**: sia il **Server** (Express + MongoDB) sia il **Navigator** (Vue + Vite).

Il progetto è diviso in due parti:

```text
Server/      → backend Express + MongoDB (Mongoose)
Navigator/   → frontend Vue 3 + TypeScript + Vite
```

---

## 1. Prerequisiti (una tantum, su ogni macchina)

Software da installare **una sola volta** su una macchina nuova:

- **Node.js** (versione LTS, es. 18 o 20) e **npm** (incluso con Node)
- **MongoDB Community Server** (il database usato dal backend)
- **Git** (per clonare/aggiornare il repository)

### Verifica installazione

```bash
node -v
npm -v
mongod --version
```

Se uno di questi comandi non è riconosciuto, installa il software mancante:

- Node.js: https://nodejs.org
- MongoDB Community Server: https://www.mongodb.com/try/download/community
  - In alternativa, se si usa Docker, si può avviare MongoDB con:
    ```bash
    docker run -d --name mongo-artaround -p 27017:27017 mongo
    ```

---

## 2. Prima configurazione su una macchina nuova

Da eseguire **una sola volta** dopo aver clonato il repository.

### 2.1 Clona il repository

```bash
git clone <url-del-repo>
```

### 2.2 Installa le dipendenze del Server

```bash
cd Server
npm install
```

### 2.3 Crea il file `.env` del Server

Il Server legge la configurazione da un file `.env` (non versionato). Copia il file di esempio già presente:

```bash
cp .env.example .env
```

Su Windows (PowerShell):

```powershell
copy .env.example .env
```

Il file `.env` contiene:

```env
PORT=8000
MONGO_URI=mongodb://127.0.0.1:27017/artaround
```

Non è necessario modificarlo se MongoDB gira in locale sulla porta di default.

### 2.4 Installa le dipendenze del Navigator

```bash
cd ../Navigator
npm install
```

### 2.5 (Opzionale) Build iniziale del Navigator

Per servire il Navigator integrato dentro il Server (`http://localhost:8000/navigator/`), va generata la build, che viene copiata automaticamente in `Server/public/navigator`:

```bash
npm run build
```

A questo punto la configurazione della macchina è completa.

### 2.6 Installa il comando di avvio unico

Dalla cartella radice `Navigator/` esegui una volta:

```bash
npm install
```

---

## 3. Avvio "di tutti i giorni" (dopo la prima configurazione)

Ogni volta che si vuole lavorare sul progetto servono **tre cose in esecuzione**: MongoDB, il Server, e (se si sviluppa il frontend) il Navigator in modalità sviluppo.

Per avviare Server e Navigator con un solo comando:

```bash
cd Navigator
npm run dev
```

Il comando termina entrambi i processi quando viene interrotto con `Ctrl+C`.

### 3.1 Avvia MongoDB

Se MongoDB è installato come **servizio di sistema**, di solito parte da solo all'avvio del PC. In tal caso questo passaggio si può saltare.

Se invece va avviato manualmente:

**Windows (servizio):**

```powershell
net start MongoDB
```

**Linux (systemd):**

```bash
sudo systemctl start mongod
```

**macOS (brew services):**

```bash
brew services start mongodb-community
```

**Con Docker** (se il container esiste già, es. `mongo-artaround`):

```bash
docker start mongo-artaround
```

Verifica che MongoDB sia attivo provando a connetterti, oppure guardando i log del Server al passo successivo (mostrerà `MongoDB connected: ...`).

### 3.2 Avvia il Server

```bash
cd Server
npm start
```

Il Server parte su:

```text
http://localhost:8000
```

Nel terminale dovresti vedere:

```text
MongoDB connected: 127.0.0.1
Server running on port 8000
```

Se invece vedi `MongoDB connection error`, MongoDB non è avviato: torna al punto 3.1.

### 3.3 Avvia il Navigator (modalità sviluppo, opzionale)

Se stai modificando il frontend, in un **altro terminale**:

```bash
cd Navigator
npm run dev
```

Il Navigator in sviluppo parte su:

```text
http://localhost:5173/navigator/
```

Durante lo sviluppo, Vite inoltra automaticamente le chiamate `/api` al Server su `localhost:8000`.

### 3.4 Testare la versione integrata (senza modalità sviluppo)

Se non stai modificando il frontend, basta il Server avviato al punto 3.2 e puoi aprire direttamente:

```text
http://localhost:8000/navigator/
```

Questa è la build statica già generata (vedi punto 2.5). Se modifichi il Navigator e vuoi che i cambiamenti si vedano anche qui, devi rigenerare la build:

```bash
cd Navigator
npm run build
```

---

## 4. Riepilogo rapido

**Prima volta su una macchina nuova:**

```bash
# prerequisiti: Node.js + MongoDB installati

git clone <url-del-repo>
cd LuigiTechweb-navigator-luigi/Server
npm install
cp .env.example .env

cd ../Navigator
npm install
npm run build
```

**Ogni volta successiva:**

```bash
# 1. assicurati che MongoDB sia avviato (spesso già attivo come servizio)

# 2. avvia il Server
cd Server
npm start

# 3. (opzionale, solo se sviluppi il frontend) avvia il Navigator
cd Navigator
npm run dev
```

---

## 5. Problemi comuni

| Problema | Causa probabile | Soluzione |
|---|---|---|
| `MongoDB connection error` | MongoDB non è avviato | Avvia MongoDB (vedi punto 3.1) |
| Porta 8000 già in uso | Un altro processo usa la porta | Cambia `PORT` in `Server/.env` |
| Porta 5173 già in uso | Un'altra istanza di Vite è attiva | Chiudi l'altro processo o lascia che Vite scelga una porta libera |
| Le modifiche al frontend non si vedono su `localhost:8000` | Manca la build aggiornata | Esegui `npm run build` dentro `Navigator/` |
| `.env` mancante | Non è stato copiato da `.env.example` | Esegui `cp .env.example .env` dentro `Server/` |
