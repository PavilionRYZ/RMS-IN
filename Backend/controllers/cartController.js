const Cart = require("../models/cart");
const MenuItem = require("../models/menu");
const errorHandler = require("../utils/errorHandler");

// Add item to cart
exports.addToCart = async (req, res, next) => {
    try {
        const { menu_item, quantity } = req.body;
        const userId = req.user.id;

        if (!menu_item || quantity <= 0) {
            return next(new errorHandler(400, "Invalid item or quantity."));
        }

        const menuItem = await MenuItem.findById(menu_item);
        if (!menuItem) {
            return next(new errorHandler(404, "Menu item not found."));
        }

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [], total_price: 0 });
        }

        const existingItem = cart.items.find((item) => item.menu_item.equals(menu_item));

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ menu_item, quantity });
        }

        cart.total_price += menuItem.price * quantity;
        await cart.save();

        res.status(200).json({ success: true, message: "Item added to cart", cart });
    } catch (error) {
        // console.error("Error adding to cart:", error);
        next(new errorHandler(500, "Failed to add item to cart"));
    }
};

// Get user cart
exports.getCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId }).populate("items.menu_item");

        if (!cart) {
            return res.status(200).json({ success: true, cart: { items: [], total_price: 0 } });
        }

        res.status(200).json({ success: true, cart });
    } catch (error) {
        // console.error("Error fetching cart:", error);
        next(new errorHandler(500, "Failed to fetch cart"));
    }
};

// Update item quantity in cart
exports.updateCartItem = async (req, res, next) => {
    try {
        const { menu_item, quantity } = req.body;
        const userId = req.user.id;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return next(new errorHandler(404, "Cart not found."));
        }

        const itemIndex = cart.items.findIndex((item) => item.menu_item.equals(menu_item));

        if (itemIndex === -1) {
            return next(new errorHandler(404, "Item not found in cart."));
        }

        const menuItem = await MenuItem.findById(menu_item);
        if (!menuItem) {
            return next(new errorHandler(404, "Menu item not found."));
        }

        const oldQuantity = cart.items[itemIndex].quantity;
        cart.items[itemIndex].quantity = quantity;

        cart.total_price += menuItem.price * (quantity - oldQuantity);
        await cart.save();

        res.status(200).json({ success: true, message: "Cart updated", cart });
    } catch (error) {
        // console.error("Error updating cart:", error);
        next(new errorHandler(500, "Failed to update cart"));
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
    try {
        const { menu_item } = req.body;
        const userId = req.user.id;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return next(new errorHandler(404, "Cart not found."));
        }

        const itemIndex = cart.items.findIndex((item) => item.menu_item.equals(menu_item));

        if (itemIndex === -1) {
            return next(new errorHandler(404, "Item not found in cart."));
        }

        const menuItem = await MenuItem.findById(menu_item);
        if (!menuItem) {
            return next(new errorHandler(404, "Menu item not found."));
        }

        cart.total_price -= menuItem.price * cart.items[itemIndex].quantity;
        cart.items.splice(itemIndex, 1);

        await cart.save();

        res.status(200).json({ success: true, message: "Item removed from cart", cart });
    } catch (error) {
        // console.error("Error removing from cart:", error);
        next(new errorHandler(500, "Failed to remove item from cart"));
    }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await Cart.findOneAndDelete({ user: userId });

        res.status(200).json({ success: true, message: "Cart cleared" });
    } catch (error) {
        // console.error("Error clearing cart:", error);
        next(new errorHandler(500, "Failed to clear cart"));
    }
};
