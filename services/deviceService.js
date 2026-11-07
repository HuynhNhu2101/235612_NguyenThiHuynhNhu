
import axios from "axios";

// Địa chỉ Backend API lấy từ file .env
const API_URL = import.meta.env.VITE_API_URL;

// Tạo axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// Lấy danh sách thiết bị
export const getDevices = async (search = "", status = "") => {
    const response = await api.get("/", {
        params: { search, status }
    });
    return response.data;
};

// Lấy chi tiết thiết bị
export const getDeviceById = async (id) => {
    const response = await api.get(`/${id}`);
    return response.data;
};

// Thêm thiết bị
export const createDevice = async (device) => {
    const response = await api.post("/", device);
    return response.data;
};

// Cập nhật thiết bị
export const updateDevice = async (id, device) => {
    const response = await api.put(`/${id}`, device);
    return response.data;
};

// Xóa thiết bị
export const deleteDevice = async (id) => {
    const response = await api.delete(`/${id}`);
    return response.data;
};
