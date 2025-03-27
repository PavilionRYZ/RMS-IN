const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    table_no: {
      type: String,
      default: "N/A", // For takeaway/online orders
    },
    customer_name: {
      type: String,
      default: "Guest",
    },
    items: [
      {
        menu_item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    total_price: {
      type: Number,
      required: true,
    },
    order_type: {
      type: String,
      enum: ["dine-in", "takeaway", "online"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
