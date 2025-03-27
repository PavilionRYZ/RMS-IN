const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                menu_item: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Menu",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
            },
        ],
        total_price: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
