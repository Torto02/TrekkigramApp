function displayPosts(response, tabType, selectors, router, clear = true) {
  const posts = response.post;

  const containerSelector =
    tabType === "seguiti"
      ? $(selectors.postsContainerSeguiti)
      : $(selectors.postsContainerPerTe);
  const loadMoreBtnSelector =
    tabType === "seguiti"
      ? $(selectors.loadMoreFollowedBtn)
      : $(selectors.loadMoreBtn);

  // Se clear è true, sostituisci il contenuto, altrimenti aggiungi
  if (clear) {
    containerSelector.empty();
  }

  // Nascondi sempre il pulsante "carica altri" inizialmente
  loadMoreBtnSelector.addClass("d-none");

  // Controlla se non ci sono post
  if (!posts || posts.length === 0) {
    const message =
      tabType === "seguiti"
        ? "Non stai seguendo eventi di trekking"
        : "Non ci sono eventi di trekking disponibili";
    const noPostsMessage = `
      <div class="no-posts-message">
        <i class="bi bi-compass"></i>
        <p>${message}</p>
      </div>
    `;
    containerSelector.html(noPostsMessage);
    return;
  }

  // Mostra il pulsante "carica altri" solo se ci sono più post disponibili
  if (response.hasMore) {
    loadMoreBtnSelector.removeClass("d-none");
  }

  // Genera l'HTML per ogni post
  posts.forEach((post) => {
    const postCard = createPostCard(post, router);
    containerSelector.append(postCard);
  });
}

// Funzione per creare la card di un post
function createPostCard(post, router) {
  const postElement = document.createElement("div");
  postElement.className = "postCard";
  postElement.dataset.postId = post.id;
  postElement.dataset.eventId = post.EventID;
  const eventImagesArray = post.EventImages ? JSON.parse(post.EventImages) : [];
  const firstImage =
    eventImagesArray.length > 0
      ? `/src/img/eventImg/${eventImagesArray[0]}`
      : "";

  // Formatta la data in modo più leggibile
  const eventDate = new Date(post.DateTime);
  const formattedDate = eventDate.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Controlla se l'utente corrente è il creatore dell'evento
  const currentUserId = localStorage.getItem("UserId");
  const isCreator = post.CreatorID == currentUserId;

  // Determina lo stato del bottone di partecipazione in base allo stato di iscrizione
  const isSubscribed = post.subscribed === "participate";
  const buttonClass = isSubscribed ? "btn-success" : "btn-outline-primary";
  const buttonText = isSubscribed ? "Iscritto" : "Partecipa";
  const buttonIcon = isSubscribed
    ? "bi-check-circle-fill"
    : "bi-person-plus-fill";

  // Costruisci l'HTML del post
  const postHTML = `
    <div class="post-header" >
    <div class="user-info">
      <div class="user-avatar" >
        <img src="/src/img/UserImg/${JSON.parse(post.CreatorImage)}" alt="" 
             onerror="this.outerHTML='<i class=&quot;bi bi-person-fill&quot;></i>'" />
      </div>
      <div class="username">${post.CreatorUsername || "Username"}</div>
    </div>
    </div>
    <div class="post-content">
   
      <div class="post-image-container">
        <img src="${firstImage || "/src/img/eventDefault.png"}" alt="${
    post.EventName
  }" class="post-image${!firstImage ? " default-image" : ""}">
      </div>
       <div class="event-info d-flex gap-5">
       <div>
        <div class="event-title">${post.EventName || "Nome Evento"}</div>
        <div class="event-date">${formattedDate}</div>
        </div>
        ${
          !isCreator
            ? `
         <button class="btn ${buttonClass} flex ms-5 me-3 participateBtn" data-event-id="${post.EventID}" type="button">
          <i class="bi ${buttonIcon} me-1"></i>${buttonText}
        </button>`
            : ""
        }
      </div>
    </div>
  `;

  postElement.innerHTML = postHTML;

  // Add CSS styling for default image if needed
  if (!firstImage) {
    const defaultImg = postElement.querySelector(".default-image");
    if (defaultImg) {
      defaultImg.style.objectFit = "contain";
      defaultImg.style.backgroundColor = "#f8f9fa";
      defaultImg.style.padding = "20px";
    }
  }

  // Aggiungi l'event listener per il click sull'intero post
  postElement.addEventListener("click", () => {
    router.navigate(`/events/eventID=${post.EventID}`);
  });

  postElement.querySelector(".user-info").addEventListener("click", (e) => {
    e.stopPropagation();
    router.navigate(`/user/${post.CreatorUsername}`);
  });

  // Event handler for the participation button (only if it exists)
  const participateBtn = postElement.querySelector(".participateBtn");
  if (participateBtn) {
    participateBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent event from bubbling up to the post card
      const eventId = e.currentTarget.getAttribute("data-event-id");
      const isSubscribed = e.currentTarget.classList.contains("btn-success");

      // Call the appropriate method in the HomePresenter
      if (isSubscribed) {
        router.currentPresenter.handleParticipation(
          "unsubscribe",
          eventId,
          e.currentTarget
        );
      } else {
        router.currentPresenter.handleParticipation(
          "subscribe",
          eventId,
          e.currentTarget
        );
      }
    });
  }

  return postElement;
}

function checkTab() {
  const urlParams = new URLSearchParams(window.location.search);
  let currentTab = "perTe";
  if (urlParams.get("tab")) {
    const typeParam = urlParams.get("tab");
    if (typeParam === "followed") {
      currentTab = "seguiti";
    } else if (typeParam === "forYou") {
      currentTab = "perTe";
    }
  }
  return currentTab;
}

function setActiveTab(tab, tabSelector) {
  // Remove active class from all tabs
  tabSelector.removeClass("active");
  $(".tab-pane").removeClass("active show");

  // Add active class to the selected tab
  const tabId = tab === "seguiti" ? "tabSeguiti" : "tabPerTe";
  $(`[href="#${tabId}"]`).addClass("active");
  $(`#${tabId}`).addClass("active show");
}

function buildEndpointUrl(tab, filters, params) {
  let endpoint;

  if (tab === "seguiti") {
    endpoint = "/events/posts?tab=followed";
  } else {
    endpoint = "/events/posts?tab=forYou";
  }
  history.replaceState({}, "", endpoint);

  // Add filters or pagination parameters
  if (Object.keys(filters).length > 0) {
    endpoint += "&" + new URLSearchParams(filters).toString();
  } else if (Object.keys(params).length > 0) {
    endpoint += "&" + new URLSearchParams(params).toString();
  }

  return endpoint;
}

export { displayPosts, checkTab, setActiveTab, buildEndpointUrl };
