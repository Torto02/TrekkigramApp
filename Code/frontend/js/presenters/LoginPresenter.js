import { Presenter } from "./Presenter.js";
import { showToast } from "../utils/ToastUtils.js";

export class LoginPresenter extends Presenter {
  constructor(router) {
    super(router);
    this.selectors = {
      emailInput: "#InputEmail",
      passwordInput: "#InputPassword",
      loginBtn: "#loginBtn",
      registerLink: "#registerRedirectionBtn",
    };
    Object.entries(this.selectors).forEach(([key, selector]) => {
      this[key] = $(selector);
    });
    this.init();
  }

  bindEvents() {
    this.loginBtn.on("click", () => this.handleLogin());
    this.registerLink.on("click", () => this.router.navigate("/auth/register"));

    $(".loginForm").removeClass("d-none");
  }

  async handleLogin() {
    const email = this.emailInput.val();
    const password = this.passwordInput.val();

    if (!email || !password) {
      console.error("Email and password are required");
      showToast("Email e password sono richieste", "danger");
      return;
    }

    try {
      const response = await this.makeRequest("/auth/login", "POST", {
        email,
        password,
      });

      if (response.success) {
        localStorage.setItem("username", response.userinfo.Username);
        localStorage.setItem("UserId", response.userinfo.UserID);

        // Navigate to posts
        this.router.navigate("/events/posts");
        showToast("Login effettuato con successo", "success");
      } else {
        showToast("Credenziali errate", "danger");
        console.error("Login error:", response.message);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  }
}
