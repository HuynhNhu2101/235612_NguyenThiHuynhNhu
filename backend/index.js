
require("dotenv").config();

// ==========================================
// 1. CẤU HÌNH DNS CHO MONGODB ATLAS
// ==========================================

const dns = require("node:dns");

// Dùng DNS Google và Cloudflare để xử lý
// lỗi truy vấn SRV đã gặp trên máy local.
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

// ==========================================
// 2. IMPORT THƯ VIỆN
// ==========================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Device = require("./models/Device");
const deviceRoutes = require("./routes/deviceRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// 3. CẤU HÌNH CORS CHO LOCAL VÀ RENDER
// ==========================================

const defaultOrigins = [
  "http://localhost:5173",
  "https://web-235612.onrender.com"
];

const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map(origin => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([...defaultOrigins, ...envOrigins])
];

console.log("================================");
console.log("Allowed CORS Origins:");

allowedOrigins.forEach(origin => {
  console.log("-", origin);
});

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép request không có Origin,
    // ví dụ trình duyệt mở URL API trực tiếp.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error("CORS blocked:", origin);

    const error = new Error(
      "CORS: Origin không được phép"
    );

    error.status = 403;
    return callback(error);
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization"
  ],

  optionsSuccessStatus: 204
}));

// ==========================================
// 4. MIDDLEWARE
// ==========================================

app.use(express.json({
  limit: "1mb"
}));

// ==========================================
// 5. API TRANG CHỦ
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    message: "API quản lý thiết bị phòng học",
    student: "235612 - NguyenThiHuynhNhu",
    status: "Running",
    endpoints: [
      "/health",
      "/api/devices"
    ]
  });
});

// ==========================================
// 6. API KIỂM TRA BACKEND VÀ MONGODB
// ==========================================

app.get("/health", (req, res) => {
  const connected =
    mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    status: connected
      ? "OK"
      : "DATABASE_DISCONNECTED",

    database: connected
      ? "Connected"
      : "Disconnected",

    databaseName: mongoose.connection.name,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 7. API QUẢN LÝ THIẾT BỊ
// ==========================================

// GET    /api/devices
// GET    /api/devices?search=TB001
// GET    /api/devices/:id
// POST   /api/devices
// PUT    /api/devices/:id
// DELETE /api/devices/:id

app.use("/api/devices", deviceRoutes);

// ==========================================
// 8. XỬ LÝ ĐƯỜNG DẪN KHÔNG TỒN TẠI
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    message: "Không tìm thấy API",
    path: req.originalUrl
  });
});

// ==========================================
// 9. XỬ LÝ LỖI
// ==========================================

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (err.message === "CORS: Origin không được phép") {
    return res.status(403).json({
      message: "Nguồn truy cập không được phép"
    });
  }

  res.status(err.status || 500).json({
    message: "Lỗi máy chủ hoặc cơ sở dữ liệu"
  });
});

// ==========================================
// 10. KẾT NỐI MONGODB ATLAS
// ==========================================

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "Chưa cấu hình MONGO_URI trong Environment"
      );
    }

    console.log("================================");
    console.log("Đang kết nối MongoDB Atlas...");

    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "235612_NguyenThiHuynhNhu",
      serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB Atlas connected");

    // ======================================
    // 11. KIỂM TRA DATABASE
    // ======================================

    console.log("================================");
    console.log(
      "Database:",
      mongoose.connection.name
    );

    console.log(
      "Collection:",
      Device.collection.name
    );

    console.log(
      "Connection state:",
      mongoose.connection.readyState
    );

    // Đếm thiết bị
    const count = await Device.countDocuments();

    console.log(
      "Số thiết bị trong MongoDB:",
      count
    );

    // Lấy danh sách thiết bị
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
    // 12. KIỂM TRA UNIQUE INDEX
    // ======================================

    await Device.collection.createIndex(
      { deviceId: 1 },
      { unique: true }
    );

    console.log("Kiểm tra index thành công");

    // ======================================
    // 13. KHỞI ĐỘNG SERVER
    // ======================================

    app.listen(PORT, "0.0.0.0", () => {
      console.log("================================");
      console.log("Backend started successfully");
      console.log(`Port: ${PORT}`);
      console.log(`Health: /health`);
      console.log(`Devices API: /api/devices`);
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
