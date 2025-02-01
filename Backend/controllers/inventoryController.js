const InventoryItem = require("../models/inventory");
const errorHandler = require("../utils/errorHandler");

// Add new inventory item (Only admin or staff with 'inventory_management' permission)
exports.addInventoryItem = async (req, res, next) => {
    try {
        const { item_name, quantity, unit, unit_price } = req.body;

        // Validate required fields
        if (!item_name || quantity == null || unit_price == null || unit == null) {
            return next(new errorHandler(400, "All fields (item_name, quantity, unit_price) are required"));
        }

        // Calculate total spent
        const total_spent = quantity * unit_price;

        // Create inventory item
        const inventoryItem = new InventoryItem({
            item_name,
            quantity,
            unit,
            unit_price,
            total_spent,
            last_updated: Date.now(),
        });

        await inventoryItem.save();

        res.status(201).json({
            success: true,
            message: "Inventory item added successfully",
            inventoryItem,
        });
    } catch (error) {
        console.error("Error adding inventory item:", error);
        next(new errorHandler(500, "Failed to add inventory item"));
    }
};

// Get all inventory items (Only admin or staff with 'inventory_management' permission)
exports.updateInventoryItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { quantity, unit_price } = req.body;

        // Find inventory item by ID
        let inventoryItem = await InventoryItem.findById(id);

        if (!inventoryItem) {
            return res.status(404).json({ success: false, message: "Inventory item not found" });
        }

        // Update quantity and price if provided
        if (quantity !== undefined) {
            inventoryItem.quantity = quantity;
        }
        if (unit_price !== undefined) {
            inventoryItem.unit_price = unit_price;
        }

        // Recalculate total spent
        inventoryItem.total_spent = inventoryItem.quantity * inventoryItem.unit_price;

        // Auto-update last_updated timestamp
        inventoryItem.last_updated = new Date();

        // Save the updated inventory item
        await inventoryItem.save();

        res.status(200).json({
            success: true,
            message: "Inventory item updated successfully",
            inventoryItem,
        });
    } catch (error) {
        console.error("Error updating inventory:", error);
        next(new errorHandler(500, "Menu item deletion failed"));
    }
};

// Get all inventory items (Only admin or staff with 'inventory_management' permission)
exports.getAllInventoryItems = async (req, res, next) => {
    try {
        let { search, startDate, endDate, sortBy, sortOrder, page, limit } = req.query;
        let filters = {};

        // 🔹 Search by item name (case-insensitive)
        if (search) {
            filters.item_name = { $regex: search, $options: "i" };
        }

        // 🔹 Filter by date range
        if (startDate && endDate) {
            filters.last_updated = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        } else if (startDate) {
            filters.last_updated = { $gte: new Date(startDate) };
        } else if (endDate) {
            filters.last_updated = { $lte: new Date(endDate) };
        }

        // 🔹 Sorting (Default: newest first)
        let sortCriteria = {};
        if (sortBy === "date") {
            sortCriteria.last_updated = sortOrder === "old" ? 1 : -1; // 1 = Oldest to Newest, -1 = Newest to Oldest
        }

        // 🔹 Pagination (Default: 10 items per page)
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        let skip = (page - 1) * limit;

        // 🔹 Fetch inventory items based on filters, sorting, and pagination
        const inventoryItems = await InventoryItem.find(filters)
            .sort(sortCriteria)
            .skip(skip)
            .limit(limit);

        // 🔹 Get total count (for pagination info)
        const totalItems = await InventoryItem.countDocuments(filters);

        res.status(200).json({
            success: true,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            inventoryItems,
        });
    } catch (error) {
        console.error("Error fetching inventory items:", error);
        next(new errorHandler(500, "Menu item deletion failed"));

    }
};

// Get inventory item by ID (Only admin or staff with 'inventory_management' permission)
exports.getInventoryItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const inventoryItem = await InventoryItem.findById(id);
        if (!inventoryItem) {
            return res.status(404).json({ success: false, message: "Inventory item not found" });
        }
        res.status(200).json({ success: true, inventoryItem });
    } catch (error) {
        console.error("Error fetching inventory item:", error);
        next(new errorHandler(500, "Menu item deletion failed"));

    }
};

// Delete inventory item by ID (Only admin or staff with 'inventory_management' permission)
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
        next(new errorHandler(500, "Menu item deletion failed"));

    }
};