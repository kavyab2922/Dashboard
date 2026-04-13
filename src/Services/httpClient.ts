import axios from "axios";

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000
});

httpClient.interceptors.request.use((config) => {
  config.headers.set("Content-Type", "application/json");
  config.headers.set("Accept", "application/json");
  return config;
});

export { httpClient };
