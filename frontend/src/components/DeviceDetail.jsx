import React from "react";

function DeviceDetail({ device, onClose }) {
    if (!device) return null;

    return (
        <div className="detail-container">
            <h2>Chi tiết thiết bị</h2>

            <div className="detail-content">
                <p><strong>Mã thiết bị:</strong> {device.deviceId}</p>
                <p><strong>Tên thiết bị:</strong> {device.name}</p>
                <p><strong>Loại thiết bị:</strong> {device.deviceType || "Chưa cập nhật"}</p>
                <p><strong>Phòng học:</strong> {device.room || "Chưa cập nhật"}</p>
                <p><strong>Thương hiệu:</strong> {device.brand || "Chưa cập nhật"}</p>
                <p><strong>Model:</strong> {device.model || "Chưa cập nhật"}</p>
                <p><strong>Số lượng:</strong> {device.quantity}</p>
                <p><strong>Tình trạng:</strong> {device.status}</p>

                <p>
                    <strong>Ngày mua:</strong>{" "}
                    {device.purchaseDate
                        ? new Date(device.purchaseDate).toLocaleDateString("vi-VN")
                        : "Chưa cập nhật"}
                </p>

                <p>
                    <strong>Mô tả:</strong>{" "}
                    {device.description || "Không có mô tả"}
                </p>
            </div>

            <button onClick={onClose}>Đóng</button>
        </div>
    );
}

export default DeviceDetail;