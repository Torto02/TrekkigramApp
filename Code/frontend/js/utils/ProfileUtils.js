function setActiveTab(tab, tabSelector) {
  tabSelector.removeClass("active");
  $(".tab-pane").removeClass("active show");

  const tabId = tab === "posts" ? "tabPosts" : "tabPartecipations";
  $(`[href="#${tabId}"]`).addClass("active");
  $(`#${tabId}`).addClass("active show");
}

function checkTab() {
  const urlParams = new URLSearchParams(window.location.search);
  let currentTab = "posts";
  if (urlParams.has("tab")) {
    const tabParam = urlParams.get("tab");
    if (tabParam === "posts") {
      currentTab = "posts";
    } else if (tabParam === "partecipations") {
      currentTab = "partecipations";
    }
  }
  return currentTab;
}

function buildEndpoint(tab, username) {
  return tab == "posts"
    ? `/user/${username}?tab=posts`
    : `/user/${username}?tab=partecipations`;
}

function renderProfile(response, tab, selectors, router, tabData) {
  const userInfo = response.UserInfo;
  $(selectors.Username).text(userInfo.Username);
  $(selectors.uName).text(userInfo.Name);
  $(selectors.uSurname).text(userInfo.Surname);
  $(selectors.description).text(userInfo.Description || "");
  $(selectors.friendNum).text(response.UserInfo.friendList.length);

  const userImage = userInfo.ProfilePicture;

  if (userImage) {
    const image = JSON.parse(userImage);
    const imagePath = `../../src/img/UserImg/${image}`;
    $(".profile-img").attr("src", imagePath);
  } else {
    $(".profile-img").attr("src", "");
  }
  const isOwner = userInfo.Username === localStorage.getItem("username");

  if (isOwner) {
    $(".profile-actions").empty();

    const isMobile = window.innerWidth < 768;
    const buttonText = isMobile ? "" : " Opzioni";

    $(".profile-actions").append(
      `<div class="profile-options-container">
        <button class="btn btn-outline-primary profileOptionsBtn">
          <i class="bi bi-gear"></i>${buttonText}
        </button>
        <div class="profile-options-panel">
          <button class="btn btn-outline-primary updateProfileBtn">
            <i class="bi bi-pencil me-2"></i>Modifica profilo
          </button>
          <button class="btn btn-outline-danger profileLogoutBtn">
            <i class="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>
      </div>`
    );

    $(".profileOptionsBtn").on("click", function (e) {
      e.stopPropagation();
      $(".profile-options-panel").toggleClass("show");

      $(document).on("click.profileOptions", function (event) {
        if (!$(event.target).closest(".profile-options-container").length) {
          $(".profile-options-panel").removeClass("show");
          $(document).off("click.profileOptions");
        }
      });
    });

    $(".updateProfileBtn").on("click", function () {
      $(".profile-options-panel").removeClass("show");
      showEditProfileModal(selectors, userInfo);
    });

    $(".profileLogoutBtn").on("click", function () {
      $(".profile-options-panel").removeClass("show");
      showLogoutConfirmModal();
    });

    $(window).on("resize", function () {
      const isMobileNow = window.innerWidth < 768;
      const newButtonText = isMobileNow ? "" : " Modifica profilo";
      $(".profileOptionsBtn").html(
        `<i class="bi bi-gear"></i>${newButtonText}`
      );
    });
  } else {
    loadFriendshipStatus(userInfo, selectors, router);
  }

  $(selectors.postNum).text(response.UserInfo.userPostCount || "0");
  if (tabData && Array.isArray(tabData) && tabData.length > 0) {
    loadEvents(tabData, tab, selectors, router);
  } else if (
    tabData &&
    typeof tabData === "string" &&
    tabData.includes("Profilo Privato")
  ) {
    const container =
      tab === "posts"
        ? $(selectors.postsContainer)
        : $(selectors.partecipazioniContainer);
    $(container).empty();

    container.html(`
      <p class="text-center text-muted py-5">
        <i class="bi bi-lock fs-1 d-block mb-3"></i>
        Questo profilo è privato. Solo gli amici possono vedere i contenuti.
      </p>
    `);
  } else {
    const container =
      tab === "posts"
        ? $(selectors.postsContainer)
        : $(selectors.partecipazioniContainer);

    const message =
      tab === "posts"
        ? "Nessun post caricato"
        : "Nessuna partecipazione trovata";

    container.html(`
      <p class="text-center text-muted py-5">
        <i class="bi bi-calendar-x fs-1 d-block mb-3"></i>
        ${message}
      </p>
    `);
  }
}

