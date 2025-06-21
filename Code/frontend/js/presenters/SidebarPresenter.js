import { Presenter } from "./Presenter.js";
import * as SidebarUtils from "../utils/SidebarUtils.js";
import { showToast } from "../utils/ToastUtils.js"; // <-- Importa la funzione

export class SidebarPresenter extends Presenter {
  constructor(router) {
    super(router);
    this.selectors = {
      homeBtn: "#homeBTN",
      notificationBtn: "#notificationBTN",
      participationBtn: "#partecipationBTN",
      searchBtn: "#searchBTN",
      createEventBtn: ".createEventBtn",
      profileCard: "#profileCard",
      // logoutBtn: "#logoutBtn",

      // Mobile navigation elements
      mobileHomeBtn: "#mobileHomeBTN",
      mobileNotificationBtn: "#mobileNotificationBTN",
      mobilePartecipationBtn: "#mobilePartecipationBTN",
      mobileProfileBtn: "#mobileProfileBTN", // Updated to profile button
      mobileCreateEventBtn: "#mobileCreateEventBtn",
      floatingSearchBtn: "#floatingSearchBtn", // Added floating search button

      // Panels
      searchPanel: "#searchPanel",
      notificationPanel: "#notificationPanel",
      participationPanel: "#partecipationPanel",

      // Search elements
      searchInput: "#searchUserInput",
      searchResults: ".search-results",
      searchCloseBtn: "#searchCloseBtn",

      // Close buttons
      notificationCloseBtn: "#notificationCloseBtn",
      partecipationCloseBtn: "#partecipationCloseBtn",

      // Notification tabs
      friendRequestsTab: "#friendRequests-tab",
      eventInvitesTab: "#eventInvites-tab",
      friendRequestsContent: "#friendRequests",
      eventInvitesContent: "#eventInvites",

      // Results containers
      invitesResults: ".invites-results",
      friendsResults: ".friends-results",
      participationResults: ".partecipation-results",
    };
    Object.entries(this.selectors).forEach(([key, selector]) => {
      this[key] = $(selector);
    });

    this.init();
    this.currentNotificationTab = "friendRequest"; // Track current tab
    this.username = localStorage.getItem("username"); // Store username for profile navigation
  }

  async bindEvents() {
    await this.loadInfo();

    await this.homeBtn.on("click", () => {
      this.goToHome();
    });

    await this.mobileHomeBtn.on("click", () => {
      this.goToHome();
    });

    await $(this.createEventBtn).on("click", () => this.goToCreateEvent());

    await $(this.mobileCreateEventBtn).on("click", () => {
      this.goToCreateEvent();
    });

    await $(this.participationBtn).on("click", () => {
      SidebarUtils.togglePanel(this.participationPanel);
      this.fetchParticipations();
    });

    await $(this.mobilePartecipationBtn).on("click", () => {
      SidebarUtils.togglePanel(this.participationPanel);
      this.fetchParticipations();
    });

    // Notification panel click handler
    await $(this.notificationBtn).on("click", () => {
      SidebarUtils.togglePanel(this.notificationPanel);

      // Force show the friend requests tab as active on initial open
      $(this.friendRequestsTab).addClass("active");
      $(this.eventInvitesTab).removeClass("active");
      $(this.friendRequestsContent).addClass("show active");
      $(this.eventInvitesContent).removeClass("show active");

      // Fetch the friend requests data
      this.fetchNotifications("friendRequest");
      this.currentNotificationTab = "friendRequest";
    });

    await $(this.mobileNotificationBtn).on("click", () => {
      SidebarUtils.togglePanel(this.notificationPanel);

      // Force show the friend requests tab as active on initial open
      $(this.friendRequestsTab).addClass("active");
      $(this.eventInvitesTab).removeClass("active");
      $(this.friendRequestsContent).addClass("show active");
      $(this.eventInvitesContent).removeClass("show active");

      // Fetch the friend requests data
      this.fetchNotifications("friendRequest");
      this.currentNotificationTab = "friendRequest";
    });

    // Add event listeners for notification tabs
    await $(this.friendRequestsTab).on("click", () => {
      this.currentNotificationTab = "friendRequest";
      this.fetchNotifications("friendRequest");
    });

    await $(this.eventInvitesTab).on("click", () => {
      this.currentNotificationTab = "eventInvite";
      this.fetchNotifications("eventInvite");
    });

    await $(this.searchBtn).on("click", () => {
      SidebarUtils.togglePanel(this.searchPanel);
    });

    // New mobile profile button handler
    await $(this.mobileProfileBtn).on("click", () => {
      this.router.navigate(`/user/${this.username}`);
    });

    // Floating search button handler
    await $(this.floatingSearchBtn).on("click", () => {
      SidebarUtils.togglePanel(this.searchPanel);
    });

    await $(this.searchInput).on("keyup", (e) => {
      this.handleSearch(e);
    });

    await $(this.searchCloseBtn).on("click", () => {
      SidebarUtils.togglePanel(this.searchPanel, false);
    });

    await $(this.notificationCloseBtn).on("click", () => {
      SidebarUtils.togglePanel(this.notificationPanel, false);
    });

    await $(this.partecipationCloseBtn).on("click", () => {
      SidebarUtils.togglePanel(this.participationPanel, false);
    });

    $("#clearSearchBtn").on("click", () => {
      $("#searchUserInput").val("").focus();
      $(".search-results").empty();
    });
    $(".sidebarVisibility").removeClass("d-none");

    // Check if we're on the homepage to show/hide the floating search button
  }

