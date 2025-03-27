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
            required: [true, "Please give a category"], //{e.g:veg,non-veg,beverages,mocktails,cocktails}
        },
        type: {
            type: String,
            required: [true, "Please give a type"], // {e.g:Indian,Chinese,Italian,Continental,etc.}
        },
        price: {
            type: Number,
            required: [true, "Please give a price"],
        },
        imageUrl: {
            type: Array, // URL for the image
            required: [true, "Please give an image"],
        },
        isFreshlyMade: {
            type: Boolean,
            default: false, // Default to false, meaning stock tracking applies unless specified
        },
        stock: {
            type: Number,
            default: function() {
                return this.isFreshlyMade ? null : 0; // Set to null for freshly made items, 0 otherwise
            },
            required: function() {
                return !this.isFreshlyMade; // Stock is required only if item is not freshly made
            }
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("MenuItem", menuItemSchema);