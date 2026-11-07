import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

export const getDevices = async (search = "", status = "") => {
    const response = await api.get("/", {
        params: { search, status }
    });
    return response.data;
};

export const getDeviceById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

export const createDevice = async (device) => {
    const response = await api.post("/", device);
    return response.data;
};

export const updateDevice = async (id, device) => {
    const response = await api.put(`/${id}`, device);
    return response.data;
};

export const deleteDevice = async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
};