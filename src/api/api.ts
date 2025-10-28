import axios, { type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null") {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response; 
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      console.error("Erro de Autenticação/Autorização, deslogando...", error.response.status);
      localStorage.removeItem("token");
      
      if (window.location.pathname !== "/auth/login") {
         window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error); 
  }
);

export default api;