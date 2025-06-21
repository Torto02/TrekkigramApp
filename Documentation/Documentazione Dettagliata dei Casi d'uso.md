# Documentazione Dettagliata dei Casi d'uso

---

## Sezione 1: Autenticazione

| **UC1: Registrazione** |  |
| --- | --- |
| **Attore principale** | Visitatore (utente non autenticato) |
| **Descrizione** | Permette ad un nuovo utente di creare un account nel sistema |
| **Precondizioni** | L'utente non è registrato nel sistema |
| **Flusso principale** | 1. L'utente accede alla pagina di registrazione<br>2. Il sistema mostra un form con i campi richiesti <br>3. L'utente compila i campi e opzionalmente carica un'immagine del profilo<br>4. L'utente invia il form<br>5. Il sistema verifica che tutti i campi obbligatori siano stati compilati<br>6. Il sistema verifica che l'email non sia già associata ad un altro account<br>7. Il sistema verifica che l'username non sia già utilizzato<br>8. Il sistema verifica che le password coincidano<br>9. Il sistema crea un nuovo account e genera un token di sessione<br>10. Il sistema reindirizza l'utente alla home page | 
| **Postcondizioni** | L'utente è registrato e autenticato nel sistema |
| **Flussi alternativi** | **• A1: Dati mancanti o non validi**<br>1. Il sistema mostra un messaggio di errore<br>2. L'utente corregge i dati e riprova<br>**• A2: Email già esistente**<br>1. Il sistema notifica che l'email è già registrata<br>2. L'utente inserisce un'altra email o va alla pagina di login<br>**• A3: Username già utilizzato**<br>1. Il sistema notifica che lo username è già in uso<br>2. L'utente sceglie un altro username  | |


| **UC2: Login** |  |
| --- | --- |
| **Attore principale** | Visitatore |
| **Descrizione** | Permette ad un utente registrato di autenticarsi nel sistema |
| **Precondizioni** | L'utente possiede un account nel sistema |
| **Flusso principale** | 1. L'utente accede alla pagina di login<br>2. Il sistema mostra un form con campi per email e password<br>3. L'utente inserisce le proprie credenziali<br>4. L'utente invia il form<br>5. Il sistema verifica la correttezza delle credenziali<br>6. Il sistema genera un nuovo token di sessione<br>7. Il sistema reindirizza l'utente alla home page | |
| **Postcondizioni** | L'utente è autenticato nel sistema |
| **Flussi alternativi** | **• A1: Credenziali non valide**<br>1. Il sistema mostra un messaggio di errore<br>2. L'utente corregge le credenziali o segue il flusso di recupero password | |

| **UC3: Logout** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette ad un utente autenticato di terminare la sessione |
| **Precondizioni** | L'utente è autenticato nel sistema |
| **Flusso principale** | 1. L'utente seleziona l'opzione di logout<br>2. Il sistema invalida il token di sessione corrente<br>3. Il sistema reindirizza l'utente alla pagina di login | |
| **Postcondizioni** | La sessione dell'utente è terminata |

## Sezione 2: User

| **UC4: Aggiorna Profilo** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di modificare le informazioni del proprio profilo |
| **Precondizioni** | L'utente è autenticato nel sistema |
| **Flusso principale** | 1. L'utente accede alla pagina del proprio profilo<br>2. L'utente seleziona l'opzione di modifica profilo<br>3. Il sistema mostra un form con i campi modificabili (descrizione, privacy, immagine profilo)<br>4. L'utente modifica i dati desiderati<br>5. L'utente invia il form<br>6. Il sistema aggiorna il profilo con le nuove informazioni<br>7. Il sistema mostra il profilo aggiornato | |
| **Postcondizioni** | Il profilo dell'utente è aggiornato |

| **UC5: Cerca Utenti** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di cercare altri utenti nel sistema |
| **Precondizioni** | L'utente è autenticato nel sistema |
| **Flusso principale** | 1. L'utente accede alla funzione di ricerca<br>2. L'utente inserisce un termine di ricerca (nome utente)<br>3. Il sistema cerca utenti che corrispondono al termine<br>4. Il sistema mostra i risultati della ricerca | |
| **Postcondizioni** | Il sistema mostra i risultati della ricerca |
| **Flussi alternativi** | **• A1: Nessun utente trovato**<br>1. Il sistema mostra un messaggio che indica<br>che nessun utente corrisponde alla ricerca | |