  async loadInfo() {
    const response = await this.makeRequest(
      `/user/${localStorage.getItem("username")}`
    );
    SidebarUtils.renderProfileCard(response.UserInfo, this.selectors);
    this.username = response.UserInfo.Username; // Store username for profile navigation
    this.profileCard.on("click", () => {
      this.router.navigate(`/user/${response.UserInfo.Username}`);
    });
  }

  async goToHome() {
    this.router.navigate("/events/posts");
  }

  async goToCreateEvent() {
    this.router.navigate("/event/create");
  }

  async fetchParticipations() {
    const response = await this.makeRequest(`/participations/active`);
    if (response.success && response.Events) {
      // Popola il container e setta i listener interni
      SidebarUtils.renderParticipations(
        response.Events,
        this.participationResults,
        this.router,
        this.participationPanel // Passa il pannello
      );
    } else {
      this.participationResults
        .empty()
        .append("<p class='ms-4'>Nessun evento trovato</p>");
    }
  }

  async fetchNotifications(type = "friendRequest") {
    try {
      let endpoint = "";

      if (type === "friendRequest") {
        endpoint = "/friendship/request";
        // Ensure the friend request tab is shown as active
        $(this.friendRequestsTab).addClass("active");
        $(this.eventInvitesTab).removeClass("active");
        $(this.friendRequestsContent).addClass("show active");
        $(this.eventInvitesContent).removeClass("show active");
      } else if (type === "eventInvite") {
        endpoint = "/participations/request";
        // Ensure the event invites tab is shown as active
        $(this.eventInvitesTab).addClass("active");
        $(this.friendRequestsTab).removeClass("active");
        $(this.eventInvitesContent).addClass("show active");
        $(this.friendRequestsContent).removeClass("show active");
      }

      const response = await this.makeRequest(endpoint);

      if (response.success) {
        if (type === "friendRequest") {
          // Render friend requests
          SidebarUtils.renderFriendRequests(
            response.FriendRequests || [],
            $(this.friendsResults),
            this.router,
            this.notificationPanel
          );
        } else {
          // Render event invitations
          SidebarUtils.renderEventInvitations(
            response.Invitations || [],
            $(this.invitesResults),
            this.router,
            this.notificationPanel
          );
        }
      } else {
        if (type === "friendRequest") {
          $(this.friendsResults)
            .empty()
            .append("<p class='ms-4'>Nessuna richiesta di amicizia</p>");
        } else {
          $(this.invitesResults)
            .empty()
            .append("<p class='ms-4'>Nessun invito a eventi</p>");
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (type === "friendRequest") {
        $(this.friendsResults)
          .empty()
          .append("<p class='ms-4'>Errore nel caricamento</p>");
      } else {
        $(this.invitesResults)
          .empty()
          .append("<p class='ms-4'>Errore nel caricamento</p>");
      }
    }
  }

  async handleAction(action, data) {
    const endpoint = {
      acceptEventInvitation: {
        url: `/participations/accept`,
        method: "PUT",
        data: {
          participationID: data[0],
          eventId: data[1],
        },
        message: "Invito accettato",
        alert: "success",
      },
      rejectEventInvitation: {
        url: `/participations/reject`,
        method: "DELETE",
        data: {
          participationID: data[0],
          eventId: data[1],
        },
        message: "Invito rifiutato",
        alert: "alert",
      },
      acceptFriendRequest: {
        url: `/friendship/${data}/accept`,
        method: "PUT",
        data: {},
        message: "Richiesta di amicizia accettata",
        alert: "success",
      },
      rejectFriendRequest: {
        url: `/friendship/${data}/reject`,
        method: "DELETE",
        data: {},
        message: "Richeista di amicizia rifiutata",
        alert: "alert",
      },
    };

    const config = endpoint[action];

    const repsonse = await this.makeRequest(
      config.url,
      config.method,
      config.data
    );
    if (repsonse.success) {
      showToast(config.message, config.alert);
    }

    this.fetchNotifications(this.currentNotificationTab); // Refresh the current tab
  }

  async handleSearch(e) {
    const query = this.searchInput.val().trim();
    const results = this.searchResults;

    if (!query) {
      results.empty();
      return;
    }

    // Aggiungiamo un debounce per evitare troppe richieste
    clearTimeout(this.searchTimeout);

    // Mostriamo un indicatore di caricamento
    results.html(
      '<div class="text-center py-3"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Caricamento...</span></div></div>'
    );

    this.searchTimeout = setTimeout(async () => {
      try {
        const response = await this.makeRequest(
          `/user/search?username=${query}`
        );
        if (response.success && response.Users && response.Users.length > 0) {
          SidebarUtils.renderSearchResults(
            response.Users,
            results,
            this.router
          );
        } else {
          results.html('<p class="text-center py-3">Nessun utente trovato</p>');
        }
      } catch (error) {
        console.error("Errore durante la ricerca:", error);
        results.html(
          '<p class="text-center py-3 text-danger">Errore durante la ricerca</p>'
        );
      }
    }, 300); // Attendiamo 300ms prima di effettuare la ricerca
  }

  cleanup() {
    // Rimuovi tutti gli event listener
    this.homeBtn.off("click");
    this.mobileHomeBtn.off("click");
    // $(this.confirmLogoutBtn).off("click");
    $(this.createEventBtn).off("click");
    $(this.mobileCreateEventBtn).off("click");
    $(this.participationBtn).off("click");
    $(this.mobilePartecipationBtn).off("click");
    $(this.notificationBtn).off("click");
    $(this.mobileNotificationBtn).off("click");
    $(this.friendRequestsTab).off("click");
    $(this.eventInvitesTab).off("click");
    $(this.searchBtn).off("click");
    $(this.mobileProfileBtn).off("click"); // Updated to profile button
    $(this.floatingSearchBtn).off("click"); // Added floating search button
    $(this.searchInput).off("keyup");
    $(this.searchCloseBtn).off("click");
    $(this.notificationCloseBtn).off("click");
    $(this.partecipationCloseBtn).off("click");
    this.profileCard.off("click");

    // Nascondi tutti i pannelli
    $(this.searchPanel).removeClass("active");
    $(this.notificationPanel).removeClass("active");
    $(this.participationPanel).removeClass("active");

    // Rimuovi i listener dei documenti
    $(document).off("mousedown.panel");
  }
}
