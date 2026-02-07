import axios from "axios";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { emitUnauthorized } from "@/lib/authEvents";

// Dynamic base URL detection for development
const getDevBaseUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8000`;
  }
  return "http://localhost:8000";
};

const baseURL = __DEV__ ? getDevBaseUrl() : "https://your-api.com";

export const instance = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 120000, // 2 minutes for AI quiz generation
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync("token");
      emitUnauthorized();
    }
    return Promise.reject(error);
  }
);
