import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function getApiError(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.request) {
    return "Nao foi possivel conectar a API. Confira se o backend esta rodando e se NEXT_PUBLIC_API_URL aponta para a porta correta.";
  }

  return "Nao foi possivel concluir a operacao.";
}
