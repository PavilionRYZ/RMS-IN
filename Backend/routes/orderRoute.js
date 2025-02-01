const express = require('express');
const router = express.Router();
const { placeOrder,getAllOrders, getOrderById, updateOrderStatus, addToOrder } = require('../controllers/orderController');
const { verifyToken, checkAdminOrPermission } = require('../middleware/authMiddleware');

router.route('/order').post(verifyToken, placeOrder); // Only logged-in users with permission can attempt creation
router.route('/order/getAll').get(verifyToken, getAllOrders); // Only logged-in
router.route('/order/:orderId').get(verifyToken, getOrderById); // Only logged-in
router.route('/order/update/:orderId').patch(verifyToken, checkAdminOrPermission("manage_orders"), updateOrderStatus); // Only admins
router.route('/order/add/:orderId').patch(verifyToken, addToOrder); // Only logged-in
module.exports = router;