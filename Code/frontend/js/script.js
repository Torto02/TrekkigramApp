import { getRouterInstance } from "./router.js";
import "./expiredtoken.js";

export async function loadView(tag, filename) {
  try {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}: ${response.status}`);
    }
    const content = await response.text();
    $(tag).empty().append(content);
  } catch (error) {
    console.error("Error loading view:", error);
  }
}

const router = getRouterInstance();

async function loadSidebar(router) {
  await loadView("#sidebarContainer", "/html/sidebar.html");
  const module = await import("./presenters/SidebarPresenter.js");
  router.sidebarPresenter = new module.SidebarPresenter(router);
}

async function loadMainContent(
  router,
  filename,
  presenterModulePath,
  ...presenterArgs
) {
  await loadView("main", filename);

  // Carica la sidebar solo se non esiste già e se non siamo in una pagina di autenticazione o 404
  const currentPath = window.location.pathname;
  const isAuthPage =
    currentPath.includes("/auth/") || currentPath.includes("/404");

  if (!isAuthPage) {
    if (!router.sidebarPresenter) {
      await loadSidebar(router);
    }
    // Assicuriamoci che il container della sidebar sia visibile
    $("#sidebarContainer").show();
  } else {
    // Nascondi completamente il container della sidebar
    $("#sidebarContainer").hide();
  }

  const module = await import(presenterModulePath);
  router.currentPresenter = new module[Object.keys(module)[0]](
    router,
    ...presenterArgs
  );
  window.scrollTo(0, 0);
}

// Function to check if user is authenticated via session
async function isAuthenticated() {
  try {
    const response = await fetch(
      "http://trekkigram.com:8080/auth/check-session",
      {
        method: "GET",
        credentials: "include", // Important for sending cookies
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.authenticated;
    }
    return false;
  } catch (error) {
    console.error("Session check error:", error);
    return false;
  }
}

$(document).ready(async function () {
  let currentPath = window.location.pathname;

  window.addEventListener("popstate", () => {
    currentPath = window.location.pathname;
    router.navigate(currentPath, false);
  });

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (state, title, url) {
    originalPushState.apply(this, arguments);
    currentPath = window.location.pathname;
  };

  history.replaceState = function (state, title, url) {
    originalReplaceState.apply(this, arguments);
    currentPath = window.location.pathname;
  };

  if (Object.keys(router.routes).length === 0) {
    router.addRoute("/events/posts", async () => {
      // Check authentication using session
      if (!(await isAuthenticated())) {
        router.navigate("/auth/login");
      } else {
        await loadMainContent(
          router,
          "/html/home.html",
          "./presenters/HomePresenter.js"
        );
      }
    });

    router.addRoute("/user/:username", async (username) => {
      // Check authentication using session
      if (!(await isAuthenticated())) {
        router.navigate("/auth/login");
      } else {
        await loadMainContent(
          router,
          "/html/profile.html",
          "./presenters/ProfilePresenter.js",
          username
        );
      }
    });

    router.addRoute("/events/eventID=:eventID", async (eventID) => {
      // Check authentication using session
      if (!(await isAuthenticated())) {
        router.navigate("/auth/login");
      } else {
        await loadMainContent(
          router,
          "/html/event.html",
          "./presenters/EventPresenter.js",
          eventID
        );
      }
    });

    router.addRoute("/event/create", async () => {
      // Check authentication using session
      if (!(await isAuthenticated())) {
        router.navigate("/auth/login");
      } else {
        await loadMainContent(
          router,
          "/html/createEvent.html",
          "./presenters/CreateEventPresenter.js"
        );
      }
    });

    router.addRoute("/auth/login", async () => {
      if (router.sidebarPresenter && router.sidebarPresenter.cleanup) {
        router.sidebarPresenter.cleanup();
        router.sidebarPresenter = null;
      }
      await loadView("main", "/html/login.html");
      const module = await import("./presenters/LoginPresenter.js");
      router.currentPresenter = new module.LoginPresenter(router);
      window.scrollTo(0, 0);
    });

    router.addRoute("/auth/register", async () => {
      await loadView("main", "/html/register.html");
      const module = await import("./presenters/RegisterPresenter.js");
      router.currentPresenter = new module.RegisterPresenter(router);
      window.scrollTo(0, 0);
    });

    router.addRoute(".", async () => {
      // Check authentication using session
      router.navigate(
        (await isAuthenticated()) ? "/events/posts" : "/auth/login"
      );
    });

    router.addRoute(".*", async () => {
      history.replaceState({}, "", "/404");
      await loadView("main", "/html/404.html");
    });
  }

  const navEntries = performance.getEntriesByType("navigation");
  const navigationType =
    navEntries.length > 0 ? navEntries[0].type : "navigate";

  if (navigationType === "reload" || navigationType === "navigate") {
    let path = window.location.pathname;
    if (navigationType === "reload") {
      // Rimuovi i query params se è un reload
      path = window.location.pathname;
    } else {
      path = window.location.pathname + window.location.search;
    }
    router.navigate(path, false);
    window.scrollTo(0, 0);
  } else if (navigationType === "back_forward") {
    window.scrollTo(0, 0);
  }

  // Check authentication using session for sidebar loading
  if (
    (await isAuthenticated()) &&
    !["/auth/login", "/auth/register"].includes(window.location.pathname)
  ) {
  }
});
