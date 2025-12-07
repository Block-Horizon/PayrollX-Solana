import { Api } from "@/lib/generated/api";

/**
 * Get authentication token from sessionStorage or localStorage (fallback)
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  let token = sessionStorage.getItem("auth-storage");
  if (!token) {
    token = localStorage.getItem("auth-storage");
  }

  if (token) {
    try {
      const authData = JSON.parse(token);
      return authData.state?.token || null;
    } catch (error) {
      console.error("Error parsing auth token:", error);
      return null;
    }
  }
  return null;
}

/**
 * Security worker to inject authentication token
 */
function securityWorker(token: string | null) {
  if (!token) return {};

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

// Create Api instance
// baseURL includes /api prefix to match gateway routes
const api = new Api<string>({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}`,
  securityWorker,
  secure: true,
});

// Setup authentication on the axios instance
const axiosInstance = api.instance;

// Create a convenience wrapper for easier access
const apiClient = {
  auth: {
    login: (data: { email: string; password: string }) =>
      api.api.authLoginCreate(data),
    register: (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => api.api.authRegisterCreate(data),
  },
  // Expose axios instance for direct calls
  instance: axiosInstance,
};

// Request interceptor for auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh and logout on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth-storage");
        localStorage.removeItem("auth-storage");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Update the API instance's security data when token changes
if (typeof window !== "undefined") {
  const token = getAuthToken();
  api.setSecurityData(token);

  const updateTokenFromStorage = () => {
    const newToken = getAuthToken();
    api.setSecurityData(newToken);
  };

  const originalSessionSetItem = sessionStorage.setItem.bind(sessionStorage);
  sessionStorage.setItem = function (key, value) {
    originalSessionSetItem(key, value);
    if (key === "auth-storage") {
      updateTokenFromStorage();
    }
  };

  const originalLocalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function (key, value) {
    originalLocalSetItem(key, value);
    if (key === "auth-storage") {
      updateTokenFromStorage();
    }
  };

  window.addEventListener("storage", (e) => {
    if (e.key === "auth-storage") {
      updateTokenFromStorage();
    }
  });
}

export default apiClient;
export { axiosInstance };
export { api };
