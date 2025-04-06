const express = require("express");
const router = express.Router();
const {
    createReservation,
    updateReservation,
    cancelReservation,
    getReservationById,
    getAllReservations,
    getReservationsByCustomerName,
} = require("../controllers/reservationController");
const { verifyToken, checkAdminOrPermission } = require("../middleware/authMiddleware");

// Public routes (authenticated staff users)
router.route("/reservations")
    .post(verifyToken, checkAdminOrPermission("manage_reservations"), createReservation); // Create reservation

router.route("/reservations/customer")
    .get(verifyToken, checkAdminOrPermission("manage_reservations"), getReservationsByCustomerName); // Get reservations by customer name

    router.route("/reservations/all")
    .get(verifyToken, checkAdminOrPermission("manage_reservations"), getAllReservations); // Get all reservations

router.route("/reservations/:reservationId")
    .get(verifyToken, checkAdminOrPermission("manage_reservations"), getReservationById) // Get single reservation
    .patch(verifyToken, checkAdminOrPermission("manage_reservations"), updateReservation) // Update reservation
    .delete(verifyToken, checkAdminOrPermission("manage_reservations"), cancelReservation); // Cancel reservation


module.exports = router;