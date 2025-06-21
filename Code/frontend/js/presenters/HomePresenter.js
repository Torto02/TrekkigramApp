import { Presenter } from "./Presenter.js";
import * as HomeUtils from "./../utils/HomeUtils.js";
import { showToast } from "../utils/ToastUtils.js";

export class HomePresenter extends Presenter {
  constructor(router) {
    super(router);

    this.selectors = {
      postsContainerPerTe: "#trekking-posts-container",
      postsContainerSeguiti: "#partecipazioniContainer",
      loadMoreBtn: "#loadMoreBtn",
      loadMoreFollowedBtn: "#loadMoreFollowedBtn",
      resetFilterBtn: "#ResetFilterBtn",
      applyFilterBtn: "#applyFilterBtn",
      toggleFiltersBtn: "#toggleFiltersBtn",
      tabSelector: "#tabSelector .tab-link",
      tabContent: ".tab-pane",
      filterPanel: "#filterPanel",
      filterDifficulty: "#filter-difficulty",
      filterStartDate: "#filter-start-date",
      filterEndDate: "#filter-end-date",
      filterRegion: "#filter-region",
      appContainer: ".app-container", // Added selector for app container
    };
    Object.entries(this.selectors).forEach(([key, selector]) => {
      this[key] = $(selector);
    });

    this.page = 1; // Stato per la paginazione
    this.postsPerPage = 10; // Numero di post per pagina
    this.filters = {}; // Stato per i filtri
    this.currentTab = HomeUtils.checkTab() ? HomeUtils.checkTab() : "perTe";

    this.init();
  }

  bindEvents() {
    HomeUtils.setActiveTab(this.currentTab, this.tabSelector);
    this.loadPosts(this.currentTab);

    // Toggle filters panel
    this.toggleFiltersBtn.on("click", (e) => {
      e.stopPropagation(); // Prevent this click from bubbling up to document
      $(this.filterPanel).toggleClass("show");
    });

    this.tabSelector.on("click", (e) => this.handleTabChange(e));
    this.loadMoreBtn.on("click", () => this.loadPosts("perTe", false));
    this.loadMoreFollowedBtn.on("click", () =>
      this.loadPosts("seguiti", false)
    ); // Carica i post "seguiti"

    // Close filter panel when Apply button is clicked
    this.applyFilterBtn.on("click", () => {
      this.applyFilters();
      $(this.filterPanel).removeClass("show"); // Close the filter panel
    });
    this.resetFilterBtn.on("click", () => {
      this.resetFilters();
      $(this.filterPanel).removeClass("show");
    });

    // Close filter panel when clicking outside of it
    $(document).on("click", (e) => {
      if (
        $(this.filterPanel).hasClass("show") &&
        !$(e.target).closest(this.filterPanel).length &&
        !$(e.target).closest(this.toggleFiltersBtn).length
      ) {
        $(this.filterPanel).removeClass("show");
      }
    });

    // Stop propagation on filter panel clicks to prevent closing when clicking inside
    $(this.filterPanel).on("click", (e) => {
      e.stopPropagation();
    });

    // Add scroll event listener for tab shadow effect
    this.handleScroll = () => {
      const tabSelector = document.getElementById("tabSelector");
      if (tabSelector) {
        if (window.scrollY > 10) {
          tabSelector.classList.add("scrolled");
        } else {
          tabSelector.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", this.handleScroll);
  }

  async loadPosts(tab = "perTe", clear = true) {
    let params = { page: this.page, perPage: this.postsPerPage };
    const endpoint = HomeUtils.buildEndpointUrl(tab, this.filters, params);

    try {
      const response = await this.makeRequest(endpoint);
      HomeUtils.displayPosts(response, tab, this.selectors, this.router, clear);
      this.appContainer.removeClass("d-none");
      this.page++;
    } catch (error) {
      console.error("Error loading posts:", error);
      this.appContainer.removeClass("d-none");
      // window.showToast("Errore nel caricamento dei post.", "text-bg-danger");
    }
  }

  async applyFilters() {
    this.filters = {
      difficulty: this.filterDifficulty.val(),
      startDate: this.filterStartDate.val(),
      endDate: this.filterEndDate.val(),
      region: this.filterRegion.val(),
    };
    this.page = 1;
    this.loadPosts(this.currentTab);
  }

  resetFilters() {
    this.filters = {};
    this.filterDifficulty.val("all");
    this.filterStartDate.val("");
    this.filterEndDate.val("");
    this.filterRegion.val("all");
    this.page = 1;
    this.loadPosts(this.currentTab);
  }

  async handleTabChange(e) {
    e.preventDefault();
    // Find the closest element with href attribute or the target itself
    const target = $(e.target).closest("[href]").length
      ? $(e.target).closest("[href]")
      : $(e.target);

    // Check if href exists before trying to use it
    const href = target.attr("href");
    if (!href) {
      console.error("No href attribute found on tab element");
      return;
    }

    this.currentTab = href.replace("#tab", "").toLowerCase();
    this.page = 1; // Resetta la pagina quando si cambia scheda
    HomeUtils.setActiveTab(this.currentTab, this.tabSelector);
    this.loadPosts(this.currentTab);
  }

  async handleParticipation(action, eventId, buttonElement) {
    const endpoint = {
      subscribe: {
        url: `/participations/subscribe`,
        method: "POST",
        data: {
          eventId: eventId,
        },
      },
      unsubscribe: {
        url: `/participations/unsubscribe`,
        method: "DELETE",
        data: {
          eventId: eventId,
        },
      },
    };

    const config = endpoint[action];
    try {
      const response = await this.makeRequest(
        config.url,
        config.method,
        config.data
      );

      if (response.success) {
        // Update button UI instead of reloading all posts
        this.updateParticipationButton(buttonElement, action === "subscribe");
      } else {
        showToast(
          "Errore durante l'azione di partecipazione",
          "text-bg-danger"
        );
        console.error("Errore durante l'azione di partecipazione");
      }
    } catch (error) {
      showToast("Errore durante l'azione di partecipazione", "text-bg-danger");
      console.error(error);
    }
  }

  updateParticipationButton(button, isSubscribed) {
    if (isSubscribed) {
      // User subscribed to event
      button.classList.remove("btn-outline-primary");
      button.classList.add("btn-success");
      button.innerHTML = '<i class="bi bi-check-circle-fill me-1"></i>Iscritto';
    } else {
      // User unsubscribed from event
      button.classList.remove("btn-success");
      button.classList.add("btn-outline-primary");
      button.innerHTML = '<i class="bi bi-person-plus-fill me-1"></i>Partecipa';
    }
  }

  cleanup() {
    // Remove scroll event listener
    if (this.handleScroll) {
      window.removeEventListener("scroll", this.handleScroll);
    }

    // Remove other event listeners
    this.toggleFiltersBtn.off("click");
    this.tabSelector.off("click");
    this.loadMoreBtn.off("click");
    this.loadMoreFollowedBtn.off("click");
    this.applyFilterBtn.off("click");
    this.resetFilterBtn.off("click");
    $(document).off("click"); // Remove document click handler
    $(this.filterPanel).off("click"); // Remove filter panel click handler
  }
}
