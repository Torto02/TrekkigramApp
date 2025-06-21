import { showToast } from "../utils/ToastUtils.js";

async function createEvent(selectors, selectedFiles = []) {
  const DateTime = new Date(
    `${$(selectors.dateInput).val()}T${$(selectors.timeInput).val()}`
  );
  const today = new Date();

  if (DateTime <= today) {
    showToast("Non puoi inserire la data odierna o precedenti.", "danger");
    return Promise.reject("Data non valida");
  }

  const eventName = $(selectors.eventName).val().trim();
  if (!eventName) {
    showToast("Inserisci un nome per l'evento", "danger");
    return Promise.reject("Nome evento mancante");
  }

  const eventLocation = $(selectors.locationInput).val().trim();
  if (!eventLocation) {
    showToast("Inserisci una località per l'evento", "danger");
    return Promise.reject("Località mancante");
  }

  const data = {
    eventName: eventName,
    eventDescription: $(selectors.eventDescription).val(),
    selectedDate: DateTime,
    eventLocation: eventLocation,
    difficulty: $(selectors.difficultySelector).val(),
    images: selectedFiles, // Aggiunti file immagine compressi
  };

  // Ritorna una Promise per la gestione asincrona
  return getCoordinatesFromAddress(eventLocation).then((coords) => {
    data.lat = coords ? coords.lat : null;
    data.lon = coords ? coords.lon : null;

    console.log("Event data ready:", data);
    // Qui andrebbe implementata la chiamata API per salvare l'evento
    return data; // Per ora ritorna solo i dati
  });
}

function getCoordinatesFromAddress(address) {
  if (!address) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    $.ajax({
      url: `https://nominatim.openstreetmap.org/search`,
      data: { format: "json", q: address, limit: 1 },
      success: (data) => {
        if (data.length > 0) {
          resolve({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          });
        } else {
          console.warn("Nessun risultato per l'indirizzo:", address);
          resolve(null);
        }
      },
      error: (xhr, status, error) => {
        console.error("Errore nel geocoding:", error);
        reject(error);
      },
    });
  });
}

function updateDifficultyLabel(difficultyValueSelector, value) {
  const difficultyLabels = {
    1: { text: "Facile", class: "bg-success" },
    2: { text: "Medio", class: "bg-warning" },
    3: { text: "Difficile", class: "bg-danger" },
  };

  const selectedDifficulty = difficultyLabels[value] || difficultyLabels[2]; // Default to medium if invalid value

  // Update the text and class of the difficulty badge
  $(difficultyValueSelector)
    .text(selectedDifficulty.text)
    .removeClass("bg-success bg-primary bg-danger")
    .addClass(selectedDifficulty.class);
}

