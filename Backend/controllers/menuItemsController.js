const MenuItem = require("../models/menu");
const ErrorHandler = require("../utils/errorHandler");

// Create a menu item (Admins or Users with 'manage_menu' permission)
exports.createMenuItem = async (req, res, next) => {
    try {
        const { name, description, price, imageUrl, stock, category, type, isFreshlyMade } = req.body;

        // Validate required fields
        if (!name || !description || !category || !type || !price || !imageUrl || imageUrl.length === 0) {
            return next(new ErrorHandler(400, "All required fields must be provided"));
        }

        // If item is not freshly made and stock is not provided, it will default to 0
        // If item is freshly made, stock should be null or omitted
        if (!isFreshlyMade && stock === undefined) {
            // This is optional: you could enforce stock being provided for non-fresh items
            // return next(new errorHandler(400, "Stock is required for non-freshly made items"));
        }

        // Create new menu item
        const menuItem = await MenuItem.create({
            name,
            description,
            category,
            type,
            price,
            imageUrl,
            isFreshlyMade: isFreshlyMade || false, // Default to false if not provided
            stock: isFreshlyMade ? null : (stock || 0), // Null for fresh items, otherwise stock or 0
        });

        res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            menuItem,
        });
    } catch (error) {
        // console.error("Error creating menu item:", error);
        next(new ErrorHandler(500, "Menu item creation failed"));
    }
};
// Edit a menu item (Admins or Users with 'manage_menu' permission)
exports.editMenuItem = async (req, res, next) => {
    try {
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
        // console.error("Error deleting menu item:", error);
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
        page = Number(page);
        limit = Number(limit);
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
        // console.error("Error fetching menu items:", error);
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
        // console.error("Error fetching menu item:", error);
        next(new ErrorHandler(500, "Menu item fetch failed"));
    }
}