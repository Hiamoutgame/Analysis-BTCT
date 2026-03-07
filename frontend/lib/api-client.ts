import axios from "axios";

const defaultBaseUrl = "http://127.0.0.1:8000/api/v1";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || defaultBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});
