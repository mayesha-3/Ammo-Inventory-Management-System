import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, 
});

// ---------------- AUTH ----------------
export const signup = (data: {
  email: string;
  password: string;
  name: string;
  pinNo: string;
}) => API.post("/auth/signup", data);

export const login = (data: { email: string; password: string }) =>
  API.post("/auth/login", data);

// ---------------- USERS ----------------
export const getMe = () => API.get("/users/me");

export const getAllUsers = () =>
  API.get("/users/allusers");

// ---------------- ISSUANCES ----------------
export const getMyIssuances = () => API.get("/users/issuances");

// ---------------- AMMO ORDERS ----------------
export const orderAmmo = (data: { caliber: string; quantity: number }) =>
  API.post("/users/order", data);

// Order from existing stock
export const orderFromStock = (data: { ammoId: number; quantity: number }) =>
  API.post("/users/order/stock", data);

// Admin can later fetch all orders
export const getAllOrders = () => API.get("/users/orders");

// Get user's own orders
export const getMyOrders = () => API.get("/users/myorders");

// Update order status
export const updateOrderStatus = (orderId: number, status: string, issuedQuantity?: number, ammoId?: number) =>
  API.patch(`/users/orders/${orderId}`, { status, issuedQuantity, ammoId });

//-------------------Get inventory------------
export const getAmmoInventory = () => API.get("/users/inventory");

//-------------------Ammo Admin Management------------
export const getAmmoForAdmin = () => API.get("/users/ammo/all");

export const createAmmo = (data: { caliber: string; quantity: number; supplierId?: number }) =>
  API.post("/users/ammo/create", data);

export const updateAmmo = (id: number, data: { caliber?: string; quantity?: number }) =>
  API.patch(`/users/ammo/${id}`, data);

export const deleteAmmo = (id: number) =>
  API.delete(`/users/ammo/${id}`);

//-------------Get Guns-----------
export const getGuns = () => API.get("/guns");