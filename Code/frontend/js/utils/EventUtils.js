function renderEvent(event, selectors, router) {
  // Hide all modals at start
  hideAllModals();

  $(selectors.title).text(event.EventName || "Titolo non disponibile");

  // Aggiornamento per gestire l'immagine del profilo del creatore
  $(selectors.author).text(event.CreatorUsername || "Autore non disponibile");

  // Rimuovi event listener esistenti prima di aggiungerne di nuovi
  $(selectors.creatorBadge).off("click");
  $(selectors.creatorBadge).on("click", function () {
    router.navigate(`/user/${event.CreatorUsername}`);
  });

  // Imposta l'immagine del profilo se disponibile
  if (event.CreatorProfilePicture) {
    const image = JSON.parse(event.CreatorProfilePicture);
    $(".creator-profile-img").attr("src", `../../src/img/UserImg/${image}`);
  } else {
    $(".creator-profile-img").attr("src", "/src/img/default-profile.png");
  }

  if (event.DateTime) {
    const dateObj = new Date(event.DateTime);
    if (!isNaN(dateObj)) {
      const datePart = dateObj.toLocaleDateString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const timePart = dateObj.toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      });

      $(selectors.date)
        .text(`${datePart} ${timePart}`)
        .attr("data-datetime", dateObj.toISOString()); // Salviamo il formato valido
    } else {
      $(selectors.date).text("Date not available");
    }
  }

  $(selectors.location).text(event.Location || "Location not available");
  $(selectors.difficulty).text(
    event.Difficulty != null
      ? `${getDifficultyText(event.Difficulty)}`
      : "Difficulty not available"
  );
  $(selectors.description).text(
    event.EventDescription || "No description available"
  );

  renderImages(event.EventImages, selectors);
  renderMap(event, selectors);
  loadEventActions(event, selectors, router);
}

function getDifficultyText(difficultyValue) {
  switch (difficultyValue) {
    case 1:
    case "1":
      return "Facile";
    case 2:
    case "2":
      return "Medio";
    case 3:
    case "3":
      return "Difficile";
    default:
      return difficultyValue;
  }
}

function loadEventActions(event, selectors, router) {
  const isOwner = event.CreatorID == localStorage.getItem("UserId");

  if (isOwner) {
    $(selectors.editEventBtn)
      .removeClass("d-none")
      .off("click")
      .on("click", () => {
        showEditEventModal(selectors, router);
      });

    // Hide participation button for event creator
    $(selectors.participationBtn).addClass("d-none");
  } else {
    // Show participation button for non-creators
    $(selectors.participationBtn).removeClass("d-none");
  }

  const isEventPast = event?.DateTime && new Date(event.DateTime) < new Date();
  if (isEventPast) {
    $(selectors.editEventBtn).prop("disabled", isEventPast);
    $(selectors.inviteBtn).prop("disabled", isEventPast);
    $(selectors.participationBtn).prop("disabled", isEventPast);
    $(selectors.participationBtn).text("Evento concluso");
  }

  // Only configure participation button if user is not the owner
  if (!isOwner) {
    switch (event.subscribed) {
      case "participate":
        $(selectors.participationBtn)
          .text("Disiscriviti")
          .off("click")
          .on("click", () => {
            router.currentPresenter.handleParticipation("unsubscribe");
          });
        break;
      default:
        $(selectors.participationBtn)
          .text("Iscriviti")
          .off("click")
          .on("click", () => {
            router.currentPresenter.handleParticipation("subscribe");
          });
    }
  }

  $(selectors.partecipantsBtn)
    .off("click")
    .on("click", () => {
      router.currentPresenter.viewParticipants(event.EventID);
    });

  $(selectors.inviteBtn)
    .off("click")
    .on("click", () => {
      router.currentPresenter.getInvitationsList(event.EventID);
    });
}

function hideAllModals() {
  $("#participantsModal").removeClass("show");
  $("#friendInvitationsModal").removeClass("show");
  $("#editEventModal").removeClass("show");
  $("#deleteConfirmModal").removeClass("show");
  $("#imageViewerModal").hide();
}

