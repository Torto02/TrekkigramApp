import { Presenter } from "./Presenter.js";
import * as CreateEventUtils from "../utils/CreateEventUtils.js";
import { showToast } from "../utils/ToastUtils.js";

export class CreateEventPresenter extends Presenter {
  constructor(router) {
    super(router);
    this.selectors = {
      createEventBtn: ".create-event-btn",
      eventName: "#eventName",
      locationInput: "#event-location",
      suggestionsList: "#address-suggestions",
      staticMap: "#static-map",
      mapContainer: "#map-container",
      photoInput: "#event-photo",
      photoPreviews: "#photo-previews",
      uploadTrigger: "#upload-trigger",
      difficultySelector: "#eventDifficulty",
      difficultyValue: "#difficulty-value",
      dateInput: "#eventDate",
      timeInput: "#eventTime",
      eventDescription: "#eventDescription",
    };

    // Inizializzo elementi DOM
    Object.entries(this.selectors).forEach(([key, selector]) => {
      this[key] = $(selector);
    });

    this.searchTimeout = null;
    this.selectedFiles = [];
    this.maxPhotos = 10;
    this.lastFileCount = 0; // Traccia il numero di file precedente

    this.init();
  }

  async bindEvents() {
    this.createEventBtn.on("click", () => {
      this.createEvent();
    });

    this.difficultySelector.on("input", () => {
      const value = this.difficultySelector.val();
      CreateEventUtils.updateDifficultyLabel(
        this.selectors.difficultyValue,
        value
      );
    });

    this.locationInput.on("input", (e) => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(
        () =>
          CreateEventUtils.locationInputList(
            e,
            this.selectors.suggestionsList,
            this.selectors.staticMap
          ),
        500
      );
    });

    // Gestione caricamento immagini - approccio multiplo per compatibilità
    this.setupImageUpload();

    // Set minimum date to today to prevent selecting past dates
    const today = new Date().toISOString().split("T")[0];
    this.dateInput.attr("min", today);

