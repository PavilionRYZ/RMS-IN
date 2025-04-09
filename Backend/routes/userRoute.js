const express = require('express');
const router = express.Router();
const { createUser, loginUser, logoutUser, updateUser,deleteUser, getAllUsers, updateUserCredentials, forgotPassword, resetPassword, verifyOTP} = require('../controllers/userController');
const { verifyAdmin, verifyToken } = require('../middleware/authMiddleware');


router.route("/createUser/new").post(verifyAdmin, createUser);
router.route("/updateUser/:userId").patch(verifyAdmin, updateUser);
router.route("/getAllUsers").get(verifyAdmin, getAllUsers);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/updateUserCredentials").patch(verifyToken,verifyAdmin, updateUserCredentials);
router.route("/deleteUser/:id").delete(verifyAdmin, deleteUser);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword").post(resetPassword);
router.route("/verifyOTP").post(verifyOTP);
// router.route("/verify-token").post(verifyToken, verifyTokenController);

module.exports = router;