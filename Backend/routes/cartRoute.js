const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const { addToCart, getCart, updateCartItem, removeFromCart, clearCart } = require("../controllers/cartController");

router.route("/cart").get(verifyToken, getCart); // Get user's cart
router.route("/cart/add").post(verifyToken, addToCart); // Add item to cart
router.route("/cart/update").patch(verifyToken, updateCartItem); // Update item quantity
router.route("/cart/remove").delete(verifyToken, removeFromCart); // Remove item from cart
router.route("/cart/clear").delete(verifyToken, clearCart); // Clear cart

module.exports = router;
