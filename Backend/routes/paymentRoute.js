const express = require("express");
const router = express.Router();
const { createPayment, updatePaymentStatus, getPaymentsByOrder, refundPayment } = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");
router.route("/payments").post(verifyToken,createPayment); // Create a new payment
router.route("/payments/:paymentId").patch(updatePaymentStatus); // Update payment status
router.route("/payments/order/:orderId").get(getPaymentsByOrder); // Get payments by order
router.route("/payments/refund/:paymentId").post(refundPayment); // Refund payment

module.exports = router;