const express = require("express");
const router = express.Router();
const {
    markAttendance,
    getAttendanceRecords,
    createSalaryRecord,
    markSalaryPaid,
    getSalaryRecords,
} = require("../controllers/staffManagementController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

// Admin-only routes
router.route("/attendance/mark")
    .post(verifyToken, verifyAdmin, markAttendance);

router.route("/attendance")
    .get(verifyToken, verifyAdmin, getAttendanceRecords);

router.route("/salary/create")
    .post(verifyToken, verifyAdmin, createSalaryRecord);

router.route("/salary/paid/:salaryRecordId")
    .patch(verifyToken, verifyAdmin, markSalaryPaid);

router.route("/salary")
    .get(verifyToken, verifyAdmin, getSalaryRecords);

module.exports = router;