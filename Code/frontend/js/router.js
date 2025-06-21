class Router {
  constructor() {
    this.routes = {};
    this.currentPresenter = null;
    this.sidebarPresenter = null;
    this.lastVisitedPath = null;
    this.resetOnReload = false;
  }

  addRoute(path, callback) {
    this.routes[path] = callback;
  }

  getQueryParams(url) {
    const queryString = url.split("?")[1];
    if (!queryString) return {};

    return queryString.split("&").reduce((params, param) => {
      const [key, value] = param.split("=");
      params[decodeURIComponent(key)] = decodeURIComponent(value || "");
      return params;
    }, {});
  }

  navigate(path, addToHistory = true) {
    // console.log(">>> router.navigate()", path, "addToHistory =", addToHistory);

    // Cleanup del presenter corrente
    if (
      this.currentPresenter &&
      typeof this.currentPresenter.cleanup === "function"
    ) {
      this.currentPresenter.cleanup();
    }

    // Verifica se stiamo navigando verso una pagina di autenticazione o 404
    const isAuthOrErrorPage = path.startsWith("/auth/") || path === "/404";

    // Cleanup della sidebar quando si naviga verso pagine di login/register/404
    if (
      isAuthOrErrorPage &&
      this.sidebarPresenter &&
      typeof this.sidebarPresenter.cleanup === "function"
    ) {
      this.sidebarPresenter.cleanup();
      this.sidebarPresenter = null;
      // Nascondi completamente il container della sidebar
      $("#sidebarContainer").hide();
    }

    const [pathWithoutQuery, queryString] = path.split("?");

    if (addToHistory && window.location.pathname !== pathWithoutQuery) {
      history.pushState({}, "", path);
    }

    const matchedRoute = Object.entries(this.routes).find(([routePath]) => {
      const pattern = new RegExp(
        "^" + routePath.replace(/:\w+/g, "([^/]+)") + "$"
      );
      return pattern.test(pathWithoutQuery);
    });

    if (matchedRoute) {
      const [routePath, callback] = matchedRoute;
      const pattern = new RegExp(
        "^" + routePath.replace(/:\w+/g, "([^/]+)") + "$"
      );
      const params = pattern.exec(pathWithoutQuery)?.slice(1) || [];
      const queryParams = this.getQueryParams(path);

      callback(...params, queryParams);
    } else {
      console.warn(`Route not found: ${pathWithoutQuery}`);
      // Gestire il caso in cui la route non viene trovata (es. route 404)
      if (this.routes[".*"]) {
        this.routes[".*"]();
      }
    }

    this.lastVisitedPath = pathWithoutQuery;
  }
}

// Singleton pattern
let instance = null;

export function getRouterInstance() {
  if (!instance) {
    instance = new Router();
  }
  return instance;
}
