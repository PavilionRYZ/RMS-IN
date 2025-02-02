const express = require("express");
const router = express.Router();
const { createPayment, updatePaymentStatus, getPaymentsByOrder, refundPayment } = require("../controllers/paymentController");
const { verifyToken, checkAdminOrPermission } = require("../middleware/authMiddleware");
router.route("/payments").post(verifyToken,checkAdminOrPermission("manage_payments"), createPayment); // Create a new payment
router.route("/payments/:paymentId").patch(verifyToken, checkAdminOrPermission("manage_payments"), updatePaymentStatus); // Update payment status
router.route("/payments/order/:orderId").get(verifyToken,checkAdminOrPermission("manage_payments"), getPaymentsByOrder); // Get payments by order
router.route("/payments/refund/:paymentId").post(verifyToken, checkAdminOrPermission("manage_payments"), refundPayment); // Refund payment

module.exports = router;