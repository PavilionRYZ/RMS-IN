const express = require('express');
const router = express.Router();
const { createUser, loginUser, logoutUser, updateUser, getAllUsers, updateUserCredentials } = require('../controllers/userController');
const { verifyAdmin, verifyToken } = require('../middleware/authMiddleware');


router.route("/createUser/new").post(verifyAdmin, createUser);
router.route("/updateUser/:userId").patch(verifyAdmin, updateUser);
router.route("/getAllUsers").get(verifyAdmin, getAllUsers);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/updateUserCredentials").patch(verifyToken, updateUserCredentials);

module.exports = router;