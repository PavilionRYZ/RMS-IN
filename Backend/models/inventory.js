const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["addition", "usage"],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit_price: {
    type: Number,
    required: true
  },
  total_value: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  notes: String
});

const inventoryItemSchema = new mongoose.Schema(
  {
    item_name: {
      type: String,
      required: true,
      unique: true // Ensure no duplicate items
    },
    current_quantity: {
      type: Number,
      required: true,
      default: 0
    },
    unit: {
      type: String,
      enum: ["kg", "gram", "litre", "millilitre", "piece", "pack"],
      required: true
    },
    average_unit_price: {
      type: Number,
      required: true,
      default: 0
    },
    total_value: {
      type: Number,
      default: 0
    },
    transactions: [inventoryTransactionSchema],
    last_updated: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryItem", inventoryItemSchema);