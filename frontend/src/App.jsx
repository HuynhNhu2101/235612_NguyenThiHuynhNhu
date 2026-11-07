import React, { useEffect, useState } from "react";
import DeviceList from "./components/DeviceList";
import DeviceForm from "./components/DeviceForm";
import DeviceDetail from "./components/DeviceDetail";

import {
    getDevices,
    createDevice,
    updateDevice,
    deleteDevice
} from "./services/deviceService.js";

import "./App.css";

function App() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [selectedDevice, setSelectedDevice] = useState(null);

    const fetchDevices = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getDevices(search, status);
            setDevices(Array.isArray(data) ? data : data.devices || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể tải danh sách thiết bị. Vui lòng kiểm tra Backend."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [search, status]);

    const handleSubmit = async (formData) => {
        try {
            setError("");

            if (editingDevice) {
                await updateDevice(editingDevice._id, formData);
                alert("Cập nhật thiết bị thành công!");
            } else {
                await createDevice(formData);
                alert("Thêm thiết bị thành công!");
            }

            setShowForm(false);
            setEditingDevice(null);
            fetchDevices();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể lưu thiết bị. Vui lòng kiểm tra lại."
            );
        }
    };

    const handleEdit = (device) => {
        setEditingDevice(device);
        setShowForm(true);
        setSelectedDevice(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
            return;
        }

        try {
            await deleteDevice(id);
            alert("Xóa thiết bị thành công!");
            fetchDevices();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Không thể xóa thiết bị."
            );
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingDevice(null);
    };

    return (
        <div className="app">
            <header className="header">
                <h1>HỆ THỐNG QUẢN LÝ THIẾT BỊ PHÒNG HỌC</h1>
                <p>Quản lý và theo dõi thiết bị phòng học</p>
            </header>

            <main className="main-content">
                <div className="toolbar">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã hoặc tên thiết bị..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="">Tất cả tình trạng</option>
                        <option value="Đang sử dụng">Đang sử dụng</option>
                        <option value="Hư hỏng">Hư hỏng</option>
                        <option value="Đang sửa chữa">Đang sửa chữa</option>
                        <option value="Ngừng sử dụng">Ngừng sử dụng</option>
                    </select>

                    <button onClick={() => {
                        setEditingDevice(null);
                        setShowForm(true);
                        setSelectedDevice(null);
                    }}>
                        + Thêm thiết bị
                    </button>
                </div>

                {error && <p className="error-message">{error}</p>}

                {showForm ? (
                    <DeviceForm
                        device={editingDevice}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                ) : selectedDevice ? (
                    <DeviceDetail
                        device={selectedDevice}
                        onClose={() => setSelectedDevice(null)}
                    />
                ) : (
                    <DeviceList
                        devices={devices}
                        loading={loading}
                        onView={setSelectedDevice}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}

                <div className="refresh-area">
                    <button onClick={fetchDevices}>Làm mới danh sách</button>
                </div>
            </main>
        </div>
    );
}

export default App;