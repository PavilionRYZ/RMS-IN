// controllers/analyticsController.js
const Order = require("../models/order");
const Payment = require("../models/payments");
const InventoryItem = require("../models/inventory");
const MenuItem = require("../models/menu");
const Analytics = require("../models/analytics");

exports.generateAnalytics = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const analyticsData = await calculateAnalytics(period, start, end);

    const analytics = new Analytics({
      period,
      startDate: start,
      endDate: end,
      ...analyticsData,
    });

    await analytics.save();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

async function calculateAnalytics(period, start, end) {
  // Orders aggregation
  const orders = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end } } },
    {
      $group: {
        _id: { type: "$order_type", status: "$status" },
        count: { $sum: 1 },
        amount: { $sum: "$total_price" },
      },
    },
  ]);

  // Payments aggregation
  const payments = await Payment.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, payment_status: "completed" } },
    { $group: { _id: "$payment_method", count: { $sum: 1 }, amount: { $sum: "$amount" } } },
  ]);

  // Top selling items
  const topItems = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, status: "completed" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.menu_item",
        quantity: { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.quantity", "$total_price"] } },
      },
    },
    { $sort: { quantity: -1 } },
    { $limit: 5 },
    { $lookup: { from: "menuitems", localField: "_id", foreignField: "_id", as: "item" } },
    { $unwind: "$item" },
  ]);

  // Inventory usage from transactions
  const inventoryUsage = await InventoryItem.aggregate([
    { $unwind: "$transactions" },
    { $match: { "transactions.date": { $gte: start, $lte: end }, "transactions.type": "usage" } },
    {
      $group: {
        _id: "$item",
        usedQuantity: { $sum: "$transactions.quantity" },
        totalCost: { $sum: "$transactions.total_value" },
      },
    },
    { $lookup: { from: "menuitems", localField: "_id", foreignField: "_id", as: "item" } },
    { $unwind: "$item" },
  ]);

  // Inventory stock
  const inventoryStock = await InventoryItem.aggregate([
    {
      $project: {
        item: "$item",
        currentStock: "$stockLevel",
        unitCost: "$unitCost",
        totalValue: { $multiply: ["$stockLevel", "$unitCost"] },
      },
    },
    { $lookup: { from: "menuitems", localField: "item", foreignField: "_id", as: "item" } },
    { $unwind: "$item" },
  ]);

  // Calculate totals
  const totalSales = orders.reduce(
    (sum, order) => (order._id.status === "completed" ? sum + order.amount : sum),
    0
  );
  const inventoryCost = inventoryUsage.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  const totalProfit = totalSales - inventoryCost;

  return {
    totalSales,
    totalProfit,
    totalLoss: orders.reduce(
      (sum, order) => (order._id.status === "cancelled" ? sum + order.amount : sum),
      0
    ),
    orderTypes: {
      dineIn: orders.find((o) => o._id.type === "dine-in") || { count: 0, amount: 0 },
      takeaway: orders.find((o) => o._id.type === "takeaway") || { count: 0, amount: 0 },
      online: orders.find((o) => o._id.type === "online") || { count: 0, amount: 0 },
    },
    paymentMethods: {
      cash: payments.find((p) => p._id === "cash") || { count: 0, amount: 0 },
      card: payments.find((p) => p._id === "card") || { count: 0, amount: 0 },
      online: payments.find((p) => p._id === "online") || { count: 0, amount: 0 },
    },
    orderStatus: {
      confirmed: orders.reduce((sum, o) => (o._id.status === "completed" ? sum + o.count : sum), 0),
      cancelled: orders.reduce((sum, o) => (o._id.status === "cancelled" ? sum + o.count : sum), 0),
    },
    inventoryAnalysis: {
      usage: inventoryUsage.map((i) => ({
        item: i.item,
        usedQuantity: i.usedQuantity,
        totalCost: i.totalCost,
      })),
      stock: inventoryStock.map((i) => ({
        item: i.item,
        currentStock: i.currentStock,
        unitCost: i.unitCost,
        totalValue: i.totalValue,
      })),
    },
    topSellingItems: topItems,
  };
}

exports.getAnalytics = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const query = {};

    if (period) query.period = period;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    const analytics = await Analytics.find(query)
      .populate("topSellingItems.item")
      .sort({ generatedAt: -1 });

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};