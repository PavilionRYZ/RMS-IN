const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true, // The customer's name
        },
        tableNumber: {
            type: Number,
            required: [true, "Please provide a table number"],
            min: 1,
        },
        reservationDate: {
            type: Date,
            required: [true, "Please provide a reservation date and time"],
        },
        partySize: {
            type: Number,
            required: [true, "Please specify the party size"],
            min: 1,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "seated", "completed", "canceled"],
            default: "pending",
        },
        specialRequests: {
            type: String,
            default: "",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true, // Who created the reservation (e.g., staff or customer)
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Who last updated the reservation (optional)
        },
    },
    { timestamps: true }
);

// Index for efficient querying by date and table
reservationSchema.index({ reservationDate: 1, tableNumber: 1 });

module.exports = mongoose.model("Reservation", reservationSchema);