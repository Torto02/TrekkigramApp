export class Presenter {
  constructor(router) {
    this.router = router;
    this.apiBaseURL = "http://trekkigram.com:8080";
  }

  init() {
    this.bindEvents();
  }

  async makeRequest(endpoint, method = "GET", data) {
    console.log("Making request to:", `${this.apiBaseURL}${endpoint}`);

    const config = {
      url: `${this.apiBaseURL}${endpoint}`,
      method: method,
      headers: {
        Accept: "application/json",
      },
      // Include credentials to send cookies with the request
      credentials: "include",
    };

    if (data && data instanceof FormData) {
      config.body = data;
    } else if (data) {
      config.headers["Content-Type"] = "application/json";
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(config.url, config);
      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login page if session is invalid
          this.router.navigate("/auth/login");
        }
      }
      return await response.json();
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  }

  handleError(error, context = "") {
    console.error(`${context} error:`, error);
  }
}
