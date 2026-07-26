import axios from "axios";
import { removeUser } from "../storage/userStorage";

export const api = axios.create({
  baseURL: "https://ekalan.com/api",
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeUser();
    }

    return Promise.reject(error);
  },
);
