async function renderProfileCard(userInfo, s) {
  $("#UserBio").text(`${userInfo.Name} ${userInfo.Surname}`);
  $("#Username").text(userInfo.Username);

  // Controlla se l'utente ha un'immagine profilo valida
  if (
    userInfo.ProfilePicture &&
    userInfo.ProfilePicture !== "null" &&
    userInfo.ProfilePicture !== null
  ) {
    try {
      const image = JSON.parse(userInfo.ProfilePicture);
      if (image) {
        // Sidebar desktop - con immagine
        $(".user-photo").html(
          `<img src="/src/img/UserImg/${image}" class="rounded-circle" />`
        );
        // Mobile navbar - con immagine
        $("#mobileProfileBTN").html(
          `<div style="display:flex;flex-direction:column;align-items:center;">
            <img src="/src/img/UserImg/${image}" alt="Profilo" class="mobile-profile-img rounded-circle" style="width:32px;height:32px;object-fit:cover;">
            <span style="font-size:0.85rem; padding-top:3px">Profilo</span>
          </div>`
        );
      } else {
        // Se l'immagine parsata è null o vuota, usa l'icona di default
        setDefaultProfileIcons();
      }
    } catch (e) {
      // Se c'è un errore nel parsing JSON, usa l'icona di default
      console.error("Error parsing profile picture:", e);
      setDefaultProfileIcons();
    }
  } else {
    // Se non c'è immagine profilo, usa l'icona di default
    setDefaultProfileIcons();
  }

  // Funzione helper per impostare le icone di default
  function setDefaultProfileIcons() {
    // Sidebar desktop - icona di default
    $(".user-photo").html(`<i class="bi bi-person-circle"></i>`);
    // Mobile navbar - icona di default
    $("#mobileProfileBTN").html(
      `<div style="display:flex;flex-direction:column;align-items:center;">
        <i class="bi bi-person-circle"></i>
        <span style="font-size:0.85rem;">Profilo</span>
      </div>`
    );
  }
}

async function togglePanel(panel, show = true) {
  const $sidebar = $(".left-sidebar");

  if (show) {
    $sidebar.addClass("no-expand");
    panel.addClass("active");
    $(document).on("mousedown.panel", (e) => {
      if (
        !$(e.target).closest(panel).length &&
        !$(e.target).is(panel.prev()) &&
        !$(e.target).closest(`#${panel.attr("id")}BTN`).length &&
        !$(e.target).closest(
          `#mobile${
            panel.attr("id").charAt(0).toUpperCase() + panel.attr("id").slice(1)
          }BTN`
        ).length
      ) {
        togglePanel(panel, false);
      }
    });
  } else {
    panel.removeClass("active");
    $(document).off("mousedown.panel");
    $sidebar.removeClass("no-expand");
  }
}

