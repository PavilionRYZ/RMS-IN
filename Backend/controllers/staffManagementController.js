const Attendance = require("../models/attendance");
const SalaryRecord = require("../models/salaryRecord");
const User = require("../models/user");
const errorHandler = require("../utils/errorHandler");

// Mark Attendance
exports.markAttendance = async (req, res, next) => {
    try {
        const { userId, status, checkIn, checkOut, notes } = req.body;

        if (!userId || !status) {
            return next(new errorHandler(400, "User ID and status are required"));
        }

        const user = await User.findById(userId);
        if (!user || user.role === "admin") {
            return next(new errorHandler(404, "Staff member not found"));
        }

        const attendance = new Attendance({
            user: userId,
            status,
            checkIn: checkIn ? new Date(checkIn) : undefined,
            checkOut: checkOut ? new Date(checkOut) : undefined,
            notes,
        });

        await attendance.save();
        const populatedAttendance = await Attendance.findById(attendance._id).populate("user", "name email role");
        res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            attendance: populatedAttendance,
        });
    } catch (error) {
        console.error("Error marking attendance:", error);
        next(new errorHandler(500, "Failed to mark attendance"));
    }
};

// Get Attendance Records
exports.getAttendanceRecords = async (req, res, next) => {
    try {
        const { userId, startDate, endDate } = req.query;

        const query = userId ? { user: userId } : {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            };
        }

        const attendanceRecords = await Attendance.find(query)
            .populate("user", "name email role")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: attendanceRecords.length,
            attendanceRecords,
        });
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        next(new errorHandler(500, "Failed to fetch attendance records"));
    }
};

// Create Salary Record
exports.createSalaryRecord = async (req, res, next) => {
    try {
        const { userId, month, adjustments, notes } = req.body;

        if (!userId || !month) {
            return next(new errorHandler(400, "User ID and month are required"));
        }

        const user = await User.findById(userId);
        if (!user || user.role === "admin") {
            return next(new errorHandler(404, "Staff member not found"));
        }

        const existingRecord = await SalaryRecord.findOne({ user: userId, month });
        if (existingRecord) {
            return next(new errorHandler(400, "Salary record for this month already exists"));
        }

        const totalAdjustments = adjustments
            ? adjustments.reduce((sum, adj) => sum + (adj.type === "deduction" ? -adj.amount : adj.amount), 0)
            : 0;

        const salaryRecord = new SalaryRecord({
            user: userId,
            month,
            baseSalary: user.salary,
            adjustments: adjustments || [],
            totalSalary: user.salary + totalAdjustments,
            notes,
        });

        await salaryRecord.save();
        const populatedSalaryRecord = await SalaryRecord.findById(salaryRecord._id).populate("user", "name email role");
        res.status(201).json({
            success: true,
            message: "Salary record created successfully",
            salaryRecord: populatedSalaryRecord,
        });
    } catch (error) {
        console.error("Error creating salary record:", error);
        next(new errorHandler(500, "Failed to create salary record"));
    }
};

// Mark Salary as Paid
exports.markSalaryPaid = async (req, res, next) => {
    try {
        const { salaryRecordId } = req.params;

        const salaryRecord = await SalaryRecord.findById(salaryRecordId);
        if (!salaryRecord) {
            return next(new errorHandler(404, "Salary record not found"));
        }

        salaryRecord.isPaid = true;
        salaryRecord.paymentDate = new Date();
        await salaryRecord.save();

        res.status(200).json({
            success: true,
            message: "Salary marked as paid",
            salaryRecord,
        });
    } catch (error) {
        console.error("Error marking salary as paid:", error);
        next(new errorHandler(500, "Failed to mark salary as paid"));
    }
};

// Get Salary Records
exports.getSalaryRecords = async (req, res, next) => {
    try {
        const { userId, month } = req.query;

        const query = userId ? { user: userId } : {};
        if (month) query.month = month;

        const salaryRecords = await SalaryRecord.find(query)
            .populate("user", "name email role")
            .sort({ month: -1 });

        res.status(200).json({
            success: true,
            count: salaryRecords.length,
            salaryRecords,
        });
    } catch (error) {
        console.error("Error fetching salary records:", error);
        next(new errorHandler(500, "Failed to fetch salary records"));
    }
};