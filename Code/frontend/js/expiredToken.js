$(document).ready(function () {
  $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
    if (jqxhr.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      if (
        window.location.pathname !== "/auth/login" &&
        window.location.pathname !== "/auth/register"
      ) {
        showToast(
          "Sessione Scaduta! Si prega di effettuare il Login",
          "text-bg-danger"
        );

        router.navigate("/auth/login");
      }
    } else {
      console.error("Errore AJAX:", thrownError);
    }
  });
});
