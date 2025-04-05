const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
    {
        date: { type: Date, required: true }, // Date for which analytics are computed (e.g., daily)
        orders: {
            total: { type: Number, default: 0 }, // Total number of orders
            by_type: {
                "dine-in": { type: Number, default: 0 },
                takeaway: { type: Number, default: 0 },
                online: { type: Number, default: 0 },
            },
            by_payment_method: {
                cash: { type: Number, default: 0 },
                card: { type: Number, default: 0 },
                online: { type: Number, default: 0 },
            },
        },
        items: [
            {
                menu_item_id: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
                item_name: { type: String, required: true },
                total_quantity: { type: Number, default: 0 },
                total_revenue: { type: Number, default: 0 },
            },
        ],
        inventory: [
            {
                inventory_item_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
                item_name: { type: String, required: true },
                current_stock: { type: Number, required: true },
                stock_used: { type: Number, default: 0 }, // Stock used on this date
            },
        ],
        financials: {
            total_revenue: { type: Number, default: 0 },
            total_cost: { type: Number, default: 0 }, // Cost of inventory used
            profit: { type: Number, default: 0 }, // Profit = total_revenue - total_cost
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Analytics", analyticsSchema);