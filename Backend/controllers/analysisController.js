const Order = require("../models/order");
const Payment = require("../models/payments");
const MenuItem = require("../models/menu");
const InventoryItem = require("../models/inventory");
const Analytics = require("../models/analytics");
const errorHandler = require("../utils/errorHandler");

// Mock mapping of MenuItem to InventoryItem usage (in a real app, this would be a separate model)
const menuItemToInventoryMapping = {
  // Example: { menu_item_id: { inventory_item_id: quantity_used_per_unit } }
  // "menu_item_id_1": { "inventory_item_id_1": 0.1, "inventory_item_id_2": 0.2 }
};

// Helper function to get the start and end of a day
const getDayRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Compute and store daily analytics
exports.computeDailyAnalytics = async (req, res, next) => {
  try {
    const { date } = req.body; // Date for which to compute analytics (e.g., "2025-04-02")
    const targetDate = date ? new Date(date) : new Date();
    const { start, end } = getDayRange(targetDate);

    // Check if analytics for this date already exist
    let analytics = await Analytics.findOne({ date: start });
    if (analytics) {
      return res.status(200).json({
        success: true,
        message: "Analytics already computed for this date",
        analytics,
      });
    }

    // Fetch orders for the given date
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: "completed",
    }).populate("payment items.menu_item");

    // Initialize analytics data
    const analyticsData = {
      date: start,
      orders: {
        total: orders.length,
        by_type: { "dine-in": 0, takeaway: 0, online: 0 },
        by_payment_method: { cash: 0, card: 0, online: 0 },
      },
      items: [],
      inventory: [],
      financials: {
        total_revenue: 0,
        total_cost: 0,
        profit: 0,
      },
    };

    // Compute order analytics
    const itemMap = new Map(); // Track items for frequency and revenue
    const inventoryUsageMap = new Map(); // Track inventory usage

    for (const order of orders) {
      // Order types
      analyticsData.orders.by_type[order.order_type] += 1;

      // Payment methods (from Payment model)
      if (order.payment && order.payment.payment_status === "completed") {
        analyticsData.orders.by_payment_method[order.payment.payment_method] += 1;
      }

      // Total revenue
      analyticsData.financials.total_revenue += order.total_price;

      // Items ordered
      for (const item of order.items) {
        const menuItem = item.menu_item;
        const itemKey = menuItem._id.toString();
        if (itemMap.has(itemKey)) {
          const existing = itemMap.get(itemKey);
          existing.total_quantity += item.quantity;
          existing.total_revenue += item.quantity * menuItem.price;
        } else {
          itemMap.set(itemKey, {
            menu_item_id: menuItem._id,
            item_name: menuItem.name,
            total_quantity: item.quantity,
            total_revenue: item.quantity * menuItem.price,
          });
        }

        // Inventory usage (based on mock mapping)
        const inventoryUsage = menuItemToInventoryMapping[itemKey];
        if (inventoryUsage) {
          for (const [invItemId, qtyPerUnit] of Object.entries(inventoryUsage)) {
            const quantityUsed = qtyPerUnit * item.quantity;
            const inventoryItem = await InventoryItem.findById(invItemId);
            if (inventoryItem) {
              const cost = quantityUsed * inventoryItem.unit_price;
              analyticsData.financials.total_cost += cost;

              if (inventoryUsageMap.has(invItemId)) {
                inventoryUsageMap.get(invItemId).stock_used += quantityUsed;
              } else {
                inventoryUsageMap.set(invItemId, {
                  inventory_item_id: invItemId,
                  item_name: inventoryItem.item_name,
                  current_stock: inventoryItem.quantity,
                  stock_used: quantityUsed,
                });
              }
            }
          }
        }
      }
    }

    // Convert maps to arrays for storage
    analyticsData.items = Array.from(itemMap.values());
    analyticsData.inventory = Array.from(inventoryUsageMap.values());

    // Calculate profit
    analyticsData.financials.profit =
      analyticsData.financials.total_revenue - analyticsData.financials.total_cost;

    // Fetch current inventory levels for items not used in orders
    const allInventoryItems = await InventoryItem.find();
    for (const invItem of allInventoryItems) {
      if (!analyticsData.inventory.some((i) => i.inventory_item_id.toString() === invItem._id.toString())) {
        analyticsData.inventory.push({
          inventory_item_id: invItem._id,
          item_name: invItem.item_name,
          current_stock: invItem.quantity,
          stock_used: 0,
        });
      }
    }

    // Save analytics data
    analytics = new Analytics(analyticsData);
    await analytics.save();

    res.status(201).json({
      success: true,
      message: "Daily analytics computed successfully",
      analytics,
    });
  } catch (error) {
    console.error("Error computing daily analytics:", error);
    next(new errorHandler(500, "Failed to compute daily analytics"));
  }
};

