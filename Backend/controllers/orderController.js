const Order = require("../models/order");
const MenuItem = require("../models/menu");
const errorHandler = require("../utils/errorHandler");

// Place an order and update stock
exports.placeOrder = async (req, res, next) => {
    try {
        const { table_no, customer_name, items, order_type } = req.body;

        // Validate order items
        if (!items || items.length === 0) {
            return next(new errorHandler(400, "Order must contain at least one item."));
        }

        let total_price = 0;
        const updatedItems = [];

        for (const orderItem of items) {
            const menuItem = await MenuItem.findById(orderItem.menu_item);

            if (!menuItem) {
                return next(new errorHandler(404, `Item not found: ${orderItem.menu_item}`));
            }

            // Check stock availability
            if (menuItem.stock < orderItem.quantity) {
                return next(new errorHandler(400, `Not enough stock for ${menuItem.name}`));
            }

            // Calculate total price
            total_price += menuItem.price * orderItem.quantity;

            // Deduct stock
            menuItem.stock -= orderItem.quantity;
            await menuItem.save(); // Update stock in the database

            updatedItems.push({
                menu_item: menuItem._id,
                quantity: orderItem.quantity,
            });
        }

        // Create and save order
        const order = await Order.create({
            table_no,
            customer_name,
            items: updatedItems,
            total_price,
            order_type,
            status: "pending",
        });

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order,
        });
    } catch (error) {
        console.error("Error placing order:", error);
        next(new errorHandler(500, "Failed to place order"));
    }
};

// Get all orders with filters, search, pagination & sorting
exports.getAllOrders = async (req, res, next) => {
    try {
        let { status, startDate, endDate, search, page, limit, sortBy, order } = req.query;
        let filters = {};

        // Filter by status (if provided)
        if (status) {
            filters.status = status;
        }

        // Filter by time range (if provided)
        if (startDate && endDate) {
            filters.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        } else if (startDate) {
            filters.createdAt = { $gte: new Date(startDate) };
        } else if (endDate) {
            filters.createdAt = { $lte: new Date(endDate) };
        }

        // Search by customer name or table number (if provided)
        if (search) {
            filters.$or = [
                { customer_name: { $regex: search, $options: "i" } }, // Case-insensitive search
                { table_no: { $regex: search, $options: "i" } },
            ];
        }

        // Pagination settings
        const pageNumber = parseInt(page) || 1; // Default: page 1
        const pageSize = parseInt(limit) || 10; // Default: 10 results per page
        const skip = (pageNumber - 1) * pageSize;

        // Sorting settings
        let sortOptions = {};
        if (sortBy) {
            const sortOrder = order === "asc" ? 1 : -1;
            sortOptions[sortBy] = sortOrder;
        } else {
            sortOptions["createdAt"] = -1; // Default: latest orders first
        }

        // Fetch orders with filters, pagination & sorting
        const orders = await Order.find(filters)
            .populate("items.menu_item")
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);

        // Get total count of filtered orders (for pagination)
        const totalOrders = await Order.countDocuments(filters);

        res.status(200).json({
            success: true,
            count: orders.length,
            totalOrders,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalOrders / pageSize),
            orders,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        next(errorHandler(500, "Failed to retrieve orders"));
    }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId).populate("items.menu_item");
        if (!order) {
            return next(new errorHandler(404, `Order not found: ${orderId}`));
        }
        res.json(order);
    } catch (error) {
        console.error("Error fetching order:", error);
        next(new errorHandler(500, "Failed to fetch order"));
    }
}

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new errorHandler(401, "Unauthorized: No user logged in"));
        }
        if (req.user.role !== "admin" && !req.user.permissions.includes("manage_orders")) {
            return next(new errorHandler(403, "Access Denied: You don't have permission to manage orders"));
        }
        const orderId = req.params.orderId;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!order) {
            return next(new errorHandler(404, `Order not found: ${orderId}`));
        }
        res.json(order);
    } catch (error) {
        console.error("Error updating order status:", error);
        next(new errorHandler(500, "Failed to update order status"));
    }
}

//Add items to an existing order bofore the order status is completed or being cancelled
exports.addToOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params; // Get order ID from URL
        const { items } = req.body; // New items to add

        // Validate request
        if (!items || items.length === 0) {
            return next(new errorHandler(400, "Order must contain at least one item."));
        }

        // Find the order by ID
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new errorHandler(404, "Order not found."));
        }

        // Ensure the order is still open for modifications
        if (order.status === "completed" || order.status === "cancelled") {
            return next(new errorHandler(400, "Cannot modify a completed or cancelled order."));
        }

        let total_price = order.total_price; // Existing total price
        const updatedItems = [...order.items]; // Clone existing items

        for (const orderItem of items) {
            const menuItem = await MenuItem.findById(orderItem.menu_item);

            if (!menuItem) {
                return next(new errorHandler(404, `Item not found: ${orderItem.menu_item}`));
            }

            // Check stock availability
            if (menuItem.stock < orderItem.quantity) {
                return next(new errorHandler(400, `Not enough stock for ${menuItem.name}`));
            }

            // Deduct stock
            menuItem.stock -= orderItem.quantity;
            await menuItem.save();

            // Add new items to order
            updatedItems.push({
                menu_item: menuItem._id,
                quantity: orderItem.quantity,
            });

            // Update total price
            total_price += menuItem.price * orderItem.quantity;
        }

        // Update the order in the database
        order.items = updatedItems;
        order.total_price = total_price;
        await order.save();

        res.status(200).json({
            success: true,
            message: "Items added to order successfully",
            order,
        });
    } catch (error) {
        console.error("Error adding to order:", error);
        next(new errorHandler(500, "Failed to add items to order"));
    }
};
