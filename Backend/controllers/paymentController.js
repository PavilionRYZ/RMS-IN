const mongoose = require("mongoose");
const Order = require("../models/order"); // Import Order model
const Payment = require("../models/payments"); // Import Payment model
const errorHandler = require("../utils/errorHandler");

// Create a new payment
exports.createPayment = async (req, res, next) => {
    try {
        let { orderId, payment_method, transaction_id } = req.body;

        // Validate if orderId exists in request body
        if (!orderId) {
            return next(new errorHandler(400, "Order ID is required"));
        }

        // Trim and validate orderId
        orderId = orderId.toString().trim();
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return next(new errorHandler(400, "Invalid Order ID format"));
        }

        // Check if the order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return next(new errorHandler(400, "Order not found"));
        }

        if (order.status !== "completed") {
            return next(new errorHandler(400, `Order is not completed order is still in ${order.status} state`));
        }

        if (order.payment != null) {
            return next(new errorHandler(400, "Order is already paid"));
        }

        // Fetch amount from the order's total price
        const amount = order.total_price;
        const order_type = order.order_type;

        // Create payment record
        const payment = new Payment({
            order: orderId,
            order_type: order_type,
            amount,
            payment_method,
            transaction_id: transaction_id || null,
            payment_status: payment_method === "cash" ? "completed" : "pending",
        });

        // Save payment
        await payment.save();

        if (payment.payment_status === "complete") {
            // Link payment to the order and update order status
            order.payment = payment._id;
            await order.save();
        }
        res.status(201).json({ success: true, message: "Payment created and linked to order successfully", payment });
    } catch (error) {
        console.error("Error creating payment:", error);
        next(new errorHandler(500, "Failed to create payment"));
    }
};

// Update payment status (e.g., after online payment confirmation)
exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const { payment_status } = req.body;

        //validate paymentid
        if (!mongoose.Types.ObjectId.isValid(paymentId)) {
            return next(new errorHandler(400, "Invalid Payment ID format"));
        }
        // Find payment by ID
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return next(new errorHandler(400, "Payment not found"));
        }

        // Find related order
        const order = await Order.findById(payment.order);
        if (!order) {
            return next(new errorHandler(400, "Associated order not found"));
        }

        // If payment is already set for the order, prevent re-assignment
        if (order.payment && order.payment.toString() !== paymentId) {
            return next(new errorHandler(400, "Order is already paid"));
        }

        // Update payment status
        payment.payment_status = payment_status;
        await payment.save();

        // If payment is completed, update the order
        if (payment_status === "completed") {
            order.payment = payment._id; // Assign payment to the order
            await order.save();
        }

        res.status(200).json({ success: true, message: "Payment status updated", payment });
    } catch (error) {
        console.error("Error updating payment status:", error);
        next(new errorHandler(500, "Failed to update payment status"));
    }
};

// Get payments for a specific order
exports.getPaymentsByOrder = async (req, res, next) => {
    try {
        let { orderId } = req.params;
        orderId = orderId.toString().trim();
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return next(new errorHandler(400, "Invalid Order ID format"));
        }
        const payments = await Payment.find({ order: orderId });

        if (!payments.length) {
            return next(new errorHandler(400, "No payments found for this order"));

        }

        res.status(200).json({ success: true, count: payments.length, payments });
    } catch (error) {
        console.error("Error fetching payments:", error);
        next(new errorHandler(500, "Failed to fetch payments"));
    }
};

// Refund a payment
exports.refundPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        // validate paymentid
        if (!mongoose.Types.ObjectId.isValid(paymentId)) {
            return next(new errorHandler(400, "Invalid Payment ID format"));
        }
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return next(new errorHandler(400, "Payment not found"));
        }

        if (payment.payment_status !== "completed") {
            return next(new errorHandler(400, "Payment is not completed"));
        }

        // Update payment status to refunded
        payment.payment_status = "refunded";
        await payment.save();

        res.status(200).json({ success: true, message: "Payment refunded successfully", payment });
    } catch (error) {
        console.error("Error refunding payment:", error);
        next(new errorHandler(500, "Failed to refund payment"));
    }
};
