// const Order = require("../models/order");
// const SalesAnalytics = require("../models/analytics");
// const InventoryItem = require("../models/inventory");

// // Utility function to get start and end date of time periods
// const getTimePeriod = (period, startDate, endDate) => {
//     const now = new Date();
//     let start, end;

//     switch (period) {
//         case "weekly":
//             start = new Date();
//             start.setDate(now.getDate() - 7);
//             break;
//         case "monthly":
//             start = new Date(now.getFullYear(), now.getMonth(), 1);
//             break;
//         case "yearly":
//             start = new Date(now.getFullYear(), 0, 1);
//             break;
//         case "custom":
//             start = new Date(startDate);
//             end = new Date(endDate);
//             break;
//         default:
//             start = new Date(0);
//     }

//     end = end || now;
//     return { start, end };
// };

// // 📌 Controller: Sales Analysis
// exports.getSalesAnalysis = async (req, res, next) => {
//     try {
//         const { period, startDate, endDate, payment_method, customer_type, sort } = req.query;
//         const { start, end } = getTimePeriod(period, startDate, endDate);

//         const matchCriteria = {
//             status: "completed",
//             payment: { $ne: null }, // Only paid orders
//             createdAt: { $gte: start, $lte: end }, // Filter by time range
//         };

//         if (payment_method) {
//             matchCriteria["payment.payment_method"] = payment_method;
//         }
//         if (customer_type) {
//             matchCriteria.order_type = customer_type;
//         }

//         // 🔹 Aggregate Data
//         const orders = await Order.aggregate([
//             {
//               $group: {
//                 _id: null,
//                 orders_count: { $sum: 1 },
//                 completed_orders: { 
//                   $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } 
//                 },
//                 total_revenue: { $sum: "$total_price" },
//                 total_cost: { $sum: "$cost_price" },
//                 net_profit: {
//                   $subtract: [
//                     { $sum: "$total_price" },
//                     { $sum: "$cost_price" }
//                   ]
//                 },
//                 payment_methods: { $push: "$payment.payment_method" },
//                 customer_types: { $push: "$order_type" }
//               }
//             },
//             {
//               $unwind: "$payment_methods"
//             },
//             {
//               $group: {
//                 _id: "$payment_methods",
//                 count: { $sum: 1 }
//               }
//             },
//             {
//               $group: {
//                 _id: null,
//                 orders_count: { $first: "$orders_count" },
//                 completed_orders: { $first: "$completed_orders" },
//                 total_revenue: { $first: "$total_revenue" },
//                 total_cost: { $first: "$total_cost" },
//                 net_profit: { $first: "$net_profit" },
//                 payment_methods: { $push: { method: "$_id", count: "$count" } },
//                 customer_types: { $first: "$customer_types" }
//               }
//             }
//           ]);
          

//         if (!orders.length) {
//             return res.status(200).json({ success: true, message: "No completed orders in this period", data: {} });
//         }

//         let data = orders[0];

//         // 🔹 Get Inventory Costs
//         const inventoryData = await InventoryItem.aggregate([
//             {
//                 $match: {
//                     last_updated: { $gte: start, $lte: end },
//                 },
//             },
//             {
//                 $group: {
//                     _id: null,
//                     total_cost: { $sum: "$total_spent" },
//                 },
//             },
//         ]);

//         data.total_cost = inventoryData.length ? inventoryData[0].total_cost : 0;
//         data.net_profit = data.total_revenue - data.total_cost;

//         // 🔹 Payment Method Breakdown
//         data.payment_methods = data.payment_methods.reduce((acc, method) => {
//             acc[method] = (acc[method] || 0) + 1;
//             return acc;
//         }, {});

//         // 🔹 Sorting Functionality
//         if (sort === "revenue") {
//             data.orders = data.orders?.sort((a, b) => b.total_price - a.total_price);
//         } else if (sort === "date") {
//             data.orders = data.orders?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//         }

//         res.status(200).json({ success: true, message: "Sales analysis generated", data });
//     } catch (error) {
//         console.error("Error generating sales analysis:", error);
//         next(new Error("Failed to generate sales analysis"));
//     }
// };

// // 📌 Utility function to get the previous month’s start and end dates
// const getPreviousMonthDates = () => {
//     const now = new Date();
//     const start = new Date(now.getFullYear(), now.getMonth() - 1, 1); // First day of last month
//     const end = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of last month
//     return { start, end };
// };

// // 📌 Save Monthly Sales Analysis to Database
// exports.saveMonthlySalesAnalysis = async () => {
//     try {
//         const { start, end } = getPreviousMonthDates();

//         const orders = await Order.aggregate([
//             {
//                 $lookup: {
//                     from: "payments",
//                     localField: "payment",
//                     foreignField: "_id",
//                     as: "payment",
//                 },
//             },
//             { $unwind: "$payment" },
//             {
//                 $match: {
//                     status: "completed",
//                     payment: { $ne: null },
//                     createdAt: { $gte: start, $lte: end },
//                 },
//             },
//             {
//                 $group: {
//                     _id: null,
//                     orders_count: { $sum: 1 },
//                     completed_orders: { $sum: 1 },
//                     total_revenue: { $sum: "$total_price" },
//                     payment_methods: {
//                         cash: { $sum: { $cond: [{ $eq: ["$payment.payment_method", "cash"] }, 1, 0] } },
//                         card: { $sum: { $cond: [{ $eq: ["$payment.payment_method", "card"] }, 1, 0] } },
//                         online: { $sum: { $cond: [{ $eq: ["$payment.payment_method", "online"] }, 1, 0] } },
//                     },
//                     customer_types: {
//                         dine_in: { $sum: { $cond: [{ $eq: ["$order_type", "dine-in"] }, 1, 0] } },
//                         takeaway: { $sum: { $cond: [{ $eq: ["$order_type", "takeaway"] }, 1, 0] } },
//                         online: { $sum: { $cond: [{ $eq: ["$order_type", "online"] }, 1, 0] } },
//                     },
//                 },
//             },
//         ]);

//         if (!orders.length) {
//             console.log("No completed orders for last month. Skipping analytics save.");
//             return;
//         }

//         let data = orders[0];

//         // Fetch inventory costs for last month
//         const inventoryData = await InventoryItem.aggregate([
//             {
//                 $match: { last_updated: { $gte: start, $lte: end } },
//             },
//             {
//                 $group: {
//                     _id: null,
//                     total_cost: { $sum: "$total_spent" },
//                 },
//             },
//         ]);

//         data.total_cost = inventoryData.length ? inventoryData[0].total_cost : 0;
//         data.net_profit = data.total_revenue - data.total_cost;

//         // Save analysis in database
//         const newReport = new SalesAnalytics({
//             date: start,
//             orders_count: data.orders_count,
//             completed_orders: data.completed_orders,
//             total_revenue: data.total_revenue,
//             payment_methods: data.payment_methods,
//             customer_types: data.customer_types,
//             total_cost: data.total_cost,
//             net_profit: data.net_profit,
//         });

//         await newReport.save();
//         console.log("✅ Monthly sales analysis saved successfully!");
//     } catch (error) {
//         console.error("❌ Error saving monthly sales analysis:", error);
//     }
// };
