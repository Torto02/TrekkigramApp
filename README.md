# 🎓 Progetto Universitario

# ⛰️ Trekkigram – Social App Web per il Trekking

## 📌 Panoramica del Progetto

**Trekkigram** è un'applicazione social dedicata agli appassionati di trekking.

Permette agli utenti di condividere eventi di trekking e interagire con altri amanti della natura.

---

## 🧱 Struttura del Progetto

### 🧭 Architettura

Il progetto segue un’architettura **client-server**, suddivisa in:

- **Frontend**: Interfaccia utente sviluppata in **HTML, CSS, JavaScript**
- **Backend**: API REST realizzata in **PHP**
- **Database**: Sistema relazionale per la persistenza dei dati
- **Containerizzazione**: Utilizzo di **Docker** per sviluppo e deploy

---

### 📁 Organizzazione dei File

```text
Code/
├── .env                   # Variabili d'ambiente
├── Backend/               # Codice backend (PHP)
|   ├── .htaccess
│   ├── Controller.php
│   ├── Database.php
│   ├── Gateway/
│   ├── Model/
│   ├── http_response.php
│   ├── index.php
│   └── token.php
├── Dockerfile             # Configurazione container principale
├── apache-conf/           # Configurazione Apache
│   ├── 000-default.conf
│   ├── ports.conf
├── db/                    # Script e config DB
├── docker-compose.yml     # Orchestrazione container
└── frontend/              # Codice frontend
    ├── .htaccess
    ├── css/
    ├── html/
    ├── index.html
    ├── js/
    └── src/
```

---

## ✨ Funzionalità Principali

### 👤 Gestione Utenti

- Registrazione e autenticazione
- Profili utente con storico escursioni
- Impostazioni di privacy

### 🗺️ Eventi di Trekking

- Creazione eventi con dettagli
- Inviti tra utenti
- Visualizzazione e ricerca eventi

### 💬 Social Networking

- Gestione amicizie
- Condivisione attività
- Interazioni tra utenti

---

## 🛠️ Tecnologie Utilizzate

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap
- **Backend**: PHP
- **Database**: MySQL
- **Deployment**: Docker, Apache

---

## 🚀 Guida all'Installazione

### ⚙️ Prerequisiti

- Docker e Docker Compose installati
- Git installato

### 📥 1. Clonare il repository

```bash
git clone https://github.com/Progetti-ING-SW-INFO-UniPR/INGSW-2425-S13-A.git
cd INGSW-2425-S13-A/Code
```

---

## 2. Configurare un nome locale per l'app

🎯 **Obiettivo**
Associare il dominio `Trekkigram.com` al tuo `localhost`, così puoi testare l’app con un URL personalizzato (es. `http://Trekkigram.com` invece di `http://localhost`).

---

### 🖥️ 2.1 Modificare il file `hosts`

#### 🐧 **Su Linux / macOS**

Apri il terminale ed esegui:

```bash
sudo nano /etc/hosts
```

✅ Aggiungi in fondo al file:

```bash
127.0.0.1    Trekkigram.com
```

---

#### 🪟 **Su Windows**

1. Apri **Blocco note come amministratore**:

   - Cerca “Blocco note” nella barra Start, clic destro → **Esegui come amministratore**.

2. Apri il file `hosts`:

   - Percorso:

     ```bash
     C:\Windows\System32\drivers\etc\hosts
     ```

3. In fondo al file, aggiungi questa riga:

   ```bash
   127.0.0.1    Trekkigram.com
   ```

4. Salva il file e chiudi.

---

📌 **Risultato**
Ora puoi digitare `http://Trekkigram.com` nel browser per accedere alla tua app **in locale**, ma simulando un dominio vero.

> 🔁 Se non funziona subito, prova a svuotare la cache DNS o riavviare il browser.

⚠️ Funziona **solo in locale**: non è una registrazione DNS pubblica.

---

### 🐳 3. Avviare i container

```bash
docker-compose up -d
```

### 🔗 Accedere all'applicazione

- 🌐 **Frontend**: [http://Trekkigram.com](http://trekkigram.com/)
- 🗄️ **Database**: [http://Trekkigram.com:8081](http://trekkigram.com:8082/)
- 🔐 **API esempio**: `http://Trekkigram.com:8080/auth/login`

---

## 📘 API Documentation

### 🔐 Autenticazione

| Metodo | Endpoint              | Descrizione    |
| ------ | --------------------- | -------------- |
| POST   | `/auth/login`         | Login          |
| POST   | `/auth/register`      | Registrazione  |
| DELETE | `/auth/logout`        | Logout         |
| GET    | `/auth/check-session` | Check sessione |

### 👤 Utenti

| Metodo | Endpoint                                  | Descrizione      |
| ------ | ----------------------------------------- | ---------------- |
| GET    | `/user/search?username={term}`            | Ricerca utenti   |
| GET    | `/user/username?tab=posts/participations` | Dettaglio utente |
| POST   | `/user/username/update`                   | Modifica profilo |

### 👥 Amicizia

| Metodo | Endpoint                      | Descrizione                   |
| ------ | ----------------------------- | ----------------------------- |
| POST   | `/friendship/username`        | Invio richiesta di amicizia   |
| PUT    | `/friendship/username`        | Accetta richiesta di amicizia |
| DELETE | `/friendship/username/reject` | Rifiuta richiesta di amicizia |
| DELETE | `/friendship/username/cancel` | Annulla richiesta di amicizia |
| DELETE | `/friendship/username`        | Rimozione amicizia            |
| GET    | `/friendship/request`         | Recupera richieste ricevute   |

### 🏕️ Eventi

| Metodo | Endpoint                      | Descrizione          |
| ------ | ----------------------------- | -------------------- |
| POST   | `/events/create`              | Creazione evento     |
| GET    | `/events/posts`               | Recupero eventi home |
| GET    | `/events?eventId={ID}`        | Dettaglio evento     |
| PUT    | `/events/update?eventId={ID}` | Modifica evento      |
| DELETE | `/events/delete?eventId={ID}` | Eliminazione evento  |

### 📇 Partecipazioni

| Metodo | Endpoint                       | Descrizione                   |
| ------ | ------------------------------ | ----------------------------- |
| GET    | `/participations?eventId={ID}` | Lista partecipanti evento     |
| POST   | `/participations`              | Partecipa ad evento           |
| DELETE | `/events?eventId={ID}`         | Rimuovi partecipazione evento |
| GET    | `/participations/active`       | Recupera partecipazioni       |

### ✉️ Inviti

| Metodo | Endpoint                  | Descrizione                |
| ------ | ------------------------- | -------------------------- |
| POST   | `/participations/invite`  | Invita amico a evento      |
| GET    | `/participations/request` | Recupero inviti evento     |
| PUT    | `/participations/accept`  | Accettazione invito evento |
| DELETE | `/participations/reject`  | Rifuiuto invito evento     |

## 🗃️ Struttura del Database

| Tabella          | Descrizione                      |
| ---------------- | -------------------------------- |
| `users`          | Informazioni utenti              |
| `events`         | Dettagli eventi trekking         |
| `partecipations` | Relazioni utenti ↔ eventi        |
| `friendships`    | Relazioni di amicizia tra utenti |

---
