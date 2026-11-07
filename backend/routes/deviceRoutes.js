
const express = require("express");
const mongoose = require("mongoose");
const Device = require("../models/Device");

const router = express.Router();

const fields = [
  "deviceId", "name", "deviceType", "room",
  "brand", "model", "quantity", "status",
  "purchaseDate", "description"
];

const statuses = [
  "Đang sử dụng",
  "Hư hỏng",
  "Đang sửa chữa",
  "Ngừng sử dụng"
];

function validateDevice(data) {
  const required = ["deviceId", "name", "deviceType", "room"];

  for (const key of required) {
    if (typeof data[key] !== "string" || !data[key].trim()) {
      return `Trường ${key} không được để trống`;
    }
  }

  if (
    !Number.isInteger(data.quantity) ||
    data.quantity < 1
  ) {
    return "Số lượng phải là số nguyên lớn hơn 0";
  }

  if (!statuses.includes(data.status)) {
    return "Tình trạng thiết bị không hợp lệ";
  }

  if (
    !data.purchaseDate ||
    Number.isNaN(Date.parse(data.purchaseDate))
  ) {
    return "Ngày mua không hợp lệ";
  }

  const date = new Date(data.purchaseDate);
  if (date > new Date()) {
    return "Ngày mua không được lớn hơn ngày hiện tại";
  }

  return null;
}

function handleError(res, error) {
  console.error(error);

  if (error.code === 11000) {
    return res.status(409).json({
      message: "Mã thiết bị đã tồn tại"
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: Object.values(error.errors)
        .map(e => e.message).join(", ")
    });
  }

  return res.status(500).json({
    message: "Lỗi máy chủ hoặc cơ sở dữ liệu"
  });
}

// GET /api/devices?search=...
router.get("/", async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    const query = search ? {
      $or: [
        { deviceId: { $regex: escapeRegex(search), $options: "i" } },
        { name: { $regex: escapeRegex(search), $options: "i" } },
        { deviceType: { $regex: escapeRegex(search), $options: "i" } },
        { room: { $regex: escapeRegex(search), $options: "i" } }
      ]
    } : {};

    const devices = await Device.find(query)
      .sort({ createdAt: -1 });

    res.json(devices);
  } catch (error) {
    handleError(res, error);
  }
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/devices/:id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "ID thiết bị không hợp lệ"
      });
    }

    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({
        message: "Không tìm thấy thiết bị"
      });
    }

    res.json(device);
  } catch (error) {
    handleError(res, error);
  }
});

// POST /api/devices
router.post("/", async (req, res) => {
  try {
    const data = {};

    for (const key of fields) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    const error = validateDevice(data);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const device = await Device.create(data);

    res.status(201).json({
      message: "Thêm thiết bị thành công",
      device
    });
  } catch (error) {
    handleError(res, error);
  }
});

// PUT /api/devices/:id
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "ID thiết bị không hợp lệ"
      });
    }

    const existing = await Device.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        message: "Không tìm thấy thiết bị"
      });
    }

    const data = {};

    for (const key of fields) {
      data[key] = req.body[key] !== undefined
        ? req.body[key]
        : existing[key];
    }

    const error = validateDevice(data);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const device = await Device.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

    res.json({
      message: "Cập nhật thiết bị thành công",
      device
    });
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE /api/devices/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "ID thiết bị không hợp lệ"
      });
    }

    const device = await Device.findByIdAndDelete(req.params.id);

    if (!device) {
      return res.status(404).json({
        message: "Không tìm thấy thiết bị"
      });
    }

    res.json({ message: "Xóa thiết bị thành công" });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
