const express = require("express"); 
const router = express.Router();
const { createMenuItem, editMenuItem, deleteMenuItem ,getAllMenuItems, getMenuItem,getMenuItems } = require("../controllers/menuItemsController");
const { verifyToken } = require("../middleware/authMiddleware");

router.route("/create/menu/item").post(verifyToken, createMenuItem); // Only logged-in users with permission can attempt creation
router.route("/edit/menu/item/:id").patch(verifyToken, editMenuItem); // Only logged-in users with permission can attempt editing
router.route("/delete/menu/item/:id").delete(verifyToken, deleteMenuItem); // Only logged-in users with permission can attempt deletion
router.route("/get/all/menu/items").get(verifyToken, getMenuItems);
router.route("/get/menu/item/:id").get(verifyToken, getMenuItem); 
module.exports = router;
