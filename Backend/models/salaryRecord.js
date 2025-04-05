const mongoose = require("mongoose");

const salaryAdjustmentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["deduction", "bonus"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

const salaryRecordSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        month: {
            type: String, // Format: "YYYY-MM" (e.g., "2025-04")
            required: true,
        },
        baseSalary: {
            type: Number,
            required: true,
        },
        adjustments: [salaryAdjustmentSchema],
        totalSalary: {
            type: Number,
            required: true,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paymentDate: {
            type: Date,
        },
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("SalaryRecord", salaryRecordSchema);