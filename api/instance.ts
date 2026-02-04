import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const baseURL = __DEV__ ? 'http://localhost:8000' : 'https://your-api.com';

export const instance = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optionally clear token / redirect to login
    }
    return Promise.reject(error);
  }
);
