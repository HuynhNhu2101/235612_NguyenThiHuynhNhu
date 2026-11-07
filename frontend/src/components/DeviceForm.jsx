import React, { useEffect, useState } from "react";

const initialForm = {
    deviceId: "",
    name: "",
    deviceType: "",
    room: "",
    brand: "",
    model: "",
    quantity: 1,
    status: "Đang sử dụng",
    purchaseDate: "",
    description: ""
};

function DeviceForm({ device, onSubmit, onCancel }) {
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (device) {
            setForm({
                ...initialForm,
                ...device,
                purchaseDate: device.purchaseDate
                    ? device.purchaseDate.slice(0, 10)
                    : ""
            });
        } else {
            setForm(initialForm);
        }
    }, [device]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: name === "quantity" ? Number(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    return (
        <div className="form-container">
            <h2>{device ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}</h2>

            <form onSubmit={handleSubmit}>
                <label>Mã thiết bị *</label>
                <input
                    name="deviceId"
                    value={form.deviceId}
                    onChange={handleChange}
                    required
                    disabled={!!device}
                />

                <label>Tên thiết bị *</label>
                <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <label>Loại thiết bị</label>
                <input name="deviceType" value={form.deviceType} onChange={handleChange} />

                <label>Phòng học</label>
                <input name="room" value={form.room} onChange={handleChange} />

                <label>Thương hiệu</label>
                <input name="brand" value={form.brand} onChange={handleChange} />

                <label>Model</label>
                <input name="model" value={form.model} onChange={handleChange} />

                <label>Số lượng</label>
                <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                />

                <label>Tình trạng</label>
                <select name="status" value={form.status} onChange={handleChange}>
                    <option>Đang sử dụng</option>
                    <option>Hư hỏng</option>
                    <option>Đang sửa chữa</option>
                    <option>Ngừng sử dụng</option>
                </select>

                <label>Ngày mua</label>
                <input
                    type="date"
                    name="purchaseDate"
                    value={form.purchaseDate}
                    onChange={handleChange}
                />

                <label>Mô tả</label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                />

                <div className="form-actions">
                    <button type="submit">
                        {device ? "Lưu cập nhật" : "Thêm thiết bị"}
                    </button>
                    <button type="button" onClick={onCancel}>Hủy</button>
                </div>
            </form>
        </div>
    );
}

export default DeviceForm;