| **UC6: Visualizza Profilo** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di visualizzare il proprio profilo o quello di altri utenti |
| **Precondizioni** | L'utente è autenticato nel sistema |
| **Flusso principale** | 1. L'utente seleziona un profilo da visualizzare (proprio o di altro utente)<br>2. Il sistema mostra le informazioni del profilo selezionato<br>3. Il sistema mostra gli eventi creati dall'utente o a cui partecipa, in base alla tab selezionata | |
| **Postcondizioni** | Il sistema mostra le informazioni del profilo richiesto |
| **Flussi alternativi** | **• A1: Profilo privato**<br>1. Se il profilo è privato e l'utente non è amico, il sistema mostra solo informazioni di base |<br>

## Sezione 3: Gestione Amicizie 

| **UC7_1: Invia richiesta di amicizia** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di inviare una richiesta di amicizia ad un altro utente |
| **Precondizioni** | L'utente è autenticato e sta visualizzando il profilo di un altro utente non ancora amico |
| **Flusso principale** | 1. L'utente seleziona "Invia richiesta di amicizia" dal profilo di un altro utente<br>2. Il sistema verifica che non esista già una richiesta o amicizia<br>3. Il sistema crea una nuova richiesta di amicizia<br>4. Il sistema notifica l'invio della richiesta | |
| **Postcondizioni** | Una richiesta di amicizia è inviata al destinatario |
| **Flussi alternativi** | **• A1: Richiesta già esistente**<br>1. Il sistema notifica che esiste già una richiesta pendente<br>**• A2: Già amici**<br>1. Il sistema notifica che gli utenti sono già amici | |

| **UC7_2: Accetta Richiesta di Amicizia** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di accettare una richiesta di amicizia ricevuta |
| **Precondizioni** | L'utente ha ricevuto una richiesta di amicizia |
| **Flusso principale** | 1. L'utente accede alla lista delle richieste di amicizia<br>2. L'utente seleziona di accettare una specifica richiesta<br>3. Il sistema aggiorna lo stato dell'amicizia come accettata<br>4. Il sistema notifica l'accettazione al mittente | |
| **Postcondizioni** | I due utenti sono amici |

| **UC7_3: Rifiuta Richiesta di Amicizia** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di rifiutare una richiesta di amicizia ricevuta |
| **Precondizioni** | L'utente ha ricevuto una richiesta di amicizia |
| **Flusso principale** | 1. L'utente accede alla lista delle richieste di amicizia<br>2. L'utente seleziona di rifiutare una specifica richiesta<br>3. Il sistema rimuove la richiesta di amicizia | |
| **Postcondizioni** | La richiesta di amicizia è rifiutata |

| **UC7_4: Cancella Richiesta di Amicizia** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di cancellare una richiesta di amicizia inviata |
| **Precondizioni** | L'utente ha inviato una richiesta di amicizia non ancora accettata |
| **Flusso principale** | 1. L'utente accede al profilo di un utente a cui ha inviato una richiesta<br>2. L'utente seleziona di cancellare la richiesta pendente<br>3. Il sistema rimuove la richiesta di amicizia | |
| **Postcondizioni** | La richiesta di amicizia è rimossa |

| **UC7_5: Elimina Amicizia** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di terminare un'amicizia esistente |
| **Precondizioni** | L'utente è amico con un altro utente |
| **Flusso principale** | 1. L'utente accede al profilo di un amico<br>2. L'utente seleziona di rimuovere l'amicizia<br>3. Il sistema chiede conferma dell'azione<br>4. L'utente conferma<br>5. Il sistema rimuove la relazione di amicizia | |
| **Postcondizioni** | L'amicizia è rimossa |

## Sezione 4: Gestione Eventi 