function loadFriendshipStatus(userInfo, selectors, router) {
  if (!userInfo.friendshipStatus) {
    $(".profile-actions").empty();
    const followBtn = $(`<button class="btn btn-primary followBtn">
      <i class="bi bi-person-plus me-2"></i>Segui
    </button>`);
    $(".profile-actions").append(followBtn);
    followBtn.on("click", () =>
      router.currentPresenter.handleFriendshipAction("send")
    );
    return;
  }

  const friendShipStatus = userInfo.friendshipStatus["status"] || null;
  if (friendShipStatus) {
    const actionsContainer = $(".profile-actions");
    actionsContainer.empty();

    switch (friendShipStatus) {
      case "friend":
        const removeBtn = $(`<button class="btn btn-danger remove-friend-btn">
          <i class="bi bi-person-check me-2"></i>Amici
        </button>`);
        actionsContainer.append(removeBtn);
        removeBtn.on("click", () =>
          router.currentPresenter.handleFriendshipAction("remove")
        );
        break;

      case "pending":
        if (userInfo.friendshipStatus["direction"] == "sended") {
          const cancelBtn =
            $(`<button class="btn btn-warning cancel-request-btn">
            <i class="bi bi-clock me-2"></i>Richiesta inviata
          </button>`);

          actionsContainer.append(cancelBtn);
          cancelBtn.on("click", () =>
            router.currentPresenter.handleFriendshipAction("cancel")
          );
        } else {
          const buttonGroup = $(
            `<div class="d-flex friendship-buttons-group gap-2"></div>`
          );

          const acceptBtn =
            $(`<button class="btn btn-success accept-friend-btn">
            <i class="bi bi-check-lg"></i>Accetta richiesta
          </button>`);

          const rejectBtn =
            $(`<button class="btn btn-outline-danger reject-friend-btn">
            <i class="bi bi-x-lg"></i>Rifiuta
          </button>`);

          buttonGroup.append(acceptBtn, rejectBtn);
          actionsContainer.append(buttonGroup);

          acceptBtn.on("click", () =>
            router.currentPresenter.handleFriendshipAction("accept")
          );
          rejectBtn.on("click", () =>
            router.currentPresenter.handleFriendshipAction("reject")
          );
        }
        break;
    }
  }
}

function loadEvents(events, tab, selectors, router) {
  const containerSelector =
    tab === "posts"
      ? $(selectors.postsContainer)
      : $(selectors.partecipazioniContainer);

  events.forEach((event) => {
    let eventPreview = renderEventPreview(event, router);
    containerSelector.append(eventPreview);
  });
}

function renderEventPreview(event, router) {
  const eventID = event.EventID;
  const eventImagesArray = event.EventImages
    ? JSON.parse(event.EventImages)
    : [];

  const firstImage =
    eventImagesArray && eventImagesArray.length > 0
      ? `/src/img/eventImg/${eventImagesArray[0]}`
      : "/src/img/eventDefault.png";
  const postElement = `<div class="post" id="post-${eventID}" data-event-id="${eventID}">
            <img src="${firstImage}" alt="" />
            <div class="overlay">
              <i class="bi bi-eye text-white fs-4"></i>
            </div>
          </div>`;

  return postElement;
}

function showEditProfileModal(selectors, userInfo) {
  $(selectors.profileDescription).val(userInfo.Description || "");
  $(selectors.profilePrivacy).val(userInfo.Privacy);

  $(selectors.removeImageCheckbox).hide();

  if (userInfo.ProfilePicture) {
    const image = JSON.parse(userInfo.ProfilePicture);
    const imagePath = `../../src/img/UserImg/${image}`;
    $(selectors.profileImagePreview).attr("src", imagePath);
    $(selectors.removeImageCheckbox).show();
    $(".profile-image-placeholder").hide();
  } else {
    $(selectors.profileImagePreview).attr("src", "");
    $(selectors.removeImageCheckbox).hide();
    $(".profile-image-placeholder").show();
  }

  $(selectors.profileImageInput)
    .off("change")
    .on("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          $(selectors.profileImagePreview).attr("src", e.target.result);
          $(selectors.removeImageCheckbox).show();
          $(".profile-image-placeholder").hide();
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });

  $(selectors.removeImageCheckbox)
    .off("click")
    .on("click", () => {
      $(selectors.profileImagePreview).attr("src", "");
      $(selectors.profileImageInput).val("");
      $(selectors.removeImageCheckbox).hide();
      $(".profile-image-placeholder").show();
    });

  const modal = new bootstrap.Modal(
    document.getElementById("editProfileModal")
  );
  modal.show();
}

function showLogoutConfirmModal() {
  if ($("#profileLogoutModal").length === 0) {
    $("body").append(`
      <div id="profileLogoutModal" class="modal">
        <div class="modal-content p-5 delete-confirm-modal">
          <div class="text-center mb-4">
            <i class="bi bi-exclamation-triangle-fill text-danger delete-icon"></i>
            <h4 class="mt-3">Sei sicuro di voler effettuare il logout?</h4>
            <p class="text-muted">
              Questa azione ti disconnetterà dall'applicazione.
            </p>
          </div>
          <div class="d-flex justify-content-center gap-3">
            <button type="button" class="btn btn-secondary profile-cancel-logout-btn">
              Annulla
            </button>
            <button type="button" class="btn btn-danger" id="profileConfirmLogoutBtn">
              Logout
            </button>
          </div>
        </div>
      </div>
    `);

    $(
      "#profileLogoutModal .profile-cancel-logout-btn, #profileLogoutModal .modal-close"
    ).on("click", function () {
      $("#profileLogoutModal").fadeOut();
    });

    $("#profileLogoutModal").on("click", function (e) {
      if ($(e.target).is($("#profileLogoutModal"))) {
        $("#profileLogoutModal").fadeOut();
      }
    });
  }

  $("#profileLogoutModal").fadeIn();
}

export {
  setActiveTab,
  buildEndpoint,
  renderProfile,
  checkTab,
  loadEvents,
  showEditProfileModal,
  showLogoutConfirmModal,
};
