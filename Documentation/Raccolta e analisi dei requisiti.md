# Raccolta e analisi dei requisiti

**Analisi e Obbiettivi dell’Applicazione**

L’obbiettivo principale dell’applicazione è quello di offrire agli appassionati di trekking un social in cui gli utenti possano condividere, organizzare e partecipare a eventi di trekking. Gli utenti registrati avranno il proprio profilo personale contenente le proprie informazioni biografiche, gli eventi di trekking creati e quelli a cui hanno partecipato o parteciperanno.

Gli utenti potranno decidere tra due livelli di privacy per il proprio profilo:

- **Pubblico**: le informazioni dei post e delle partecipazioni sono visibili a tutti.
- **Privato**: le informazioni dei post e delle partecipazioni sono visibili solo agli amici.

Ogni utente potrà partecipare a eventi creati da altri utenti o creare un nuovo evento specificando informazioni quali data, luogo, difficoltà, ecc. Inoltre, ogni utente avrà una lista di amici e potrà invitarli a partecipare agli eventi.

---

## Requisiti Funzionali

### 1. Gestione Utente e Profilo

### 1.1 Registrazione e Accesso

- **RF1**: L’utente deve poter creare un nuovo account fornendo determinate informazioni.
- **RF2**: L’utente deve poter effettuare l’accesso con email e password.

### 1.2 Gestione Profilo

- **RF3**: L’utente deve poter visualizzare il proprio profilo personale.
- **RF4**: L’utente deve poter modificare le proprie informazioni (immagine profilo, descrizione, privacy).
- **RF5**: L’utente deve poter visualizzare la lista dei trekking passati a cui ha partecipato o che ha ha organizzato.

---

### 2. Gestione Amicizie

### 2.1 Invio e Gestione Richieste

- **RF6**: L’utente deve poter inviare una richiesta di amicizia ad un altro utente.
- **RF7**: L’utente deve poter accettare o rifiutare una richiesta di amicizia.
- **RF8**: L’utente deve poter rimuovere un amico dalla propria lista.

---

### 3. Gestione Eventi di Trekking

### 3.1 Creazione e Modifica Eventi

- **RF9**: L’utente deve poter creare un evento di trekking specificando almeno data, luogo e difficoltà.
- **RF10**: L’utente deve poter modificare le informazioni di un evento creato.
- **RF11**: L’utente deve poter eliminare un evento creato.

### 3.2 Partecipazione agli Eventi

- **RF12**: L’utente deve poter visualizzare la lista di tutti gli eventi disponibili.
- **RF13**: L’utente deve poter iscriversi a un evento creato da un altro utente.
- **RF14**: L’utente deve poter annullare la propria partecipazione a un evento.
- **RF15**: L’utente deve poter vedere la lista dei partecipanti a un evento.

---

### 4. Notifiche e Inviti

- **RF16**: L’utente deve poter invitare amici a partecipare a un evento.
- **RF17**: L’utente deve ricevere una notifica quando riceve un invito a un evento.
- **RF18**: L'utente deve ricevere una notifica quando riceve una richiesta di amicizia

---

### 5. Visualizzazione e Ricerca

- **RF19**: L’utente deve poter cercare altri utenti tramite username.
- **RF20**: L’utente deve poter cercare eventi filtrandoli per data, difficoltà o luogo.

---

### 6. Sicurezza e Privacy

- **RF21**: Le informazioni di un profilo privato devono essere visibili solo agli amici.
- **RF22**: Le password devono essere archiviate in modo sicuro tramite hashing.
- **RF23**: Le chiamate API devono essere protette da autenticazione.

---

## Requisiti Non Funzionali

### 1. Usabilità e Accessibilità

- **RNF1**: Interfaccia intuitiva e facilmente navigabile.
- **RNF2**: Applicazione responsive (desktop, tablet, mobile).
- **RNF3**: Design accessibile e contrasto adeguato

### 2. Prestazioni

- **RNF4**: Tempo di caricamento pagine ≤ 2 secondi.
- **RNF5**: Gestione di almeno 1000 utenti simultanei senza degrado.
- **RNF6**: Tempo di esecuzione CRUD ≤ 1 secondo.

### 3. Sicurezza e Privacy

- **RNF7**: Password con hashing
- **RNF8**: Dati sensibili visibili solo all’utente.
- **RNF9**: Nessun accesso non autorizzato a dati altrui.

### 4. Manutenibilità e Scalabilità

- **RNF10**: Architettura modulare secondo pattern MVP.
- **RNF11**: Estensibilità per nuove funzionalità.
- **RNF12**: Database progettato per crescita di utenti ed eventi.
- **RNF13**: Possibilità di integrazione con nuove API.

### 5. Conformità e Vincoli Tecnologici

- **RNF14**: Server in PHP senza framework architetturali.
- **RNF15**: Client in HTML5, CSS3, JavaScript
- **RNF16**: Comunicazione via RESTful API.
- **RNF17**: Database SQL

### 6. Affidabilità e Disponibilità

- **RNF18**: Messaggi di errore chiari in caso di guasti.

### 7. Testabilità

- **RNF19**: Piano di test con test unitari, di integrazione e di sistema.
- **RNF20**: Possibilità di test automatici su API (Postman, cURL).
- **RNF21**: Log di debug per risoluzione problemi.

---

### Possibili implementazioni e miglioramenti futuri

Lo stato attuale dell’applicazione implementa le funzionalità principali per permettere a una persona interessata di pubblicare e partecipare a eventi di trekking.

Oltre alle funzionalità fondamentale il sistema è facilmente e fortemente estensibili con nuove funzioni; alcune potrebbero essere:

1. **Api di Google Maps**
   Integrazione delle Api di Google maps per calcolare la distanza della zona dell’evento di trekking dalla propria posizione;
2. **Messaggi tra utenti**
   Sistema di messaggistica per permettere interazione dirette utente-utente tramite messaggi testuali/immagini
3. **Notifiche**
   Sistema di notifiche per ricevere quando un proprio amico pubblica un nuovo post, quando si viene invitati ad evento o quando si riceve una richiesta di amicizia
4. **Suggerimenti**
   Suggerimenti intelligente di “utenti che potresti conoscere” o “eventi che potrebbero “interessarti”
5. **Storie**
   Aggiunta delle storie, per caricare foto/video temporanee (24h) visibili in home page e sul proprio profilo