| **UC8: Crea Evento** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di creare un nuovo evento di trekking |
| **Precondizioni** | L'utente è autenticato nel sistema |
| **Flusso principale** | 1. L'utente seleziona l'opzione per creare un nuovo evento<br>2. Il sistema mostra un form con i campi necessari (nome, descrizione, luogo, data e ora, difficoltà)<br>3. L'utente compila i campi e opzionalmente aggiunge coordinate geografiche e immagini<br>4. L'utente invia il form<br>5. Il sistema verifica la validità dei dati<br>6. Il sistema crea un nuovo evento<br>7. Il sistema mostra i dettagli dell'evento creato | |
| **Postcondizioni** | Un nuovo evento è creato nel sistema |
| **Flussi alternativi** | **• A1: Dati mancanti o non validi**<br>1. Il sistema notifica quali dati sono mancanti o non validi<br>2. L'utente corregge i dati e riprova | |

| **UC9: Visualizza Eventi** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di visualizzare gli eventi disponibili |
| **Precondizioni** | L'utente è autenticato nel sistema |
| **Flusso principale** | 1. L'utente accede alla sezione eventi<br>2. Il sistema mostra una lista di eventi, con impostazione predefinita "per te"<br>3. L'utente può scorrere gli eventi e cambiare la visualizzazione tra "per te" e "seguiti” | |
| **Postcondizioni** | Il sistema mostra la lista degli eventi richiesti |

| **UC10: Filtra Eventi** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di applicare filtri alla lista degli eventi |
| **Precondizioni** | L'utente sta visualizzando la lista degli eventi |
| **Flusso principale** | 1. L'utente seleziona i filtri da applicare (difficoltà, data inizio, data fine, regione)<br>2. Il sistema aggiorna la lista degli eventi secondo i filtri applicati | |
| **Postcondizioni** | Il sistema mostra la lista filtrata di eventi |

| **UC11: Visualizza Dettagli Evento** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di visualizzare informazioni dettagliate su un evento |
| **Precondizioni** | L'utente è autenticato nel sistema |
| **Flusso principale** | 1. L'utente seleziona un evento dalla lista<br>2. Il sistema mostra tutti i dettagli dell'evento<br>3. Il sistema mostra lo stato di partecipazione dell'utente<br>4. Il sistema mostra la lista dei partecipanti | |
| **Postcondizioni** | Il sistema mostra i dettagli completi dell'evento |

| **UC12: Modifica Evento** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette al creatore di modificare un evento esistente |
| **Precondizioni** | L'utente è autenticato ed è il creatore dell'evento |
| **Flusso principale** | 1. L'utente accede ai dettagli di un evento che ha creato<br>2. L'utente seleziona l'opzione per modificare l'evento<br>3. Il sistema mostra un form precompilato con i dati attuali<br>4. L'utente modifica i campi desiderati<br>5. L'utente invia il form<br>6. Il sistema aggiorna l'evento con le nuove informazioni<br>7. Il sistema mostra i dettagli aggiornati dell'evento | |
| **Postcondizioni** | L'evento è aggiornato nel sistema |
| **Flussi alternativi** | **• A1: Utente non è il creatore**<br>1. Il sistema non mostra l'opzione di modifica<br>**• A2: Dati non validi**<br>1. Il sistema notifica l'errore<br>2. L'utente corregge i dati e riprova | |

| **UC13: Elimina Evento** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette al creatore di eliminare un evento esistente |
| **Precondizioni** | L'utente è autenticato ed è il creatore dell'evento |
| **Flusso principale** | 1. L'utente accede ai dettagli di un evento che ha creato<br>2. L'utente seleziona l'opzione per eliminare l'evento<br>3. Il sistema richiede conferma dell'eliminazione<br>4. L'utente conferma l'eliminazione<br>5. Il sistema elimina l'evento e tutte le partecipazioni associate<br>6. Il sistema reindirizza l'utente alla lista eventi | |
| **Postcondizioni** | L'evento è rimosso dal sistema |
| **Flussi alternativi** | **• A1: Utente non è il creatore**<br>1. Il sistema non mostra l'opzione di eliminazione<br>**• A2: Utente annulla l'eliminazione**<br>1. Il sistema mantiene l'evento e mostra i dettagli |<br>## Sezione 5: Gestione Partecipazioni |

