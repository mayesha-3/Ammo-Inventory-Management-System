import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000", // your Hono backend
  withCredentials: true, // ✅ enables cookie-based auth
});

export const signup = (data: {
  email: string;
  password: string;
  name: string;
}) => API.post("/auth/signup", data);

export const login = (data: { email: string; password: string }) =>
  API.post("/auth/login", data);

export const getMe = () => API.get("/users/me");

export const getAllUsers = (page = 1, limit = 10) =>
  API.get(`/users/allusers?page=${page}&limit=${limit}`);
