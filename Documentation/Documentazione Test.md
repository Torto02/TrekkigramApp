# Documentazione Test

Durante lo sviluppo di **Trekkigram**, sono stati eseguiti diversi tipi di test per garantire **qualità**, **affidabilità** e **sicurezza**. Di seguito sono riportati i principali approcci adottati:

---

### 🧩 **Test Frontend**

### 🎨 Test dell’interfaccia utente

- 🔄 **Compatibilità cross-browser**: l’app è stata testata su **Chrome**, **Firefox** e **Safari** per garantirne il corretto funzionamento su tutti i principali browser.
- 📱 **Responsive design**: è stato verificato l’adattamento dell’interfaccia su dispositivi **desktop**, **tablet** e **mobile**.
- 👥 **Usabilità**: è stata valutata l’esperienza utente generale e il flusso di navigazione, per garantire un’interazione semplice e intuitiva.

---

### ⚙️ **Test Backend**

### 🔌 Test delle API

- 🔗 **Endpoint REST**: tutti gli endpoint sono stati testati per assicurare risposte corrette e strutturate.
- 🔐 **Autenticazione**: è stata controllata la gestione di **token**, **sessioni** e **meccanismi di login sicuri**.

### 🛡️ Test di sicurezza

- 🧼 **Validazione input**: tutti gli input forniti dagli utenti vengono correttamente validati per prevenire comportamenti anomali.
- 🚫 **Protezione XSS**: sono stati verificati i meccanismi di escape per impedire attacchi cross-site scripting.
- 🔏 **Controllo autorizzazioni**: è stato verificato che ogni utente possa accedere solo alle risorse a lui consentite.

---

### 🗄️ **Test Database**

- 🔍 **Integrità dei dati**: sono state controllate la struttura delle tabelle, le **foreign key** e le relazioni tra entità.
- ⚡ **Performance delle query**: sono state testate le query più complesse per garantire tempi di risposta rapidi e ottimizzati.

---

### 🚀 **Test di Deployment**

- 🐳 **Container Docker**: è stata verificata la correttezza della configurazione Docker per garantire ambienti di sviluppo e produzione consistenti.
- 🌐 **Server Apache**: è stato testato il funzionamento dei Virtual Host, del rewrite e della configurazione generale.
- 🧩 **Variabili d’ambiente**: è stata verificata la corretta lettura e gestione delle variabili da parte dei container.

---

### 🧪 **Strumenti e Metodologie**

- 👨‍💻 **Testing manuale**: l'app è stata esplorata manualmente per individuare eventuali anomalie non intercettate dai test automatici.
- 🧰 **Debugging da browser**: le **console di sviluppo** sono state utilizzate per monitorare errori JavaScript e problemi nel DOM.
- 📋 **Logging lato server**: sono stati implementati **log dettagliati** per tracciare errori e comportamenti imprevisti.
- 🔧 **Test con Postman**: grazie a Postman sono state simulate richieste CRUD verso il backend, visualizzando **request**, **response** e **codici di stato**.

---
