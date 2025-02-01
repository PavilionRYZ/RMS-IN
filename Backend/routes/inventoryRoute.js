const express = require('express');
const router = express.Router();
const { addInventoryItem, updateInventoryItem, getAllInventoryItems, getInventoryItemById, deleteInventoryItem } = require('../controllers/inventoryController');
const { verifyToken, checkAdminOrPermission } = require('../middleware/authMiddleware');

router.route('/inventory').post(verifyToken, checkAdminOrPermission('inventory_management'), addInventoryItem); // Only admins and administrators
router.route('/inventory/:id').patch(verifyToken, checkAdminOrPermission('inventory_management'), updateInventoryItem); // Only admins and administrators
router.route('/inventory/items').get(verifyToken, checkAdminOrPermission('inventory_management'), getAllInventoryItems); // Only admins and administrators
router.route('/inventory/item/:id').get(verifyToken, checkAdminOrPermission('inventory_management'), getInventoryItemById); // Only admins and administrators
router.route('/inventory/item/:id').delete(verifyToken, checkAdminOrPermission('inventory_management'), deleteInventoryItem); // Only admins and administrators
module.exports = router;