function locationInputList(event, suggestionsListSelector, staticMapSelector) {
  const query = event.target.value.trim();
  const suggestionsList = $(suggestionsListSelector);

  if (query.length < 3) {
    suggestionsList.empty().hide();
    return;
  }

  $.ajax({
    url: `https://nominatim.openstreetmap.org/search`,
    data: {
      format: "json",
      q: query,
      addressdetails: 1,
      limit: 8, // Increased limit to get more results for better sorting
      countrycodes: "it", // Limit to Italy
      viewbox: "6.6272,47.1153,18.7844,35.4897", // Approximate bounding box for Italy
      bounded: 1, // Ensure results are inside the viewbox
    },
    success: (data) => {
      suggestionsList.empty();

      if (data.length === 0) {
        const noResults = $("<li>")
          .addClass("list-group-item text-muted")
          .html(`<em>Nessun risultato trovato per "${query}" in Italia</em>`);
        suggestionsList.append(noResults).show();
        return;
      }

      // Custom sorting to prioritize direct name matches
      const sortedResults = sortLocationResults(data, query);

      // Add a header to the suggestions list for better UI
      const header = $("<li>")
        .addClass("list-group-item list-group-item-secondary")
        .html(
          `<small><i class="bi bi-geo-alt"></i> Località in Italia</small>`
        );
      suggestionsList.append(header);

      // Take only the top 5 results after sorting
      sortedResults.slice(0, 5).forEach((place) => {
        // Extract and format location details for better display
        let displayText = "";
        let secondaryInfo = "";
        let isExactMatch = false;

        try {
          const address = place.address;

          // Primary display: city, town, village, or suburb
          const primaryName =
            address.city ||
            address.town ||
            address.village ||
            address.suburb ||
            place.name;

          // Check if this is an exact match (for highlighting)
          isExactMatch = primaryName
            .toLowerCase()
            .startsWith(query.toLowerCase());

          // Secondary info: region, state, county
          const regionInfo = address.state || address.county || address.region;

          // Format the display text, highlighting the match
          if (isExactMatch) {
            const matchLength = query.length;
            displayText = `<strong>${primaryName.substring(
              0,
              matchLength
            )}</strong>${primaryName.substring(matchLength)}`;
          } else {
            displayText = primaryName;
          }

          secondaryInfo = regionInfo
            ? `<small class="text-muted">${regionInfo}</small>`
            : "";
        } catch (e) {
          // Fallback to display_name if parsing fails
          displayText = place.display_name;
        }

        const item = $("<li>")
          .addClass("list-group-item suggestion-item")
          .css({
            cursor: "pointer",
            transition: "background-color 0.2s",
          })
          .html(
            `
            <div>
              <div>${displayText}</div>
              ${secondaryInfo ? secondaryInfo : ""}
            </div>
          `
          )
          .on("mouseenter", function () {
            $(this).addClass("active");
          })
          .on("mouseleave", function () {
            $(this).removeClass("active");
          })
          .on("click", () => {
            $(event.target).val(place.display_name);
            suggestionsList.empty().hide();

            const lat = parseFloat(place.lat);
            const lon = parseFloat(place.lon);

            // Replace static map with interactive Leaflet map
            initializeCreateEventMap(staticMapSelector, lat, lon);
          });

        // Add a special class for exact matches
        if (isExactMatch) {
          item.addClass("exact-match");
        }

        suggestionsList.append(item);
      });

      suggestionsList.show();
    },
    error: (xhr, status, error) => {
      console.error("Errore nella ricerca degli indirizzi:", error);
      suggestionsList
        .empty()
        .append(
          $("<li>")
            .addClass("list-group-item text-danger")
            .html(
              "<i class='bi bi-exclamation-triangle'></i> Errore nella ricerca. Riprova più tardi."
            )
        )
        .show();
    },
    beforeSend: function () {
      // Show loading indicator
      suggestionsList
        .empty()
        .append(
          $("<li>")
            .addClass("list-group-item text-center")
            .html("<i class='bi bi-hourglass-split'></i> Ricerca in corso...")
        )
        .show();
    },
  });
}

function sortLocationResults(results, query) {
  const queryLower = query.toLowerCase();

  return results.sort((a, b) => {
    // Extract primary names
    const nameA = extractPrimaryLocationName(a).toLowerCase();
    const nameB = extractPrimaryLocationName(b).toLowerCase();

    // Priority 1: Direct start match (e.g., "Par" → "Parma")
    const aStartsWithQuery = nameA.startsWith(queryLower);
    const bStartsWithQuery = nameB.startsWith(queryLower);

    if (aStartsWithQuery && !bStartsWithQuery) return -1;
    if (!aStartsWithQuery && bStartsWithQuery) return 1;

    // Priority 2: Contains word starting with query (e.g., "par" → "San Parmense")
    const aContainsWordStartingWith = nameA
      .split(/\s+/)
      .some((word) => word.startsWith(queryLower));
    const bContainsWordStartingWith = nameB
      .split(/\s+/)
      .some((word) => word.startsWith(queryLower));

    if (aContainsWordStartingWith && !bContainsWordStartingWith) return -1;
    if (!aContainsWordStartingWith && bContainsWordStartingWith) return 1;

    // Priority 3: Contains the query somewhere in the name
    const aContains = nameA.includes(queryLower);
    const bContains = nameB.includes(queryLower);

    if (aContains && !bContains) return -1;
    if (!aContains && bContains) return 1;

    // Priority 4: Shorter names first (prefer "Parma" over "Parma Province")
    return nameA.length - nameB.length;
  });
}

/**
 * Extract the primary location name from a place object
 * @param {Object} place - The place object from Nominatim
 * @returns {string} - The primary name
 */
