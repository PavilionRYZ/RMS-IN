const MenuItem = require("../models/menu");
const ErrorHandler = require("../utils/errorHandler");

// Create a menu item (Admins or Users with 'manage_menu' permission)
exports.createMenuItem = async (req, res, next) => {
    try {
        const { name, description, price, imageUrl, stock, category, type } = req.body;

        // Check if user is authenticated
        if (!req.user) {
            return next(new errorHandler(401, "Unauthorized: No user logged in"));
        }

        // Check if user is an admin or has the 'manage_menu' permission
        if (req.user.role !== "admin" && !req.user.permissions.includes("manage_menu")) {
            return next(new errorHandler(403, "Access Denied: You don't have permission to create menu items"));
        }

        // Validate required fields
        if (!name || !description || !category || !type || !price || !imageUrl || imageUrl.length === 0) {
            return next(new errorHandler(400, "All required fields must be provided"));
        }

        // Create new menu item
        const menuItem = await MenuItem.create({
            name,
            description,
            category,
            type,
            price,
            imageUrl,
            stock: stock || 0, // Default stock is 0
        });

        res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            menuItem,
        });
    } catch (error) {
        console.error("Error creating menu item:", error);
        next(new errorHandler(500, "Menu item creation failed"));
    }
};

// Edit a menu item (Admins or Users with 'manage_menu' permission)
exports.editMenuItem = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new ErrorHandler(401, "Unauthorized: No user logged in"));
        }

        if (req.user.role !== "admin" && !req.user.permissions.includes("manage_menu")) {
            return next(new ErrorHandler(403, "Access Denied: You don't have permission to edit menu items"));
        }

        const updates = req.body;
        const { id } = req.params;

        if (Object.keys(updates).length === 0) {
            return next(new ErrorHandler(400, "No fields to update"));
        }

        const menuItem = await MenuItem.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!menuItem) {
            return next(new ErrorHandler(404, "Menu item not found"));
        }

        res.status(200).json({
            success: true,
            message: "Menu item updated successfully",
            menuItem,
        });
    } catch (error) {
        console.error("Error updating menu item:", error);
        next(new ErrorHandler(500, "Menu item update failed"));
    }
};

//delete the menu item
exports.deleteMenuItem = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new ErrorHandler(401, "Unauthorized: No user logged in"));
        }
        if (req.user.role !== "admin" && !req.user.permissions.includes("manage_menu")) {
            return next(new ErrorHandler(403, "Access Denied: You don't have permission to delete menu items"));
        }
        const { id } = req.params;
        const menuItem = await MenuItem.findByIdAndDelete(id);
        if (!menuItem) {
            return next(new ErrorHandler(404, "Menu item not found"));
        }
        res.status(200).json({
            success: true,
            message: "Menu item deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting menu item:", error);
        next(new ErrorHandler(500, "Menu item deletion failed"));
    }
}

//get all items (Search and Filter Menu Items)
exports.getMenuItems = async (req, res, next) => {
    try {
        let { search, category, type, minPrice, maxPrice, inStock, page, limit } = req.query;

        let filter = {};

        // 🔹 Search by Name (Case-Insensitive)
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        // 🔹 Filter by Category
        if (category) {
            filter.category = category;
        }

        // 🔹 Filter by Type
        if (type) {
            filter.type = type;
        }

        // 🔹 Filter by Price Range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice); // Greater than or equal to minPrice
            if (maxPrice) filter.price.$lte = Number(maxPrice); // Less than or equal to maxPrice
        }

        // 🔹 Filter by Stock Availability
        if (inStock) {
            filter.stock = { $gt: 0 }; // Items with stock > 0
        }

        // 🔹 Pagination (Default: page 1, limit 10)
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const skip = (page - 1) * limit;

        // 🔹 Fetch menu items
        const menuItems = await MenuItem.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by latest items

        res.status(200).json({
            success: true,
            count: menuItems.length,
            page,
            totalPages: Math.ceil(await MenuItem.countDocuments(filter) / limit),
            menuItems,
        });
    } catch (error) {
        console.error("Error fetching menu items:", error);
        next(new ErrorHandler(500, "Menu item fetch failed"));
    }
};

//get single menu item
exports.getMenuItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return next(new ErrorHandler(404, "Menu item not found"));
        }
        res.status(200).json({
            success: true,
            menuItem
        })
    } catch (error) {
        console.error("Error fetching menu item:", error);
        next(new ErrorHandler(500, "Menu item fetch failed"));
    }
}