// external
import axios from "axios";

// internal
import { API_BASE_URL } from "../configuration/config";

/**
 * preconfigured axios instance.
 * add auth interceptors here when you integrate cloud saving.
 * e.g.:
 *   api.interceptors.request.use(async (config) => {
 *     const token = await getToken();
 *     config.headers.Authorization = `Bearer ${token}`;
 *     return config;
 *   });
 */

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
