import axios from "axios";

const api = axios.create({
  baseURL: "https://focuslifehub.onrender.com", 
  withCredentials: true, 
});

export default api;