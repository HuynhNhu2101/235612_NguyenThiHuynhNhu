
require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Device = require("./models/Device");
const deviceRoutes = require("./routes/deviceRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ======================================
// 1. CẤU HÌNH CORS
// ======================================

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error("CORS: Origin không được phép"));
  }
}));

// Middleware đọc dữ liệu JSON
app.use(express.json());

// ======================================
// 2. API TRANG CHỦ
// ======================================

app.get("/", (req, res) => {
  res.json({
    message: "API quản lý thiết bị phòng học",
    student: "235612 - NguyenThiHuynhNhu",
    endpoints: [
      "/health",
      "/api/devices"
    ]
  });
});

// ======================================
// 3. KIỂM TRA TRẠNG THÁI BACKEND
// ======================================

app.get("/health", (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected ? "OK" : "DATABASE_DISCONNECTED",
    database: connected ? "Connected" : "Disconnected"
  });
});

// ======================================
// 4. ROUTES QUẢN LÝ THIẾT BỊ
// ======================================

app.use("/api/devices", deviceRoutes);

// ======================================
// 5. XỬ LÝ ĐƯỜNG DẪN KHÔNG TỒN TẠI
// ======================================

app.use((req, res) => {
  res.status(404).json({
    message: "Không tìm thấy API"
  });
});

// ======================================
// 6. XỬ LÝ LỖI HỆ THỐNG
// ======================================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    message: "Lỗi xử lý yêu cầu"
  });
});

// ======================================
// 7. KẾT NỐI MONGODB ATLAS
// ======================================

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Chưa cấu hình MONGO_URI trong .env");
    }

    console.log("================================");
    console.log("Đang kết nối MongoDB Atlas...");

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "235612_NguyenThiHuynhNhu",
      serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB Atlas connected");

    // ======================================
    // 8. KIỂM TRA DATABASE VÀ COLLECTION
    // ======================================

    console.log("================================");
    console.log("Database:", mongoose.connection.name);
    console.log("Collection:", Device.collection.name);
    console.log(
      "Connection state:",
      mongoose.connection.readyState
    );

    // Đếm tổng thiết bị
    const count = await Device.countDocuments();

    console.log("Số thiết bị trong MongoDB:", count);

    // Kiểm tra dữ liệu thiết bị
    const devices = await Device.find()
      .select("deviceId name")
      .lean();

    console.log("Danh sách thiết bị:");

    devices.forEach(device => {
      console.log(
        `- ${device.deviceId}: ${device.name}`
      );
    });

    // ======================================
    // 9. TẠO UNIQUE INDEX CHO DEVICE ID
    // ======================================

    await Device.collection.createIndex(
      { deviceId: 1 },
      { unique: true }
    );

    console.log("Kiểm tra index thành công");

    // ======================================
    // 10. KHỞI ĐỘNG SERVER
    // ======================================

    app.listen(PORT, "0.0.0.0", () => {
      console.log("================================");
      console.log(`Backend running on port ${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(`Devices: http://localhost:${PORT}/api/devices`);
      console.log("================================");
    });

  } catch (error) {
    console.error("================================");
    console.error("Startup error:", error.message);
    console.error("================================");

    process.exit(1);
  }
}

startServer();
