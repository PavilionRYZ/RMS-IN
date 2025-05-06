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

        // Create new menu item
        const menuItem = await MenuItem.create({
            name,
            description,
            category,
            type,
            price,
            imageUrl,
            isFreshlyMade: isFreshlyMade || false,
            stock: isFreshlyMade ? null : (stock || 0),
        });

        res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            menuItem,
        });
    } catch (error) {
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
        next(new ErrorHandler(500, "Menu item update failed"));
    }
};

// Delete the menu item
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
        next(new ErrorHandler(500, "Menu item deletion failed"));
    }
};

// Get all items (Search and Filter Menu Items)
exports.getMenuItems = async (req, res, next) => {
    try {
        let { search, category, type, minPrice, maxPrice, inStock, page = 1, limit = 10 } = req.query;

        // Validate pagination parameters
        page = Math.max(1, parseInt(page, 10));
        limit = Math.max(1, parseInt(limit, 10));

        let filter = {};

        // Search by Name (Case-Insensitive)
        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        // Filter by Category
        if (category) {
            filter.category = category;
        }

        // Filter by Type
        if (type) {
            filter.type = type;
        }

        // Filter by Price Range
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        // Filter by Stock Availability
        if (inStock === "true") {
            filter.stock = { $gt: 0 };
        }

        // Pagination
        const skip = (page - 1) * limit;

        // Fetch menu items and total count
        const [menuItems, totalItems] = await Promise.all([
            MenuItem.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            MenuItem.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            menuItems,
            totalItems,
            page,
            limit,
            totalPages: Math.ceil(totalItems / limit),
        });
    } catch (error) {
        next(new ErrorHandler(500, "Menu item fetch failed"));
    }
};

// Get single menu item
exports.getMenuItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return next(new ErrorHandler(404, "Menu item not found"));
        }
        res.status(200).json({
            success: true,
            menuItem,
        });
    } catch (error) {
        next(new ErrorHandler(500, "Menu item fetch failed"));
    }
};