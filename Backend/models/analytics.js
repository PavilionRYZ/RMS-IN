const mongoose = require("mongoose");

const salesAnalyticsSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    orders_count: {
      type: Number,
      required: true,
      default: 0,
    },
    total_revenue: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesAnalytics", salesAnalyticsSchema);