function showEditEventModal(selectors, router) {
  // Hide other modals first
  hideAllModals();

  $("#eventName").val($(selectors.title).text() || "");
  $("#eventDescription").val($(selectors.description).text() || "");

  if (selectors.date) {
    const isoDateStr = $(selectors.date).attr("data-datetime");
    if (isoDateStr) {
      const dateObj = new Date(isoDateStr);
      const formattedDate = dateObj.toISOString().slice(0, 16);
      $("#eventDate").val(formattedDate);
    }
  }

  // Set minimum date to today to prevent selecting past dates
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);
  $("#eventDate").attr("min", minDateTime);

  // Estrai il valore numerico della difficoltà dal testo
  const difficultyText = $(selectors.difficulty).text();
  let difficultyValue = "1"; // Default a "Facile"

  if (difficultyText.includes("Facile")) {
    difficultyValue = "1";
  } else if (difficultyText.includes("Medio")) {
    difficultyValue = "2";
  } else if (difficultyText.includes("Difficile")) {
    difficultyValue = "3";
  }

  $("#eventDifficulty").val(difficultyValue);
  $("#editEventModal").addClass("show");

  // Prevent form submission from reloading the page
  $("#editEventForm")
    .off("submit")
    .on("submit", function (e) {
      e.preventDefault();
    });

  // Close modal when clicking outside or on close button
  $("#editEventModal")
    .off("click")
    .on("click", function (e) {
      if (
        $(e.target).is("#editEventModal") ||
        $(e.target).hasClass("modal-close")
      ) {
        $("#editEventModal").removeClass("show");
      }
    });

  $("#editEventModal .modal-close, .cancel-edit-btn")
    .off("click")
    .on("click", () => $("#editEventModal").removeClass("show"));

  $("#saveEventChangesBtn")
    .off("click")
    .on("click", () => {
      // Validate date before saving
      const selectedDate = new Date($("#eventDate").val());
      const today = new Date();

      if (selectedDate <= today) {
        alert(
          "Non puoi impostare una data nel passato o uguale a oggi. Seleziona una data futura."
        );
        return;
      }

      router.currentPresenter.editEvent();
      $("#editEventModal").removeClass("show");
    });

  $("#deleteEventBtn")
    .off("click")
    .on("click", () => $("#deleteConfirmModal").addClass("show"));

  // Close delete confirmation modal when clicking outside or on close button
  $("#deleteConfirmModal")
    .off("click")
    .on("click", function (e) {
      if (
        $(e.target).is("#deleteConfirmModal") ||
        $(e.target).hasClass("modal-close")
      ) {
        $("#deleteConfirmModal").removeClass("show");
      }
    });

  $("#deleteConfirmModal .modal-close, .cancel-delete-btn")
    .off("click")
    .on("click", () => $("#deleteConfirmModal").removeClass("show"));

  $("#confirmDeleteBtn")
    .off("click")
    .on("click", () => {
      router.currentPresenter.deleteEvent();
      $("#editEventModal").removeClass("show");
      $("#deleteConfirmModal").removeClass("show");
    });
}

function renderImages(images, selectors) {
  let imagesArray = [];
  try {
    // Verifica se images è già un array o una stringa JSON
    if (Array.isArray(images)) {
      imagesArray = images;
    } else if (typeof images === "string") {
      imagesArray = JSON.parse(images);
    } else if (images) {
      // Se non è né un array né una stringa ma esiste, prova a convertirlo in stringa
      imagesArray = JSON.parse(JSON.stringify(images));
    }
  } catch (e) {
    console.error("Error while parsing images:", e);
  }

  if (imagesArray && imagesArray.length > 0) {
    $(selectors.imageContainer).attr(
      "src",
      `/src/img/eventImg/${imagesArray[0]}`
    );
  } else {
    $(selectors.imageContainer).attr("src", "/src/img/eventDefault.png").css({
      "object-fit": "contain",
      "background-color": "#f8f9fa",
      padding: "20px",
    });
  }
  renderGallery(imagesArray, selectors);
}

function renderGallery(images, selectors) {
  const galleryContainer = $(selectors.imageGallery);
  galleryContainer.empty();
  if (!images || images.length === 0) {
    galleryContainer.html(
      '<p class="text-muted text-center py-3">Nessuna immagine disponibile</p>'
    );
    return;
  }
  images.forEach((image, index) => {
    const imageUrl = `/src/img/eventImg/${image}`;
    const galleryItem = $(`
      <div class="gallery-item shadow-sm" data-index="${index}">
        <img src="${imageUrl}" alt="Immagine evento ${index + 1}">
      </div>
    `);
    // Attiva il visualizzatore di immagini al click
    galleryItem.on("click", () => openImageViewer(images, index, selectors));
    galleryContainer.append(galleryItem);
  });
}

