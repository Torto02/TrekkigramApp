import { Presenter } from "./Presenter.js";
import * as ProfileUtils from "../utils/ProfileUtils.js";
import { showToast } from "../utils/ToastUtils.js";

export class ProfilePresenter extends Presenter {
  constructor(router, username) {
    super(router);
    this.username = username;
    this.selectors = {
      Username: "#ProfileUsername",
      uName: "#uName",
      uSurname: "#uSurname",
      description: "#description",
      updateProfileBtn: ".updateProfileBtn",
      postsContainer: "#postsContainer",
      partecipazioniContainer: "#partecipazioniContainer",
      postNum: "#postsNum",
      friendNum: "#friendNum",
      editProfileModal: "#editProfileModal",
      profileImagePreview: "#profileImagePreview",
      profileImageInput: "#profileImageInput",
      removeImageCheckbox: "#removePreviewImage",
      profilePrivacy: "#profilePrivacy",
      profileDescription: "#profileDescription",
      saveProfileChangesBtn: "#saveProfileChangesBtn",
      tabSelector: "#tabSelector .tab-link",
      tabContent: ".tab-pane",
      profileContainer: ".profileContainer",
    };
    Object.entries(this.selectors).forEach(([key, selector]) => {
      this[key] = $(selector);
    });

    this.currentTab = ProfileUtils.checkTab()
      ? ProfileUtils.checkTab()
      : "posts";

    this.init();
  }

  async bindEvents() {
    this.profileContainer.removeClass("d-none");
    ProfileUtils.setActiveTab(this.currentTab, this.tabSelector);
    await this.loadProfile(this.currentTab);
    this.tabSelector.on("click", (e) => this.handleTabChange(e));
    this.saveProfileChangesBtn.on("click", () => this.saveProfileChanges());

    $(document).on("click", "#profileConfirmLogoutBtn", () => {
      this.handleLogout();
    });
  }

  async loadProfile(tab) {
    const endpoint = ProfileUtils.buildEndpoint(tab, this.username);
    try {
      const response = await this.makeRequest(endpoint);

      const tabData = response.UserInfo[`${this.currentTab}`];
      ProfileUtils.renderProfile(
        response,
        this.currentTab,
        this.selectors,
        this.router,
        tabData
      );

      $(this.selectors.postsContainer).off("click", ".post");
      $(this.selectors.partecipazioniContainer).off("click", ".post");
      $(this.selectors.postsContainer).on("click", ".post", (e) => {
        const eventId = $(e.currentTarget).data("event-id");
        if (eventId) {
          this.router.navigate(`/events/eventID=${eventId}`);
        }
      });

      $(this.selectors.partecipazioniContainer).on("click", ".post", (e) => {
        const eventId = $(e.currentTarget).data("event-id");
        if (eventId) {
          this.router.navigate(`/events/eventID=${eventId}`);
        }
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }

  async handleTabChange(e) {
    e.preventDefault();
    const href = $(e.target).attr("href");
    if (href === "#tabPosts") {
      this.currentTab = "posts";
    } else if (href === "#tabPartecipations") {
      this.currentTab = "partecipations";
    }

    ProfileUtils.setActiveTab(this.currentTab, this.tabSelector);

    $(this.selectors.postsContainer).empty();
    $(this.selectors.partecipazioniContainer).empty();

    this.loadProfile(this.currentTab);
  }

  async handleFriendshipAction(action) {
    const endpoints = {
      remove: {
        url: `/friendship/${this.username}`,
        method: "DELETE",
        message: "Amicizia rimossa",
        alert: "danger",
      },
      send: {
        url: `/friendship/${this.username}`,
        method: "POST",
        message: "Richiesta di amicizia inviata",
        alert: "info",
      },
      cancel: {
        url: `/friendship/${this.username}/cancel`,
        method: "DELETE",
        message: "Richiesta di amicizia cancellata",
        alert: "danger",
      },
      accept: {
        url: `/friendship/${this.username}/accept`,
        method: "PUT",
        message: "Richiesta di amicizia accettata",
        alert: "success",
      },
      reject: {
        url: `/friendship/${this.username}/reject`,
        method: "DELETE",
        message: "Richiesta di amicizia rifiutata",
        alert: "danger",
      },
    };

    const config = endpoints[action];

    try {
      const response = await this.makeRequest(config.url, config.method);
      if (response.success) {
        $(this.selectors.postsContainer).empty();
        $(this.selectors.partecipazioniContainer).empty();
        this.loadProfile(this.currentTab);
        showToast(config.message, config.alert);
      }
    } catch (error) {
      console.error(`Error handling friendship ${action}:`, error);
    }
  }

  async saveProfileChanges() {
    const formData = new FormData();
    const description = $(this.profileDescription).val();
    const privacy = $(this.profilePrivacy).val();

    formData.append("description", description);
    formData.append("privacy", privacy);

    const profileImageSrc = $(this.profileImagePreview).attr("src");

    if ($(this.profileImageInput)[0].files.length > 0) {
      const imageFile = $(this.profileImageInput)[0].files[0];
      formData.append("newProfileImage", imageFile);
      formData.append("removeImage", "false");
    } else if (!profileImageSrc || profileImageSrc === "") {
      formData.append("removeImage", "true");
    } else {
      formData.append("removeImage", "false");
    }

    const response = await this.makeRequest(
      `/user/${this.username}/update`,
      "POST",
      formData
    );

    if (response.success) {
      $(this.postsContainer).empty();
      $(this.partecipazioniContainer).empty();
      this.loadProfile(this.currentTab);
      bootstrap.Modal.getInstance(this.editProfileModal[0]).hide();
      showToast("Profilo aggiornato!", "info");
    }
  }

  async handleLogout() {
    try {
      $("#logoutModal").fadeOut();
      $("#profileLogoutModal").fadeOut();

      await this.makeRequest("/auth/logout", "DELETE");
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigate("/auth/login");
      showToast("Logout effettuato con successo", "alert");
    } catch (error) {
      console.error("Errore durante il logout:", error);
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigate("/auth/login");
    }
  }

  cleanup() {
    $(this.selectors.tabSelector).off("click");
    $(this.selectors.saveProfileChangesBtn).off("click");
    $(document).off("click", "#profileConfirmLogoutBtn");
    $(this.selectors.postsContainer).off("click", ".post");
    $(this.selectors.partecipazioniContainer).off("click", ".post");

    $("#profileLogoutModal").fadeOut();
    if (this.editProfileModal.length) {
      const modalInstance = bootstrap.Modal.getInstance(
        this.editProfileModal[0]
      );
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    $("#profileLogoutModal").remove();
    $(this.selectors.postsContainer).empty();
    $(this.selectors.partecipazioniContainer).empty();
  }
}
