const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        order_type: { 
            type: String,
            enum: ["dine-in", "takeaway", "online"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        payment_method: {
            type: String,
            enum: ["cash", "card", "online"],
            required: true,
        },
        transaction_id: {
            type: String,
            default: null, // Used for online/card payments
        },
        payment_status: {
            type: String,
            enum: ["pending", "completed", "failed", "refunded"],
            default: "pending",
        },
        paid_at: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
