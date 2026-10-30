import axios from "axios";
import { toast } from "react-toastify";

/**
 * Configure global axios interceptors to automatically include JWT bearer tokens
 * and gracefully handle rate limiting or session expiry.
 */
export function setupAxiosInterceptors() {
  // Request interceptor: attach Authorization header
  axios.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem("token");
      if (token && !config.headers["Authorization"]) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: handle 401 Unauthorized & 429 Rate Limiting
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        if (error.response.status === 429) {
          toast.warning("⏳ High traffic: Rate limit reached. Please wait a moment.", {
            toastId: "rate-limit-toast",
          });
        } else if (error.response.status === 401 && !window.location.pathname.includes("/login")) {
          // Token expired or invalid
          sessionStorage.clear();
          toast.error("Session expired. Please log in again.", {
            toastId: "session-expired-toast",
          });
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
}
