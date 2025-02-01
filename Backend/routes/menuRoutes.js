const express = require("express");
const router = express.Router();
const { createMenuItem, editMenuItem, deleteMenuItem, getMenuItem, getMenuItems } = require("../controllers/menuItemsController");
const { verifyToken, checkAdminOrPermission } = require("../middleware/authMiddleware");

router.route("/create/menu/item").post(verifyToken, checkAdminOrPermission("manage_menu"), createMenuItem); // Only logged-in users with permission can attempt creation
router.route("/edit/menu/item/:id").patch(verifyToken, checkAdminOrPermission("manage_menu"), editMenuItem); // Only logged-in users with permission can attempt editing
router.route("/delete/menu/item/:id").delete(verifyToken, checkAdminOrPermission("manage_menu"), deleteMenuItem); // Only logged-in users with permission can attempt deletion
router.route("/get/all/menu/items").get(verifyToken, getMenuItems);
router.route("/get/menu/item/:id").get(verifyToken, getMenuItem);
module.exports = router;