// Get analytics for a date range (daily or monthly)
exports.getAnalytics = async (req, res, next) => {
  try {
    let { startDate, endDate, type } = req.query; // type: "daily" or "monthly"

    if (!startDate || !endDate) {
      return next(new errorHandler(400, "Start date and end date are required"));
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    let analytics;
    if (type === "monthly") {
      // Aggregate daily analytics into monthly data
      analytics = await Analytics.aggregate([
        {
          $match: {
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            total_orders: { $sum: "$orders.total" },
            orders_by_type: {
              $mergeObjects: {
                "dine-in": { $sum: "$orders.by_type.dine-in" },
                takeaway: { $sum: "$orders.by_type.takeaway" },
                online: { $sum: "$orders.by_type.online" },
              },
            },
            orders_by_payment_method: {
              $mergeObjects: {
                cash: { $sum: "$orders.by_payment_method.cash" },
                card: { $sum: "$orders.by_payment_method.card" },
                online: { $sum: "$orders.by_payment_method.online" },
              },
            },
            items: {
              $push: "$items",
            },
            inventory: {
              $push: "$inventory",
            },
            total_revenue: { $sum: "$financials.total_revenue" },
            total_cost: { $sum: "$financials.total_cost" },
            profit: { $sum: "$financials.profit" },
          },
        },
        {
          $project: {
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: 1,
              },
            },
            orders: {
              total: "$total_orders",
              by_type: "$orders_by_type",
              by_payment_method: "$orders_by_payment_method",
            },
            items: {
              $reduce: {
                input: "$items",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] },
              },
            },
            inventory: {
              $reduce: {
                input: "$inventory",
                initialValue: [],
                in: { $concatArrays: ["$$value", "$$this"] },
              },
            },
            financials: {
              total_revenue: "$total_revenue",
              total_cost: "$total_cost",
              profit: "$profit",
            },
          },
        },
        { $sort: { date: 1 } },
      ]);

      // Aggregate items for monthly data
      analytics = analytics.map((month) => {
        const itemMap = new Map();
        for (const item of month.items) {
          if (itemMap.has(item.item_name)) {
            const existing = itemMap.get(item.item_name);
            existing.total_quantity += item.total_quantity;
            existing.total_revenue += item.total_revenue;
          } else {
            itemMap.set(item.item_name, {
              menu_item_id: item.menu_item_id,
              item_name: item.item_name,
              total_quantity: item.total_quantity,
              total_revenue: item.total_revenue,
            });
          }
        }
        month.items = Array.from(itemMap.values());

        // Aggregate inventory for monthly data (use the latest stock level)
        const inventoryMap = new Map();
        for (const inv of month.inventory) {
          if (inventoryMap.has(inv.inventory_item_id.toString())) {
            const existing = inventoryMap.get(inv.inventory_item_id.toString());
            existing.stock_used += inv.stock_used;
            existing.current_stock = inv.current_stock; // Use the latest stock level
          } else {
            inventoryMap.set(inv.inventory_item_id.toString(), {
              inventory_item_id: inv.inventory_item_id,
              item_name: inv.item_name,
              current_stock: inv.current_stock,
              stock_used: inv.stock_used,
            });
          }
        }
        month.inventory = Array.from(inventoryMap.values());

        return month;
      });
    } else {
      // Fetch daily analytics
      analytics = await Analytics.find({
        date: { $gte: start, $lte: end },
      }).sort({ date: 1 });
    }

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    next(new errorHandler(500, "Failed to fetch analytics"));
  }
};