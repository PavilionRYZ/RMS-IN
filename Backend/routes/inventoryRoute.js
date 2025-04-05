const express = require('express');
const router = express.Router();
const {
    addStock,
    useStock,
    getAllInventoryItems,
    getInventoryItemDetails,
    deleteInventoryItem,
    createInventoryItem
} = require('../controllers/inventoryController');
const { verifyToken, checkAdminOrPermission } = require('../middleware/authMiddleware');

// Create new inventory item without initial stock
router.route('/inventory/create')
    .post(verifyToken, checkAdminOrPermission('inventory_management'), createInventoryItem);

// Add new stock to inventory
router.route('/inventory/add-stock')
    .post(verifyToken, checkAdminOrPermission('inventory_management'), addStock);

// Use stock from inventory
router.route('/inventory/use-stock')
    .post(verifyToken, checkAdminOrPermission('inventory_management'), useStock);

// Get all inventory items
router.route('/inventory/items')
    .get(verifyToken, checkAdminOrPermission('inventory_management'), getAllInventoryItems);

// Get specific inventory item details with transaction history
router.route('/inventory/item/:id')
    .get(verifyToken, checkAdminOrPermission('inventory_management'), getInventoryItemDetails);

// Delete inventory item
router.route('/inventory/item/delete/:id')
    .delete(verifyToken, checkAdminOrPermission('inventory_management'), deleteInventoryItem);

module.exports = router;