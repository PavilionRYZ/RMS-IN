const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please give a username"],
        },
        email: {
            type: String,
            required: [true, "Please give an email"],
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Please enter password"],
            minlength: [4, "Password should be greater than or equal to 4 charectures"]
        },
        role: {
            type: String,
            enum: ["admin", "kitchen_staff","staff"],
            default: "staff",
        },
        salary: {
            type: Number,
            default: 0, // For staff users only
            required: true,
        },
        duty_time: {
            type: String, // Example: "9:00 AM - 5:00 PM"
            default: "",
            required: true,
        },
        permissions: {
            type: [String], // Example: ["manage_inventory", "manage_orders","manage_orders","manage_inventory","manage_menu"]
            default: [],
        },
        address: {
            type: String,
            default: "",
            required: true,
        },
        phone: {
            type: Number,
            default: "",
            required: true,
        },
        image: {
            type: String, // URL for the image
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