function openImageViewer(images, startIndex, selectors) {
  const imageViewerModal = $(selectors.imageViewerModal);
  const fullImageCarousel = $(selectors.fullImageCarousel);

  fullImageCarousel.data("currentIndex", startIndex);
  fullImageCarousel.data("images", images);

  updateViewerImage(images, startIndex, selectors);

  // Prevent body scroll
  $("body").addClass("image-viewer-open");

  imageViewerModal.fadeIn(300);
}

export function updateViewerImage(images, index, selectors) {
  const carousel = $(selectors.fullImageCarousel);
  const imageUrl = `/src/img/eventImg/${images[index]}`;

  // Aggiorna l'immagine
  carousel
    .empty()
    .append(`<img src="${imageUrl}" alt="Immagine evento ${index + 1}">`);

  // Aggiorna il contatore
  $(selectors.imageCounter).text(`${index + 1}/${images.length}`);
}

export function navigateImages(direction, selectors) {
  const carousel = $(selectors.fullImageCarousel);
  const images = carousel.data("images");
  let currentIndex = carousel.data("currentIndex");
  const totalImages = images.length;

  if (direction === "prev") {
    currentIndex = (currentIndex - 1 + totalImages) % totalImages;
  } else {
    currentIndex = (currentIndex + 1) % totalImages;
  }

  carousel.data("currentIndex", currentIndex);
  updateViewerImage(images, currentIndex, selectors);
}

export function setupImageViewer(selectors) {
  // Close button
  $(selectors.modalClose).on("click", (e) => {
    e.stopPropagation();
    closeImageViewer(selectors);
  });

  // Navigation buttons
  $(selectors.prevImageBtn).on("click", (e) => {
    e.stopPropagation();
    navigateImages("prev", selectors);
  });

  $(selectors.nextImageBtn).on("click", (e) => {
    e.stopPropagation();
    navigateImages("next", selectors);
  });

  // Click outside image to close
  $(selectors.imageViewerModal).on("click", (e) => {
    if (e.target === $(selectors.imageViewerModal)[0]) {
      closeImageViewer(selectors);
    }
  });

  // Prevent clicks on image content from closing the viewer
  $(
    `${selectors.imageViewerModal} .image-viewer-content, ${selectors.imageViewerModal} .image-viewer-container, ${selectors.imageViewerModal} .full-image-carousel, ${selectors.imageViewerModal} .full-image-carousel img`
  ).on("click", (e) => {
    e.stopPropagation();
  });

  // Keyboard navigation
  $(document).on("keydown", (e) => {
    if (!$(selectors.imageViewerModal).is(":visible")) return;

    if (e.key === "Escape") {
      closeImageViewer(selectors);
    } else if (e.key === "ArrowLeft") {
      navigateImages("prev", selectors);
    } else if (e.key === "ArrowRight") {
      navigateImages("next", selectors);
    }
  });
}

function closeImageViewer(selectors) {
  // Restore body scroll
  $("body").removeClass("image-viewer-open");
  $(selectors.imageViewerModal).fadeOut(300);
}

function renderMap(eventData, selectors) {
  if (eventData.Latitude && eventData.Longitude) {
    initializeMap(
      selectors.mapContainer.replace("#", ""),
      eventData.Latitude,
      eventData.Longitude
    );
  } else {
    $(selectors.mapContainer).html(
      '<div class="alert alert-info">Coordinate non disponibili per questo evento</div>'
    );
  }
}

