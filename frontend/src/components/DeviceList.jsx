import React from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

function DeviceList({ devices, loading, onView, onEdit, onDelete }) {
    if (loading) {
        return <p className="loading">Đang tải danh sách thiết bị...</p>;
    }

    if (!devices || devices.length === 0) {
        return <p className="empty">Chưa có thiết bị nào.</p>;
    }

    return (
        <div className="table-container">
            <table className="device-table">
                <thead>
                    <tr>
                        <th>Mã thiết bị</th>
                        <th>Tên thiết bị</th>
                        <th>Loại thiết bị</th>
                        <th>Phòng học</th>
                        <th>Số lượng</th>
                        <th>Tình trạng</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>

                <tbody>
                    {devices.map((device) => (
                        <tr key={device._id}>
                            <td>{device.deviceId}</td>
                            <td>{device.name}</td>
                            <td>{device.deviceType || "Chưa cập nhật"}</td>
                            <td>{device.room || "Chưa cập nhật"}</td>
                            <td>{device.quantity}</td>
                            <td>{device.status}</td>
                            <td className="actions">
                                <button onClick={() => onView(device)} title="Xem chi tiết">
                                    <FaEye />
                                </button>

                                <button onClick={() => onEdit(device)} title="Chỉnh sửa">
                                    <FaEdit />
                                </button>

                                <button onClick={() => onDelete(device._id)} title="Xóa">
                                    <FaTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DeviceList;