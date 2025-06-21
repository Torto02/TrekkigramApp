import { Presenter } from "./Presenter.js";
import * as EventUtils from "../utils/EventUtils.js";
import { showToast } from "../utils/ToastUtils.js";

export class EventPresenter extends Presenter {
  constructor(router, eventID) {
    super(router);
    this.eventID = eventID;

    // No changes needed in the constructor
    this.selectors = {
      title: ".event-title",
      author: ".event-author",
      creatorBadge: ".creator-badge",
      creatorImage: ".creator-profile-img",
      description: ".event-description",
      date: ".event-date",
      location: ".event-location",
      difficulty: ".event-difficulty",
      imageContainer: ".event-image img",
      imageGallery: "#imageGallery",
      mapContainer: "#mapContainer",
      participationBtn: "#participationBtn",
      imageViewerModal: "#imageViewerModal",
      fullImageCarousel: "#fullImageCarousel",
      prevImageBtn: "#prevImage",
      nextImageBtn: "#nextImage",
      editEventBtn: "#editEventBtn",
      modalClose: ".modal-close",
      imageCounter: ".image-counter",
      inviteBtn: "#inviteBtn",
      partecipantsBtn: "#toggleParticipants",
    };

    Object.entries(this.selectors).forEach(([key, selector]) => {
      this[key] = $(selector);
    });
    this.init();
  }

  async bindEvents() {
    // Hide all modals at start
    EventUtils.hideAllModals();

    await this.loadEvent();
    EventUtils.setupImageViewer(this.selectors);
    $(".mainContent").removeClass("d-none");
  }

  async loadEvent() {
    const response = await this.makeRequest(`/events?eventId=${this.eventID}`);
    if (response.success && response.eventInfo)
      EventUtils.renderEvent(response.eventInfo, this.selectors, this.router);
    else this.router.navigate("/404");
  }

  async handleParticipation(action) {
    const endpoint = {
      subscribe: {
        url: `/participations/subscribe`,
        method: "POST",
        data: {
          eventId: this.eventID,
        },
      },
      unsubscribe: {
        url: `/participations/unsubscribe`,
        method: "DELETE",
        data: {
          eventId: this.eventID,
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
        this.loadEvent();
      } else {
        console.error("Errore durante l'azione di partecipazione");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async viewParticipants(eventID) {
    try {
      const response = await this.makeRequest(
        `/participations?eventId=${eventID}`
      );
      EventUtils.renderParticipantsList(response.Participants, this.selectors);

      $("#participantsList").off("click", ".participant-item");
      $("#participantsList").on("click", ".participant-item", (e) => {
        const username = $(e.currentTarget).data("username");
        if (username) {
          this.router.navigate(`/user/${username}`);
        }
      });
    } catch (error) {
      console.error("Error loading participants:", error);
    }
  }

  async getInvitationsList(eventID) {
    try {
      const response = await this.makeRequest(
        `/participations/friendList/status?eventId=${eventID}`
      );
      EventUtils.renderInvitationsList(
        response.FriendList,
        this.selectors,
        this.router
      );
    } catch (error) {
      console.error(`Error loading invitations: ${error}`);
    }
  }

  async inviteFriend(userId) {
    try {
      const response = await this.makeRequest(
        `/participations/invite`,
        "POST",
        {
          eventId: this.eventID,
          userId: userId,
        }
      );
      if (response.success) {
        showToast("Invito inviato con successo!", "info");
      }
    } catch (error) {
      console.error(`Error while inviting friend: ${error}`);
    }
  }

  async editEvent() {
    try {
      const response = await this.makeRequest(
        `/events/update?eventId=${this.eventID}`,
        "PUT",
        {
          EventName: $("#eventName").val(),
          EventDescription: $("#eventDescription").val(),
          DateTime: $("#eventDate").val(),
          Difficulty: $("#eventDifficulty").val(),
        }
      );
      this.loadEvent();
      if (response.success) {
        showToast("Evento aggiornato con successo!", "info");
      }
    } catch (error) {
      console.error(`Error while updating event: ${error}`);
    }
  }

  async deleteEvent() {
    try {
      const response = await this.makeRequest(
        `/events/delete?eventId=${this.eventID}`,
        "DELETE"
      );

      this.router.navigate("/");
      showToast("Evento eliminato con successo!", "info");
    } catch (error) {
      console.error(`Error while deleting event: ${error}`);
    }
  }

  cleanup() {
    // Hide all modals and remove event listeners
    EventUtils.hideAllModals();

    // Rimuovi tutti gli event listener per evitare duplicati
    $(this.selectors.creatorBadge).off("click");
    $(this.selectors.participationBtn).off("click");
    $(this.selectors.partecipantsBtn).off("click");
    $(this.selectors.inviteBtn).off("click");
    $(this.selectors.editEventBtn).off("click");
    $("#participantsList").off("click", ".participant-item");
    $("body").removeClass("image-viewer-open");
  }
}