function extractPrimaryLocationName(place) {
  try {
    const address = place.address;
    return (
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      place.name ||
      ""
    );
  } catch (e) {
    return place.name || place.display_name || "";
  }
}

function initializeCreateEventMap(mapSelector, lat, lon) {
  const mapId = mapSelector.replace("#", "");

  setTimeout(() => {
    // Remove existing map if present
    if (window.createEventMap) {
      window.createEventMap.remove();
      window.createEventMap = null;
    }

    // Show the map container by removing d-none class from parent
    const mapContainer = $(mapSelector).parent();
    mapContainer.removeClass("d-none").show();

    // Clear and prepare the map element
    $(mapSelector).empty().css({
      height: "400px",
      width: "100%",
    });

    try {
      // Create interactive map with same settings as event page
      window.createEventMap = L.map(mapId, {
        center: [lat, lon],
        zoom: 14,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        zoomControl: true,
        touchZoom: true,
        boxZoom: true,
        keyboard: true,
      });

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(window.createEventMap);

      // Add marker
      L.marker([lat, lon]).addTo(window.createEventMap);

      // Force map to refresh and invalidate size
      setTimeout(() => {
        if (window.createEventMap) {
          window.createEventMap.invalidateSize();
        }
      }, 100);
    } catch (error) {
      console.error("Error initializing map:", error);
      // Fallback to static map if Leaflet fails
      const mapUrl = `https://static-maps.yandex.ru/1.x/?ll=${lon},${lat}&size=600,400&z=13&l=map&pt=${lon},${lat},pm2rdm&lang=it`;
      $(mapSelector).html(
        `<img src="${mapUrl}" style="width: 100%; height: 400px; object-fit: cover;" alt="Map">`
      );
    }
  }, 200);
}

function compressImage(file, maxWidth = 1200, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // Calcola le nuove dimensioni mantenendo il rapporto
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          const ratio = maxWidth / width;
          width = maxWidth;
          height = height * ratio;
        }

        // Crea un canvas per la compressione
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        // Disegna l'immagine sul canvas
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Converti in Blob con qualità ridotta
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compressione immagine fallita"));
              return;
            }

            // Crea un nuovo file con il blob compresso
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: new Date().getTime(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Errore nel caricamento dell'immagine"));
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      reject(new Error("Errore nella lettura del file"));
    };

    reader.readAsDataURL(file);
  });
}

function renderPhotoPreviews(files, container, onRemove) {
  // Svuota il container
  container.empty();

  if (!files.length) {
    container.hide();
    return;
  }

  // Crea il container per la griglia di anteprime
  const previewGrid = $('<div class="row g-3"></div>');

  // Aggiungi contatore delle foto
  const photoCounter = $(`
    <div class="photo-counter mb-3">
      <i class="bi bi-images"></i>
      <span>${files.length} ${
    files.length === 1 ? "foto" : "foto"
  } selezionata${files.length === 1 ? "" : "e"}</span>
    </div>
  `);

  container.append(photoCounter);

  // Crea le anteprime per ogni file con un delay per l'animazione
  files.forEach((file, index) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const previewCol = $('<div class="col-4 col-md-3 col-lg-3"></div>');
      const previewCard = $(`
        <div class="preview-card" style="animation-delay: ${index * 50}ms">
          <img src="${e.target.result}" alt="Anteprima immagine">
          <button type="button" class="remove-image" aria-label="Rimuovi immagine">
            <i class="bi bi-x"></i>
          </button>
        </div>
      `);

      // Aggiungi evento per rimozione immagine
      previewCard.find(".remove-image").on("click", (event) => {
        event.stopPropagation(); // Previene la propagazione dell'evento

        // Animazione di uscita
        const card = $(event.currentTarget).closest(".preview-card");
        card.css({
          transform: "scale(0.8)",
          opacity: "0",
        });

        // Rimuovi dopo l'animazione
        setTimeout(() => {
          if (typeof onRemove === "function") {
            onRemove(index);
          }
        }, 300);
      });

      previewCol.append(previewCard);
      previewGrid.append(previewCol);
    };

    reader.readAsDataURL(file);
  });

  container.append(previewGrid).show();
}
export {
  createEvent,
  updateDifficultyLabel,
  locationInputList,
  compressImage,
  renderPhotoPreviews,
  initializeCreateEventMap,
};
