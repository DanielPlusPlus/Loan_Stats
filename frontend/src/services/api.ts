import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://localhost:5001',
  timeout: 300000,
});

export default api;