    const initialDifficulty = this.difficultySelector.val();
    CreateEventUtils.updateDifficultyLabel(
      this.selectors.difficultyValue,
      initialDifficulty
    );
  }

  setupImageUpload() {
    const fileInput = this.photoInput[0];

    // Rimuovi tutti i listener esistenti per evitare duplicati
    this.photoInput.off();
    this.uploadTrigger.off();

    // Rimuovi anche i listener globali se esistono
    document.removeEventListener("visibilitychange", this.visibilityHandler);
    $(window).off("focus.fileupload");

    // Flag per prevenire elaborazioni multiple
    this.isProcessingFiles = false;
    this.processedFileSignature = null;

    // Listener principale per il change
    this.photoInput.on("change", (e) => {
      console.log("Change event triggered");
      this.handleImageUploadWithDeduplication(e);
    });

    // Listener per Safari (solo se change non funziona)
    let safariTimeout;
    this.photoInput.on("input", (e) => {
      console.log("Input event triggered");
      clearTimeout(safariTimeout);
      safariTimeout = setTimeout(() => {
        if (!this.isProcessingFiles) {
          this.handleImageUploadWithDeduplication(e);
        }
      }, 100);
    });

    // Trigger per l'upload
    this.uploadTrigger.on("click", (e) => {
      e.preventDefault();
      console.log("Upload trigger clicked");

      // Reset dell'input e flag
      fileInput.value = "";
      this.lastFileCount = 0;
      this.isProcessingFiles = false;
      this.processedFileSignature = null;

      // Simula il click sull'input file
      fileInput.click();
    });

    // Listener per visibility change (solo per Safari, con debounce)
    this.visibilityHandler = () => {
      if (!document.hidden && !this.isProcessingFiles) {
        setTimeout(() => {
          const currentFileCount = fileInput.files.length;
          if (currentFileCount > 0 && currentFileCount !== this.lastFileCount) {
            console.log(
              "Visibility change - files detected:",
              currentFileCount
            );
            this.handleImageUploadWithDeduplication({ target: fileInput });
          }
        }, 300);
      }
    };

    document.addEventListener("visibilitychange", this.visibilityHandler);
  }

  // Nuovo metodo con deduplicazione
  async handleImageUploadWithDeduplication(e) {
    const files = Array.from(e.target.files);

    if (!files.length) {
      console.log("No files selected");
      return;
    }

    // Crea una signature unica per questo set di file
    const fileSignature = files
      .map((f) => `${f.name}-${f.size}-${f.lastModified}`)
      .join("|");

    // Se stiamo già processando questi stessi file, esci
    if (
      this.isProcessingFiles ||
      this.processedFileSignature === fileSignature
    ) {
      console.log(
        "Files already being processed or already processed, skipping..."
      );
      return;
    }

    // Imposta i flag per prevenire elaborazioni multiple
    this.isProcessingFiles = true;
    this.processedFileSignature = fileSignature;
    this.lastFileCount = files.length;

    console.log(
      `Processing ${
        files.length
      } files with signature: ${fileSignature.substring(0, 50)}...`
    );

    try {
      await this.handleImageUpload(e);
    } finally {
      // Reset del flag dopo l'elaborazione
      setTimeout(() => {
        this.isProcessingFiles = false;
        // Non resettare processedFileSignature subito per evitare riprocessing
      }, 1000);
    }
  }

  async handleImageUpload(e) {
    console.log("handleImageUpload called");
    const files = Array.from(e.target.files);

    if (!files.length) {
      console.log("No files selected");
      return;
    }

    console.log(`Processing ${files.length} files`);

    if (this.selectedFiles.length + files.length > this.maxPhotos) {
      showToast(`Puoi caricare al massimo ${this.maxPhotos} foto.`, "danger");
      return;
    }

    let processedCount = 0;
    for (const file of files) {
      if (!file.type.match("image.*")) {
        console.error("Il file selezionato non è un'immagine:", file.name);
        showToast(`${file.name} non è un'immagine valida`, "warning");
        continue;
      }

      // Controlla se il file è già stato aggiunto (doppio controllo)
      const fileExists = this.selectedFiles.some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified
      );

      if (fileExists) {
        console.log(`File ${file.name} already exists, skipping...`);
        continue;
      }

      try {
        console.log(`Compressing image: ${file.name}`);
        const compressedFile = await CreateEventUtils.compressImage(file);
        this.selectedFiles.push(compressedFile);
        processedCount++;
        console.log(`Image ${file.name} processed successfully`);
      } catch (error) {
        console.error("Errore durante l'elaborazione dell'immagine:", error);
        showToast(`Errore nell'elaborare ${file.name}`, "danger");
      }
    }

    if (processedCount > 0) {
      // Aggiorna le anteprime
      CreateEventUtils.renderPhotoPreviews(
        this.selectedFiles,
        this.photoPreviews,
        (index) => this.removeImage(index)
      );
    }

    // Reset dell'input
    setTimeout(() => {
      e.target.value = "";
      // Reset della signature dopo un po' per permettere nuove selezioni
      setTimeout(() => {
        this.processedFileSignature = null;
      }, 2000);
    }, 100);
  }

  removeImage(index) {
    if (index >= 0 && index < this.selectedFiles.length) {
      this.selectedFiles.splice(index, 1);
      CreateEventUtils.renderPhotoPreviews(
        this.selectedFiles,
        this.photoPreviews,
        (index) => this.removeImage(index)
      );
    }
  }

  async createEvent() {
    try {
      // Passa i dati necessari, incluse le immagini selezionate
      const eventData = await CreateEventUtils.createEvent(
        this.selectors,
        this.selectedFiles
      );

      // Modifica qui: creiamo un FormData per inviare i file
      const formData = new FormData();

      // Aggiungiamo i dati dell'evento al FormData
      formData.append("eventName", eventData.eventName);
      formData.append("eventDescription", eventData.eventDescription);
      formData.append("eventLocation", eventData.eventLocation);
      formData.append("eventDifficulty", eventData.difficulty);
      formData.append("eventDateTime", eventData.selectedDate.toISOString());

      if (eventData.lat && eventData.lon) {
        formData.append("Latitude", eventData.lat);
        formData.append("Longitude", eventData.lon);
      }

      // Aggiungiamo le immagini al FormData
      if (this.selectedFiles && this.selectedFiles.length > 0) {
        this.selectedFiles.forEach((file) => {
          formData.append(`eventPhotos[]`, file);
        });
      }
      console.log("Dati evento da inviare:", {
        name: formData.get("eventName"),
        desc: formData.get("eventDescription"),
        location: formData.get("eventLocation"),
        difficulty: formData.get("eventDifficulty"),
        dateTime: formData.get("eventDateTime"),
        lat: formData.get("Latitude"),
        lon: formData.get("Longitude"),
        photos: formData.getAll("eventPhotos[]").length,
      });

      // Inviamo il FormData invece di JSON
      const response = await this.makeRequest(
        "/events/create",
        "POST",
        formData
      );

      if (response && response.success) {
        console.log("Evento creato con successo:", response);
        if (response) showToast("Evento creato con successo!", "success");

        this.router.navigate("/");
      }
    } catch (error) {
      console.error("Errore durante la creazione dell'evento:", error);
    }
  }

  // Cleanup quando si esce dalla pagina
  destroy() {
    $(window).off("focus.fileupload");
    document.removeEventListener("visibilitychange", this.visibilityHandler);
    if (super.destroy) {
      super.destroy();
    }
  }
}
