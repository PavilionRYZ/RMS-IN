// const mongoose = require("mongoose");

// const salesAnalyticsSchema = new mongoose.Schema(
//   {
//     date: {
//       type: Date,
//       required: true,
//     },

//     // 🔹 Orders Analytics
//     orders_count: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     completed_orders: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     cancelled_orders: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     total_revenue: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     average_order_value: {
//       type: Number,
//       default: 0,
//     },

//     // 🔹 Payment Analytics
//     payment_methods: {
//       cash: { type: Number, default: 0 },
//       card: { type: Number, default: 0 },
//       online: { type: Number, default: 0 },
//     },

//     // 🔹 Inventory Analytics (Tracking Ingredient/Stock Usage)
//     inventory_usage: [
//       {
//         item_name: { type: String, required: true }, // Example: "Tomatoes", "Oil"
//         quantity_used: { type: Number, required: true, default: 0 },
//         unit: { type: String, required: true, enum: ["kg", "g", "ltr", "ml", "pcs"] }, // Units of measurement
//       },
//     ],

//     // 🔹 Profit Analytics
//     total_cost: {
//       type: Number,
//       required: true,
//       default: 0, // Sum of inventory expenses
//     },
//     net_profit: {
//       type: Number,
//       default: function () {
//         return this.total_revenue - this.total_cost;
//       },
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("SalesAnalytics", salesAnalyticsSchema);
