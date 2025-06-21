export function showToast(message, type = "info", duration = 5000) {
  // Default duration aggiornato a 5000
  // Assicurati che esista un contenitore per i toast, altrimenti crealo.
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    // Usa classi Bootstrap per posizionare il contenitore
    toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
    toastContainer.style.zIndex = "1100"; // Assicura che sia sopra altri elementi
    document.body.appendChild(toastContainer);
  }

  // Crea l'elemento toast
  const toastElement = document.createElement("div");
  // Usa il parametro 'type' per impostare la classe di colore Bootstrap (es. text-bg-success)
  toastElement.className = `toast align-items-center text-bg-${type} border-0`;
  toastElement.setAttribute("role", "alert");
  toastElement.setAttribute("aria-live", "assertive");
  toastElement.setAttribute("aria-atomic", "true");

  // Struttura interna del toast con messaggio e pulsante di chiusura
  toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

  // Aggiungi il toast al contenitore
  toastContainer.appendChild(toastElement);

  // Inizializza il componente Toast di Bootstrap
  const bootstrapToast = new bootstrap.Toast(toastElement, {
    delay: duration, // Usa la durata passata o il default
    autohide: true,
  });

  // Mostra il toast
  bootstrapToast.show();

  // Rimuovi l'elemento dal DOM dopo che è stato nascosto
  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
}
