// models/analytics.js
const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
    period: {
        type: String,
        enum: ["daily", "weekly", "monthly", "custom"],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalSales: Number,
    totalProfit: Number,
    totalLoss: Number,
    orderTypes: {
        dineIn: { count: Number, amount: Number },
        takeaway: { count: Number, amount: Number },
        online: { count: Number, amount: Number }
    },
    paymentMethods: {
        cash: { count: Number, amount: Number },
        card: { count: Number, amount: Number },
        online: { count: Number, amount: Number }
    },
    orderStatus: {
        confirmed: Number,
        cancelled: Number
    },
    inventory: {
        added: { count: Number, value: Number },
        used: { count: Number, value: Number }
    },
    topSellingItems: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        quantity: Number,
        totalRevenue: Number
    }],
    generatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Analytics", analyticsSchema);