function renderParticipations(events, container, router, panel) {
  // Aggiunto 'panel'
  container.empty();

  if (!events || events.length === 0) {
    container.append(`
      <div class="alert alert-secondary mx-3 my-2" role="alert">
        <i class="bi bi-mountaen-x me-2"></i> Non sei iscritto a nessun evento.
      </div>
    `);
    return;
  }

  events.forEach((event) => {
    let imageHtml = "";

    // Default image HTML that we'll use if anything fails
    const defaultImageHtml =
      '<div class="SB_event-image"> <img src="/src/img/eventDefault.png" alt="Default Event" onerror="this.src=\'/src/img/eventDefault.png\'; this.onerror=null;" /> </div>';

    if (event.EventImages && event.EventImages !== "") {
      try {
        const imgs = JSON.parse(event.EventImages);
        if (imgs && Array.isArray(imgs) && imgs.length > 0) {
          imageHtml = `<div class="SB_event-image">
                         <img src="/src/img/eventImg/${imgs[0]}" 
                              alt="${event.EventName}" />
                       </div>`;
        } else {
          imageHtml = defaultImageHtml;
        }
      } catch (e) {
        imageHtml = defaultImageHtml;
      }
    } else {
      imageHtml = defaultImageHtml;
    }

    // Safety check: if imageHtml is still empty for some reason, use default
    if (!imageHtml) {
      imageHtml = defaultImageHtml;
    }

    const cardHtml = `
      <div class="event-card SB_event-card" data-sb-event-id="${event.EventID}">
        <div class="event-header">
          <div class="SB_event-card-content">
            ${imageHtml}
            <div class="SB-event-info">
              <h6 class="SB_event-title">${event.EventName}</h6>
              <span class="SB_event-date">
                ${new Date(event.DateTime).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    const $card = $(cardHtml);

    // al click navighiamo e fa partire EventPresenter.loadEvent()
    $card.on("click", () => {
      togglePanel(panel, false); // Chiude il pannello
      router.navigate(`/events/eventID=${event.EventID}`);
    });

    container.append($card);
  });
}

function renderFriendRequests(requests, container, router, panel) {
  container.empty();

  if (!requests || requests.length === 0) {
    container.append(`
      <div class="alert alert-secondary mx-3 my-2" role="alert">
         <i class="bi bi-person-plus-fill me-2"></i> Nessuna richiesta di amicizia in sospeso.
      </div>
    `);
    return; // Potresti non aver bisogno del return se non c'è altro codice dopo
  }

  requests.forEach((request) => {
    // Handle profile picture
    let profilePicHtml =
      '<div class="request-user-image"><i class="bi bi-person-circle"></i></div>';

    if (request.User.ProfilePicture && request.User.ProfilePicture != "null") {
      try {
        const profileImg = JSON.parse(request.User.ProfilePicture);
        profilePicHtml = `
          <div class="request-user-image">
            <img src="/src/img/UserImg/${profileImg}" alt="bi bi-person-circle" class="rounded-circle" />
          </div>
        `;
      } catch (e) {
        console.error("Error parsing profile picture:", e);
      }
    }

    const requestHtml = `
      <div class="friend-request-card" data-request-id="${request.ID}">
        <div class="request-info p-3">
          <div class="d-flex align-items-center mb-2">
            ${profilePicHtml}
            <div class="request-user-info ms-3">
              <strong>${request.User.Username}</strong>
              <div class="text-muted small">${request.User.Name} ${request.User.Surname}</div>
            </div>
          </div>
          <div class="request-actions d-flex justify-content-between mt-2">
            <button class="btn btn-sm btn-success accept-friend-btn flex-grow-1 me-1">
              Accetta
            </button>
            <button class="btn btn-sm btn-outline-danger reject-friend-btn flex-grow-1 ms-1">
              Rifiuta
            </button>
          </div>
        </div>
      </div>
    `;

    const $request = $(requestHtml);

    // Aggiungi click listener per navigare al profilo utente
    $request.on("click", function (e) {
      // Evita di attivare il click se si è cliccato sui pulsanti
      if (!$(e.target).closest(".request-actions").length) {
        togglePanel(panel, false);
        router.navigate(`/user/${request.User.Username}`);
      }
    });

    $request.find(".accept-friend-btn").on("click", function (e) {
      e.stopPropagation();
      router.sidebarPresenter.handleAction(
        "acceptFriendRequest",
        request.User.Username
      );
    });

    $request.find(".reject-friend-btn").on("click", function (e) {
      e.stopPropagation();
      router.sidebarPresenter.handleAction(
        "rejectFriendRequest",
        request.User.Username
      );
    });

    container.append($request);
  });
}

function renderEventInvitations(invitations, container, router, panel) {
  container.empty();

  if (!invitations || invitations.length === 0) {
    container.append(`
      <div class="alert alert-secondary mx-3 my-2" role="alert">
        <i class="bi bi-calendar-x me-2"></i> Nessun invito a eventi presente.
      </div>
    `);
    return; // Potresti non aver bisogno del return se non c'è altro codice dopo
  }

  invitations.forEach((invite) => {
    // Handle event image
    let eventImageHtml =
      '<div class="invite-event-image"><i class="bi bi-calendar-event"></i></div>';

    if (invite.Event.EventImage && invite.Event.EventImage != "null") {
      try {
        const eventImages = JSON.parse(invite.Event.EventImage);
        if (eventImages && eventImages.length > 0) {
          eventImageHtml = `
            <div class="invite-event-image">
              <img src="/src/img/eventImg/${eventImages[0]}" alt="${invite.Event.EventName}" />
            </div>
          `;
        }
      } catch (e) {
        console.error("Error parsing event images:", e);
      }
    } else {
      eventImageHtml = `
            <div class="invite-event-image">
              <img src="/src/img/eventDefault.png" alt="${invite.Event.EventName}" />
            </div>
          `;
    }

    const inviteHtml = `
      <div class="event-invite-card" data-invite-id="${invite.ID}">
        <div class="invite-info p-3">
          <div class="d-flex align-items-center mb-2">
            ${eventImageHtml}
            <div class="invite-event-info ms-3">
              <strong>${invite.Event.EventName}</strong>
              <div class="text-muted small sender-username">Inviato da: <strong> ${invite.Sender.Username}</strong></div>
            </div>
          </div>
          <div class="invite-actions d-flex justify-content-between mt-2">
            <button class="btn btn-sm btn-success accept-invite-btn flex-grow-1 me-1">
              Partecipa
            </button>
            <button class="btn btn-sm btn-outline-danger reject-invite-btn flex-grow-1 ms-1">
              Rifiuta
            </button>
          </div>
        </div>
      </div>
    `;

    const $invite = $(inviteHtml);

    $invite.on("click", function (e) {
      // Evita di attivare il click se si è cliccato sui pulsanti o sul nome del mittente
      if (
        !$(e.target).closest(".invite-actions").length &&
        !$(e.target).closest(".sender-username").length
      ) {
        togglePanel(panel, false);
        router.navigate(`/events/eventID=${invite.Event.EventID}`);
      }
    });

    // Aggiungi click listener per navigare al profilo del mittente
    $invite.find(".sender-username").on("click", function (e) {
      e.stopPropagation(); // Previene la propagazione al click dell'intera card
      togglePanel(panel, false);
      router.navigate(`/user/${invite.Sender.Username}`);
    });

    $invite.find(".accept-invite-btn").on("click", function (e) {
      e.stopPropagation();
      router.sidebarPresenter.handleAction("acceptEventInvitation", [
        invite.ID,
        invite.Event.EventID,
      ]);
    });
    $invite.find(".reject-invite-btn").on("click", function (e) {
      e.stopPropagation();
      router.sidebarPresenter.handleAction("rejectEventInvitation", [
        invite.ID,
        invite.Event.EventID,
      ]);
    });

    container.append($invite);
  });
}

export const renderSearchResults = function (users, resultsContainer, router) {
  resultsContainer.empty();
  users.slice(0, 10).forEach((user) => {
    const userImage = user.Image;
    const imageContent = userImage
      ? `<img src="/src/img/UserImg/${JSON.parse(
          userImage
        )}" alt="Profilo" class="user-profile-img">`
      : `<div class="SB_user-avatar"> <i class="bi bi-person-fill" style="font-size: 40px;"></i></div>`;

    const userHTML = `
      <div class="card SB_userCard" data-user-id="${user.Username}">
        <div class="user-card-content">
          <div class="user-img">
            ${imageContent}
          </div>
          <div class="user-text">
            <div class="user-name">${user.Name} ${user.Surname}</div>

            <div class="user-username">@${user.Username}</div>
          </div>

        </div>
      </div>
    `;

    const $userCard = $(userHTML);

    // Aggiungi click listener per navigare al profilo utente
    $userCard.on("click", function () {
      router.navigate(`/user/${user.Username}`);
      togglePanel($("#searchPanel"), false);
    });

    resultsContainer.append($userCard);
  });
};
export {
  renderProfileCard,
  // setupLogoutModal,
  togglePanel,
  renderParticipations,
  renderFriendRequests,
  renderEventInvitations,
};
