const InventoryItem = require("../models/inventory");
const errorHandler = require("../utils/errorHandler");


// Create new inventory item (without initial stock)
exports.createInventoryItem = async (req, res, next) => {
  try {
    const { item_name, unit } = req.body;

    if (!item_name || !unit) {
      return next(new errorHandler(400, "Item name and unit are required"));
    }

    const existingItem = await InventoryItem.findOne({ item_name });
    if (existingItem) {
      return next(new errorHandler(400, "Item with this name already exists"));
    }

    const inventoryItem = new InventoryItem({
      item_name,
      unit,
      current_quantity: 0,
      average_unit_price: 0,
      total_value: 0
    });

    await inventoryItem.save();

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      inventoryItem
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    next(new errorHandler(500, "Failed to create inventory item"));
  }
};

// Add new stock to inventory
exports.addStock = async (req, res, next) => {
  try {
    const { item_name, quantity, unit, unit_price, notes } = req.body;

    if (!item_name || quantity == null || unit_price == null || unit == null) {
      return next(new errorHandler(400, "Required fields missing"));
    }

    if (quantity <= 0) {
      return next(new errorHandler(400, "Quantity must be positive"));
    }

    let inventoryItem = await InventoryItem.findOne({ item_name });

    const transaction = {
      type: "addition",
      quantity,
      unit_price,
      total_value: quantity * unit_price,
      notes
    };

    if (!inventoryItem) {
      // Create new item if it doesn't exist
      inventoryItem = new InventoryItem({
        item_name,
        current_quantity: quantity,
        unit,
        average_unit_price: unit_price,
        total_value: quantity * unit_price,
        transactions: [transaction]
      });
    } else {
      // Update existing item
      const newTotalQuantity = inventoryItem.current_quantity + quantity;
      const newTotalValue = inventoryItem.total_value + (quantity * unit_price);
      inventoryItem.current_quantity = newTotalQuantity;
      inventoryItem.total_value = newTotalValue;
      inventoryItem.average_unit_price = newTotalValue / newTotalQuantity;
      inventoryItem.transactions.push(transaction);
      inventoryItem.last_updated = Date.now();
    }

    await inventoryItem.save();

    res.status(201).json({
      success: true,
      message: "Stock added successfully",
      inventoryItem
    });
  } catch (error) {
    console.error("Error adding stock:", error);
    next(new errorHandler(500, "Failed to add stock"));
  }
};

// Use stock from inventory
exports.useStock = async (req, res, next) => {
  try {
    const { item_name, quantity, notes } = req.body;

    if (!item_name || quantity == null) {
      return next(new errorHandler(400, "Required fields missing"));
    }

    if (quantity <= 0) {
      return next(new errorHandler(400, "Quantity must be positive"));
    }

    const inventoryItem = await InventoryItem.findOne({ item_name });

    if (!inventoryItem) {
      return next(new errorHandler(404, "Inventory item not found"));
    }

    if (inventoryItem.current_quantity < quantity) {
      return next(new errorHandler(400, "Insufficient stock"));
    }

    const transactionValue = quantity * inventoryItem.average_unit_price;
    const transaction = {
      type: "usage",
      quantity,
      unit_price: inventoryItem.average_unit_price,
      total_value: transactionValue,
      notes
    };

    inventoryItem.current_quantity -= quantity;
    inventoryItem.total_value -= transactionValue;
    inventoryItem.transactions.push(transaction);
    inventoryItem.last_updated = Date.now();

    await inventoryItem.save();

    res.status(200).json({
      success: true,
      message: "Stock used successfully",
      inventoryItem
    });
  } catch (error) {
    console.error("Error using stock:", error);
    next(new errorHandler(500, "Failed to use stock"));
  }
};

// Get inventory item details with transaction history
exports.getInventoryItemDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inventoryItem = await InventoryItem.findById(id);

    if (!inventoryItem) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }

    res.status(200).json({
      success: true,
      inventoryItem,
      transactionHistory: inventoryItem.transactions
    });
  } catch (error) {
    console.error("Error fetching inventory details:", error);
    next(new errorHandler(500, "Failed to fetch inventory details"));
  }
};

// Get all inventory items (updated from original)
exports.getAllInventoryItems = async (req, res, next) => {
  try {
    let { search, startDate, endDate, sortBy, sortOrder, page, limit } = req.query;
    let filters = {};

    if (search) {
      filters.item_name = { $regex: search, $options: "i" };
    }

    if (startDate && endDate) {
      filters.last_updated = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let sortCriteria = {};
    if (sortBy === "quantity") {
      sortCriteria.current_quantity = sortOrder === "asc" ? 1 : -1;
    } else {
      sortCriteria.last_updated = sortOrder === "old" ? 1 : -1;
    }

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    let skip = (page - 1) * limit;

    const inventoryItems = await InventoryItem.find(filters)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .select('-transactions'); // Exclude transactions for list view

    const totalItems = await InventoryItem.countDocuments(filters);

    res.status(200).json({
      success: true,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      inventoryItems
    });
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    next(new errorHandler(500, "Failed to fetch inventory items"));
  }
};

// Delete inventory item (unchanged from original)
exports.deleteInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const inventoryItem = await InventoryItem.findByIdAndDelete(id);
    if (!inventoryItem) {
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }
    res.status(200).json({ success: true, message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    next(new errorHandler(500, "Failed to delete inventory item"));
  }
};