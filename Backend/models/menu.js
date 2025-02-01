const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please give a name"],
        },
        description: {
            type: String,
            default: "",
            required: [true, "Please give a description"],
        },
        category: {
            type: String,
            required: [true, "Please give a category"],
        },
        type: {
            type: String,
            required: [true, "Please give a type"],
        },
        price: {
            type: Number,
            required: [true, "Please give a price"],
        },
        imageUrl: {
            type: Array, // URL for the image
            required: [true, "Please give an image"],
        },
        stock: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
