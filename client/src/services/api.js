import axios from "axios";

const API_URL = "https://skill-exchange-board-production.up.railway.app/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// LISTINGS API CALLS
// ============================================

export const searchListings = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        params.append(key, filters[key]);
      }
    });

    const url = `/listings/search?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("❌ Error searching listings:", error);
    throw error.response?.data || error.message;
  }
};

export const getNearbyListings = async (
  lat,
  lng,
  radius = 10,
  filters = {}
) => {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      ...filters,
    });

    const response = await api.get(`/listings/nearby?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Error getting nearby listings:", error);
    throw error.response?.data || error.message;
  }
};

export const getAllListings = async () => {
  try {
    const response = await api.get("/listings");
    return response.data;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error.response?.data || error.message;
  }
};

export const createListing = async (listingData) => {
  try {
    const response = await api.post("/listings", listingData);
    return response.data;
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error.response?.data || error.message;
  }
};

export const getMyListings = async () => {
  try {
    const response = await api.get("/listings/mine");
    return response.data;
  } catch (error) {
    console.error("Error fetching my listings:", error);
    throw error.response?.data || error.message;
  }
};

export const updateListing = async (id, listingData) => {
  try {
    const response = await api.put(`/listings/${id}`, listingData);
    return response.data;
  } catch (error) {
    console.error("Error updating listing:", error);
    throw error.response?.data || error.message;
  }
};

export const deleteListing = async (id) => {
  try {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error.response?.data || error.message;
  }
};

export default api;