function initializeMap(mapId, lat, lon) {
  setTimeout(() => {
    if (window.eventMap) {
      window.eventMap.remove();
      window.eventMap = null;
    }
    window.eventMap = L.map(mapId, {
      center: [lat, lon],
      zoom: 14,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: false,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      window.eventMap
    );
    L.marker([lat, lon]).addTo(window.eventMap);
  }, 0);
}

function renderParticipantsList(participants) {
  // Hide other modals first
  hideAllModals();

  const container = $("#participantsList");
  container.empty();
  if (!participants || participants.length === 0) {
    container.html(
      '<p class="text-muted text-center py-3">Nessun partecipante a questo evento</p>'
    );
  } else {
    participants.forEach((user) => {
      let imageUrl = "../../src/img/account.png";
      if (user.Image) {
        try {
          const parsedImage =
            typeof user.Image === "string"
              ? JSON.parse(user.Image)
              : user.Image;
          imageUrl = `../../src/img/UserImg/${parsedImage}`;
        } catch (e) {
          imageUrl = `../../src/img/UserImg/${user.Image}`;
        }
      }
      const participantHTML = `
        <li class="list-group-item d-flex align-items-center border-0 rounded mb-2 bg-light participant-item" 
            id="participant-${user.UserID}" 
            data-username="${user.Username}">
          <img src="${imageUrl}" alt="${
        user.Username || "Utente"
      }" class="rounded-circle me-3" style="width: 50px; height: 50px; object-fit: cover;">
          <span class="fw-medium">${
            user.Username || "Utente sconosciuto"
          }</span>
        </li>
      `;
      container.append(participantHTML);
    });
  }

  // Show the modal regardless of whether there are participants or not
  $("#participantsModal").addClass("show");

  // Ensure the close button works properly
  $("#participantsModal .modal-close")
    .off("click")
    .on("click", function () {
      $("#participantsModal").removeClass("show");
    });

  $("#toggleParticipants")
    .off("click")
    .on("click", () => $("#participantsModal").addClass("show"));
  $("#participantsModal")
    .off("click")
    .on("click", function (e) {
      if (
        $(e.target).is("#participantsModal") ||
        $(e.target).hasClass("modal-close")
      ) {
        $("#participantsModal").removeClass("show");
      }
    });
}

function renderInvitationsList(friendList, selectors, router) {
  // Hide other modals first
  hideAllModals();

  const modal = $("#friendInvitationsModal");
  modal.addClass("show");

  // Ensure the close button works properly
  $("#friendInvitationsModal .modal-close")
    .off("click")
    .on("click", function () {
      modal.removeClass("show");
    });

  modal.off("click").on("click", (e) => {
    if (
      $(e.target).is("#friendInvitationsModal") ||
      $(e.target).hasClass("modal-close")
    ) {
      modal.removeClass("show");
    }
  });

  const container = $("#friendsList");
  container.empty();
  if (!friendList.length) {
    container.html(
      '<p class="text-muted text-center py-3">Nessun amico da invitare</p>'
    );
    return;
  }

  friendList.forEach((friend) => {
    let imageUrl = "../../src/img/UserImg/default.png";
    if (friend.FriendPicture) {
      try {
        const parsedImage =
          typeof friend.FriendPicture === "string"
            ? JSON.parse(friend.FriendPicture)
            : friend.FriendPicture;
        imageUrl = `/src/img/UserImg/${parsedImage}`;
      } catch (e) {
        console.error("Error parsing friend image:", e);
      }
    }
    const friendCard = $(`
      <div class="list-group-item d-flex align-items-center justify-content-between friend-list-item">
        <div class="d-flex align-items-center">
          <img src="${imageUrl}" alt="Foto profilo" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">
          <div>
            <strong>${friend.Username || ""}</strong><br>
            <small class="text-muted">${friend.Name || ""} ${
      friend.Surname || ""
    }</small>
          </div>
        </div>
        <div class="friend-action-container" data-userid="${friend.UserID}">
          <!-- Action button or badge will be inserted here -->
        </div>
      </div>
    `);
    container.append(friendCard);
    const actionContainer = friendCard.find(".friend-action-container");

    if (friend.Status === "participate") {
      actionContainer.html(
        `<span class="badge bg-success">Già iscritto</span>`
      );
    } else if (friend.Status === "pending") {
      actionContainer.html(
        `<span class="badge bg-warning">Invito in attesa</span>`
      );
    } else {
      const inviteBtn = $(
        `<button class="btn btn-sm btn-outline-primary inviteFriendBtn">Invita</button>`
      );
      inviteBtn.on("click", (e) => {
        e.stopPropagation();
        router.currentPresenter.inviteFriend(friend.UserID);
        inviteBtn.replaceWith(
          `<span class="badge bg-warning">Invito in attesa</span>`
        );
      });
      actionContainer.append(inviteBtn);
    }
  });

  $("#inviteAllBtn")
    .off("click")
    .on("click", () => {
      $(".inviteFriendBtn").each((index, btn) => {
        const userID = $(btn)
          .closest(".friend-action-container")
          .data("userid");
        router.currentPresenter.inviteFriend(userID);
        $(btn).replaceWith(
          `<span class="badge bg-warning">Invito in attesa</span>`
        );
      });
      if ($(".inviteFriendBtn").length > 0) {
        // Utils.showToast(
        //   "Inviti inviati agli amici selezionati",
        //   "text-bg-success"
        // );
      } else {
        // Utils.showToast("Nessun nuovo invito da inviare", "text-bg-info");
      }
    });
}

export {
  renderEvent,
  renderParticipantsList,
  renderInvitationsList,
  hideAllModals,
};
