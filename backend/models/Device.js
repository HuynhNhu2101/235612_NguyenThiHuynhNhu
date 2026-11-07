
const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    deviceType: {
      type: String,
      required: true,
      trim: true
    },

    room: {
      type: String,
      required: true,
      trim: true
    },

    brand: {
      type: String,
      default: ""
    },

    model: {
      type: String,
      default: ""
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    status: {
      type: String,
      enum: [
        "Đang sử dụng",
        "Hư hỏng",
        "Đang sửa chữa",
        "Ngừng sử dụng"
      ],
      default: "Đang sử dụng"
    },

    purchaseDate: {
      type: Date,
      required: true
    },

    description: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    collection: "devices"
  }
);

const Device = mongoose.model("Device", deviceSchema);

module.exports = Device;
