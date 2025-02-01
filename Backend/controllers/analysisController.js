const Order = require("../models/order");
const InventoryItem = require("../models/inventory");
const SalesAnalytics = require("../models/analytics");

// Utility function to get date filters
const getDateRange = (filter) => {
    const now = new Date();
    let startDate, endDate;

    switch (filter) {
        case "day":
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date();
            break;
        case "week":
            startDate = new Date(now.setDate(now.getDate() - 7));
            endDate = new Date();
            break;
        case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date();
            break;
        case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date();
            break;
        default:
            startDate = null;
            endDate = null;
    }
    return { startDate, endDate };
};

// 🔹 Controller to fetch sales & spend analysis
exports.getSalesAndSpendAnalysis = async (req, res, next) => {
    try {
        let { filter, startDate, endDate, orderType, paymentMethod } = req.query;
        let dateFilter = {};

        // Apply pre-defined date filters (day, week, month, year)
        if (filter) {
            const { startDate: start, endDate: end } = getDateRange(filter);
            dateFilter.createdAt = { $gte: start, $lte: end };
        }

        // Custom date range filter
        if (startDate && endDate) {
            dateFilter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Fetch Orders based on filters
        let orderFilter = { ...dateFilter };
        if (orderType) orderFilter.order_type = orderType;
        if (paymentMethod) orderFilter[`payment_methods.${paymentMethod}`] = { $gt: 0 };

        const orders = await Order.find(orderFilter);
        const completedOrders = orders.filter((order) => order.status === "completed").length;
        const cancelledOrders = orders.filter((order) => order.status === "cancelled").length;
        const totalRevenue = orders.reduce((acc, order) => acc + order.total_price, 0);
        const averageOrderValue = orders.length ? totalRevenue / orders.length : 0;

        // Payment method analytics
        const paymentMethods = {
            cash: orders.reduce((acc, order) => acc + (order.payment_methods?.cash || 0), 0),
            card: orders.reduce((acc, order) => acc + (order.payment_methods?.card || 0), 0),
            online: orders.reduce((acc, order) => acc + (order.payment_methods?.online || 0), 0),
        };

        // Fetch Inventory Spend count the total revenue only after the order status is marked as completed
        const inventoryItems = await InventoryItem.find(dateFilter);
        const totalCost = inventoryItems.reduce((acc, item) => acc + item.total_spent, 0);

        // Calculate Net Profit/Loss
        const netProfit = totalRevenue - totalCost;
        const profitOrLoss = netProfit >= 0 ? "Profit" : "Loss";

        res.status(200).json({
            success: true,
            data: {
                total_orders: orders.length,
                completed_orders: completedOrders,
                cancelled_orders: cancelledOrders,
                total_revenue: totalRevenue,
                average_order_value: averageOrderValue.toFixed(2),
                payment_methods: paymentMethods,
                total_cost: totalCost,
                net_profit: netProfit,
                profit_or_loss: profitOrLoss,
            },
        });
    } catch (error) {
        console.error("Error fetching sales analysis:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve sales analysis" });
    }
};
