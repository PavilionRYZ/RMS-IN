const mongoose = require("mongoose");
const Order = require("../models/order");
const Payment = require("../models/payments");
const errorHandler = require("../utils/errorHandler");

// Create a new payment
exports.createPayment = async (req, res, next) => {
  try {
    let { orderId, payment_method, transaction_id, payment_status } = req.body;

    // Validate orderId
    if (!orderId) {
      return next(new errorHandler(400, "Order ID is required"));
    }

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
      return next(new errorHandler(400, `Order is not completed, order is still in ${order.status} state`));
    }

    if (order.payment != null) {
      return next(new errorHandler(400, "Order is already paid"));
    }

    // Validate payment method
    if (!["cash", "card", "online"].includes(payment_method)) {
      return next(new errorHandler(400, "Invalid payment method"));
    }

    // Validate payment status
    if (payment_status && !["pending", "completed", "failed", "refunded"].includes(payment_status)) {
      return next(new errorHandler(400, "Invalid payment status"));
    }

    // Require transaction ID for completed card/online payments
    if (
      (payment_method === "card" || payment_method === "online") &&
      payment_status === "completed" &&
      !transaction_id
    ) {
      return next(new errorHandler(400, "Transaction ID is required for completed card/online payments"));
    }

    // Fetch amount and order_type from order
    const amount = order.total_price;
    const order_type = order.order_type;

    // Create payment record
    const payment = new Payment({
      order: orderId,
      order_type,
      amount,
      payment_method,
      transaction_id: transaction_id || null,
      payment_status: payment_status || (payment_method === "cash" ? "completed" : "pending"),
    });

    await payment.save();

    if (payment.payment_status === "completed") {
      order.payment = payment._id;
      await order.save();
    }

    res.status(201).json({ success: true, message: "Payment created successfully", payment });
  } catch (error) {
    console.error("Error creating payment:", error);
    next(new errorHandler(500, "Failed to create payment"));
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { payment_status, payment_method } = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return next(new errorHandler(400, "Invalid Payment ID format"));
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return next(new errorHandler(400, "Payment not found"));
    }

    // Prevent modifications if payment is completed
    if (payment.payment_status === "completed") {
      return next(new errorHandler(400, "Cannot modify a completed payment"));
    }

    const order = await Order.findById(payment.order);
    if (!order) {
      return next(new errorHandler(400, "Associated order not found"));
    }

    if (order.payment && order.payment.toString() !== paymentId) {
      return next(new errorHandler(400, "Order is already paid"));
    }

    // Validate inputs
    if (payment_status && !["pending", "completed", "failed", "refunded"].includes(payment_status)) {
      return next(new errorHandler(400, "Invalid payment status"));
    }
    if (payment_method && !["cash", "card", "online"].includes(payment_method)) {
      return next(new errorHandler(400, "Invalid payment method"));
    }

    // Update payment
    if (payment_status) payment.payment_status = payment_status;
    if (payment_method) payment.payment_method = payment_method;
    await payment.save();

    if (payment_status === "completed") {
      order.payment = payment._id;
      await order.save();
    }

    res.status(200).json({ success: true, message: "Payment updated", payment });
  } catch (error) {
    console.error("Error updating payment:", error);
    next(new errorHandler(500, "Failed to update payment"));
  }
};

// Get payments for a specific order
exports.getPaymentsByOrder = async (req, res, next) => {
  try {
    let { orderId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    orderId = orderId.toString().trim();
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new errorHandler(400, "Invalid Order ID format"));
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find({ order: orderId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Payment.countDocuments({ order: orderId }),
    ]);

    if (!payments.length && pageNum === 1) {
      return next(new errorHandler(400, "No payments found for this order"));
    }

    res.status(200).json({
      success: true,
      data: {
        payments,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    next(new errorHandler(500, "Failed to fetch payments"));
  }
};

// Refund a payment
exports.refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

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

    payment.payment_status = "refunded";
    await payment.save();

    res.status(200).json({ success: true, message: "Payment refunded successfully", payment });
  } catch (error) {
    console.error("Error refunding payment:", error);
    next(new errorHandler(500, "Failed to refund payment"));
  }
};