| **UC14: Partecipa a Evento** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di iscriversi a un evento |
| **Precondizioni** | L'utente è autenticato e sta visualizzando i dettagli di un evento a cui non partecipa |
| **Flusso principale** | 1. L'utente seleziona l'opzione "Partecipa" dall'evento<br>2. Il sistema verifica che l'utente non sia già iscritto<br>3. Il sistema registra la partecipazione<br>4. Il sistema aggiorna lo stato di partecipazione visualizzato | |
| **Postcondizioni** | L'utente è registrato come partecipante all'evento |
| **Flussi alternativi** | **• A1: Utente già iscritto**<br>1. Il sistema notifica che l'utente è già iscritto | |

| **UC15: Annulla Partecipazione** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di annullare la partecipazione a un evento |
| **Precondizioni** | L'utente è autenticato e partecipa all'evento |
| **Flusso principale** | 1. L'utente seleziona l'opzione per annullare la partecipazione<br>2. Il sistema richiede conferma<br>3. L'utente conferma l'annullamento<br>4. Il sistema rimuove la partecipazione<br>5. Il sistema aggiorna lo stato di partecipazione visualizzato | |
| **Postcondizioni** | La partecipazione dell'utente è rimossa |
| **Flussi alternativi** | **• A1: Utente non iscritto**<br>1. Il sistema notifica che l'utente non è iscritto all'evento | |

| **UC16: Invita Amici a Evento** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di invitare amici a partecipare a un evento |
| **Precondizioni** | L'utente è autenticato e sta visualizzando i dettagli di un evento |
| **Flusso principale** | 1. L'utente seleziona l'opzione per invitare amici<br>2. Il sistema mostra la lista degli amici con il loro stato rispetto all'evento<br>3. L'utente seleziona gli amici da invitare<br>4. L'utente conferma l'invio degli inviti<br>5. Il sistema invia gli inviti agli amici selezionati<br>6. Il sistema aggiorna lo stato degli inviti | |
| **Postcondizioni** | Gli inviti sono inviati agli amici selezionati |
| **Flussi alternativi** | **• A1: Amico già invitato**<br>1. Il sistema notifica che l'amico è già stato invitato<br>**• A2: Amico già partecipante**<br>1. Il sistema notifica che l'amico è già iscritto all'evento | |

| **UC17: Visualizza Partecipanti** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di visualizzare chi partecipa a un evento |
| **Precondizioni** | L'utente è autenticato e sta visualizzando i dettagli di un evento |
| **Flusso principale** | 1. L'utente seleziona l'opzione per visualizzare i partecipanti<br>2. Il sistema mostra la lista completa dei partecipanti all'evento | |
| **Postcondizioni** | Il sistema mostra la lista dei partecipanti |

### UC18: Gestisci Inviti a Eventi

| **UC18_1: Accetta Invito a Evento** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di accettare un invito a partecipare a un evento |
| **Precondizioni** | L'utente ha ricevuto un invito a un evento |
| **Flusso principale** | 1. L'utente seleziona di accettare un invito specifico<br>2. Il sistema registra la partecipazione dell'utente all'evento<br>3. Il sistema rimuove l'invito dalla lista<br>4. Il sistema aggiorna lo stato dell'utente come partecipante | |
| **Postcondizioni** | L'utente è registrato come partecipante all'evento |

| **UC18_2:** Rifiuta Invito a Evento |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di rifiutare un invito a partecipare a un evento |
| **Precondizioni** | L'utente ha ricevuto un invito a un evento |
| **Flusso principale** | 1. L'utente seleziona di rifiutare un invito specifico<br>2. Il sistema rimuove l'invito<br>3. Il sistema aggiorna la lista degli inviti | |
| **Postcondizioni** | L'invito è rimosso dalla lista dell'utente |

| **UC19: Visualizza Eventi Attivi** |  |
| --- | --- |
| **Attore principale** | Utente Autenticato |
| **Descrizione** | Permette all'utente di visualizzare gli eventi futuri a cui partecipa |
| **Precondizioni** | L'utente è autenticato nel sistema |
| **Flusso principale** | 1. L'utente accede alla sezione delle partecipazioni attive<br>2. Il sistema recupera tutti gli eventi futuri a cui l'utente è iscritto<br>3. Il sistema mostra la lista degli eventi attivi con i relativi dettagli | |
| **Postcondizioni** | Il sistema mostra la lista degli eventi attivi dell'utente |
| **Flussi alternativi** | **• A1: Nessun evento attivo**<br>1. Il sistema mostra un messaggio che indica che l'utente non ha partecipazioni attive | |
