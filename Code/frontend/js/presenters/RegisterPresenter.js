import { showToast } from "../utils/ToastUtils.js";
import { Presenter } from "./Presenter.js";

export class RegisterPresenter extends Presenter {
  constructor(router) {
    super(router);
    this.selectors = {
      registerForm: "#registerForm",
      emailInput: "#RegisterEmail",
      nameInput: "#Name",
      surnameInput: "#Surname",
      usernameInput: "#username",
      passwordInput: "#Password",
      confirmPasswordInput: "#ConfirmPassword",
      privacyPrivateRadio: "#privacyPrivate",
      privacyPublicRadio: "#privacyPublic",
      privacyMessage: "#privacyMessage p",
      submitBtn: "#SubmitBtn",
      uploadProfileImageBtn: ".profile-image-container",
      profileImageInput: "#profileImageInput",
      profileImagePreview: "#profileImagePreview",
      profileImagePlaceholder: "#profileImagePlaceholder",
      removeProfileImage: "#removeProfileImage",
      loginLink: "#loginLink",
    };
    this.selectedProfileImageFile = null;
    this.init();
  }

  bindEvents() {
    $(this.selectors.registerForm).on("submit", (e) => this.signIn(e));
    $(this.selectors.uploadProfileImageBtn).on("click", () =>
      this.imageUpload()
    );
    $(this.selectors.profileImageInput).on("change", (event) =>
      this.handleImagePreview(event)
    );
    $(this.selectors.removeProfileImage).on("click", (e) => {
      e.stopPropagation(); // Ferma la propagazione dell'evento
      this.removeProfileImage();
    });

    // Add event listeners for privacy radio buttons
    $(this.selectors.privacyPrivateRadio).on("change", () =>
      this.updatePrivacyMessage()
    );
    $(this.selectors.privacyPublicRadio).on("change", () =>
      this.updatePrivacyMessage()
    );

    $(loginLink).on("click", (e) => {
      e.preventDefault();
      this.router.navigate("/auth/login");
    });

    $(".registerForm").removeClass("d-none");
  }

  // New method to update privacy message
  updatePrivacyMessage() {
    if ($(this.selectors.privacyPublicRadio).is(":checked")) {
      $(this.selectors.privacyMessage).text(
        "I tuoi post saranno visibili a tutti"
      );
    } else {
      $(this.selectors.privacyMessage).text(
        "I tuoi post saranno visibili solo ai tuoi amici"
      );
    }
  }

  async signIn(event) {
    event.preventDefault(); // Previeni il submit del form standard
    const email = $(this.selectors.emailInput).val();
    const name = $(this.selectors.nameInput).val();
    const surname = $(this.selectors.surnameInput).val();
    const username = $(this.selectors.usernameInput).val();
    const password = $(this.selectors.passwordInput).val();
    const confirmPassword = $(this.selectors.confirmPasswordInput).val();
    const privacy = $(this.selectors.privacyPrivateRadio).is(":checked")
      ? 1
      : 0;

    // Check if any required field is empty
    if (
      email.trim() === "" ||
      name.trim() === "" ||
      surname.trim() === "" ||
      username.trim() === "" ||
      password.trim() === "" ||
      confirmPassword.trim() === ""
    ) {
      showToast("Tutti i campi sono obbligatori", "danger");
      console.error("Tutti i campi sono obbligatori");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Le password non corrispondono", "danger");
      console.error("Le password non corrispondono");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("name", name);
    formData.append("surname", surname);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("privacy", privacy);
    formData.append("confirmPassword", confirmPassword);

    if (this.selectedProfileImageFile) {
      formData.append("profileImage", this.selectedProfileImageFile);
    }

    try {
      const response = await this.makeRequest(
        "/auth/register",
        "POST",
        formData
      );
      if (response.success) {
        console.log(response);
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("username", response.userinfo.Username);
        localStorage.setItem("UserId", response.userinfo.UserID);
        this.router.navigate("/events/posts");
        showToast("Registrazione effettuato con successo", "success");
      } else {
        showToast("Registrazione fallita: " + response.message, "danger");
        console.error(response.message);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async imageUpload() {
    $(this.selectors.profileImageInput).click(); // Simula il click sull'input file
  }

  handleImagePreview(event) {
    const file = event.target.files[0];
    if (file) {
      this.selectedProfileImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        $(this.selectors.profileImagePreview)
          .attr("src", e.target.result)
          .show();
        $(this.selectors.profileImagePlaceholder).hide();
        $(this.selectors.removeProfileImage).show();
      };
      reader.readAsDataURL(file);
    }
  }

  async removeProfileImage() {
    this.selectedProfileImageFile = null;
    $(this.selectors.profileImagePreview).attr("src", "").hide();
    $(this.selectors.profileImagePlaceholder).show();
    $(this.selectors.removeProfileImage).hide();
    $(this.selectors.profileImageInput).val(""); // Resetta l'input file
  }

  // cleanup() {
  //   $(this.selectors.registerForm).off("submit");
  //   $(this.selectors.uploadProfileImageBtn).off("click");
  //   $(this.selectors.profileImageInput).off("change");
  //   $(this.selectors.removeProfileImage).off("click");
  //   $(this.selectors.privacyPrivateRadio).off("change");
  //   $(this.selectors.privacyPublicRadio).off("change");
  // }
}
