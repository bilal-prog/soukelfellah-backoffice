"use client";

import axios from "axios";

export const clientApi = axios.create({ baseURL: "/api/backoffice" });

clientApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("soukelfellah_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
