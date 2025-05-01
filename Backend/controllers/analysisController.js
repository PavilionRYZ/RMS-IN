const Order = require("../models/order");
const Payment = require("../models/payments");
const InventoryItem = require("../models/inventory");
const MenuItem = require("../models/menu");
const Analytics = require("../models/analytics");

exports.generateAnalytics = async (req, res) => {
  try {
    let { period, startDate, endDate } = req.body;

    // Calculate start and end dates for predefined periods
    const now = new Date();
    if (period !== "custom") {
      switch (period) {
        case "daily":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case "weekly":
          startDate = new Date(now.setDate(now.getDate() - now.getDay()));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "monthly":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          throw new Error("Invalid period specified");
      }
    } else {
      if (!startDate || !endDate) {
        throw new Error("Custom period requires startDate and endDate");
      }
      startDate = new Date(startDate);
      endDate = new Date(endDate);
    }

    const analyticsData = await calculateAnalytics(period, startDate, endDate);

    const analytics = new Analytics({
      period,
      startDate,
      endDate,
      ...analyticsData,
    });

    await analytics.save();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Generate analytics error:", error);
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
        totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
      },
    },
    { $sort: { quantity: -1 } },
    { $limit: 5 },
    { $lookup: { from: "menuitems", localField: "_id", foreignField: "_id", as: "item" } },
    { $unwind: "$item" },
  ]);

  // Inventory usage from transactions
  const inventoryUsage = await InventoryItem.aggregate([
    { $unwind: { path: "$transactions", preserveNullAndEmptyArrays: true } },
    { $match: { "transactions.date": { $gte: start, $lte: end }, "transactions.type": "usage" } },
    {
      $group: {
        _id: "$_id",
        item_name: { $first: { $ifNull: ["$item_name", "Unknown Item"] } },
        usedQuantity: { $sum: "$transactions.quantity" },
        totalCost: { $sum: "$transactions.total_value" },
      },
    },
  ]);

  // Inventory additions
  const inventoryAdded = await InventoryItem.aggregate([
    { $unwind: { path: "$transactions", preserveNullAndEmptyArrays: true } },
    { $match: { "transactions.date": { $gte: start, $lte: end }, "transactions.type": "addition" } },
    {
      $group: {
        _id: "$_id",
        item_name: { $first: { $ifNull: ["$item_name", "Unknown Item"] } },
        addedQuantity: { $sum: "$transactions.quantity" },
        totalValue: { $sum: "$transactions.total_value" },
      },
    },
  ]);

  // Inventory stock
  const inventoryStock = await InventoryItem.aggregate([
    {
      $project: {
        _id: 1,
        item_name: { $ifNull: ["$item_name", "Unknown Item"] },
        current_quantity: { $ifNull: ["$current_quantity", 0] },
        average_unit_price: { $ifNull: ["$average_unit_price", 0] },
        total_value: { $ifNull: ["$total_value", 0] },
      },
    },
  ]);

  // Debugging: Log inventory data
  // console.log("Inventory Stock:", JSON.stringify(inventoryStock, null, 2));
  // console.log("Inventory Usage:", JSON.stringify(inventoryUsage, null, 2));
  // console.log("Inventory Added:", JSON.stringify(inventoryAdded, null, 2));

  // Low stock alerts (stock below 10% of average usage)
  const lowStockItems = inventoryStock
    .filter((item) => {
      const usage = inventoryUsage.find((u) => u._id.toString() === item._id?.toString());
      const avgUsage = usage ? usage.usedQuantity / ((end - start) / (1000 * 60 * 60 * 24)) : 0;
      return item.current_quantity < avgUsage * 0.1 && item.current_quantity > 0;
    })
    .map((item) => ({
      name: item.item_name,
      current_quantity: item.current_quantity,
      average_unit_price: item.average_unit_price,
    }));

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
    inventory: {
      added: {
        count: inventoryAdded.reduce((sum, item) => sum + (item.addedQuantity || 0), 0),
        value: inventoryAdded.reduce((sum, item) => sum + (item.totalValue || 0), 0),
      },
      used: {
        count: inventoryUsage.reduce((sum, item) => sum + (item.usedQuantity || 0), 0),
        value: inventoryCost,
      },
    },
    inventoryAnalysis: {
      usage: inventoryUsage.map((i) => ({
        item: { _id: i._id, name: i.item_name },
        usedQuantity: i.usedQuantity || 0,
        totalCost: i.totalCost || 0,
      })),
      stock: inventoryStock.map((i) => ({
        item: { _id: i._id, name: i.item_name },
        currentStock: i.current_quantity || 0,
        unitCost: i.average_unit_price || 0,
        totalValue: i.total_value || 0,
      })),
      lowStock: lowStockItems.map((i) => ({
        name: i.name,
        currentStock: i.current_quantity,
        unitCost: i.average_unit_price,
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
    console.error("Get analytics error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};