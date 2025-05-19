const Reservation = require("../models/reservation");
const errorHandler = require("../utils/errorHandler");
const mongoose = require("mongoose");

// Create a Reservation
exports.createReservation = async (req, res, next) => {
  try {
    const { customerName, tableNumber, reservationDate, partySize, specialRequests } = req.body;

    if (!customerName || !tableNumber || !reservationDate || !partySize) {
      return next(new errorHandler(400, "All required fields must be provided"));
    }

    // Check for existing reservation for the same table and time
    const existingReservation = await Reservation.findOne({
      tableNumber,
      reservationDate: {
        $gte: new Date(reservationDate).setMinutes(0),
        $lte: new Date(reservationDate).setMinutes(59),
      },
      status: { $nin: ["canceled", "completed"] },
    });
    if (existingReservation) {
      return next(new errorHandler(400, "This table is already reserved for the specified time"));
    }

    const reservation = new Reservation({
      customerName,
      tableNumber,
      reservationDate: new Date(reservationDate),
      partySize,
      specialRequests,
      createdBy: req.user._id,
    });

    await reservation.save();

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("createdBy", "name role");

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      reservation: populatedReservation,
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    next(new errorHandler(500, "Failed to create reservation"));
  }
};

// Update a Reservation (Admin or creator only)
exports.updateReservation = async (req, res, next) => {
  try {
    const { reservationId } = req.params;
    const { customerName, tableNumber, reservationDate, partySize, status, specialRequests } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return next(new errorHandler(404, "Reservation not found"));
    }

    if (req.user.role !== "admin" && reservation.createdBy.toString() !== req.user._id.toString()) {
      return next(new errorHandler(403, "Unauthorized to update this reservation"));
    }

    if (tableNumber && reservationDate) {
      const conflict = await Reservation.findOne({
        _id: { $ne: reservationId },
        tableNumber,
        reservationDate: {
          $gte: new Date(reservationDate).setMinutes(0),
          $lte: new Date(reservationDate).setMinutes(59),
        },
        status: { $nin: ["canceled", "completed"] },
      });
      if (conflict) {
        return next(new errorHandler(400, "This table is already reserved for the specified time"));
      }
    }

    reservation.customerName = customerName || reservation.customerName;
    reservation.tableNumber = tableNumber || reservation.tableNumber;
    reservation.reservationDate = reservationDate ? new Date(reservationDate) : reservation.reservationDate;
    reservation.partySize = partySize || reservation.partySize;
    reservation.status = status || reservation.status;
    reservation.specialRequests = specialRequests !== undefined ? specialRequests : reservation.specialRequests;
    reservation.updatedBy = req.user._id;

    await reservation.save();

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("createdBy", "name role")
      .populate("updatedBy", "name role");

    res.status(200).json({
      success: true,
      message: "Reservation updated successfully",
      reservation: populatedReservation,
    });
  } catch (error) {
    console.error("Error updating reservation:", error.message, error.stack);
    next(new errorHandler(500, "Failed to update reservation"));
  }
};

// Cancel a Reservation (Admin or creator only)
exports.cancelReservation = async (req, res, next) => {
  try {
    const { reservationId } = req.params;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return next(new errorHandler(404, "Reservation not found"));
    }

    if (req.user.role !== "admin" && reservation.createdBy.toString() !== req.user._id.toString()) {
      return next(new errorHandler(403, "Unauthorized to cancel this reservation"));
    }

    reservation.status = "canceled";
    reservation.updatedBy = req.user._id;
    await reservation.save();

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("createdBy", "name role")
      .populate("updatedBy", "name role");

    res.status(200).json({
      success: true,
      message: "Reservation canceled successfully",
      reservation: populatedReservation,
    });
  } catch (error) {
    console.error("Error canceling reservation:", error.message, error.stack);
    next(new errorHandler(500, "Failed to cancel reservation"));
  }
};

// Get a Single Reservation by ID
exports.getReservationById = async (req, res, next) => {
  try {
    const { reservationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reservationId)) {
      return next(new errorHandler(400, "Invalid reservation ID"));
    }

    const reservation = await Reservation.findById(reservationId)
      .populate("createdBy", "name role")
      .populate("updatedBy", "name role");

    if (!reservation) {
      return next(new errorHandler(404, "Reservation not found"));
    }

    if (req.user.role !== "admin" && reservation.createdBy.toString() !== req.user._id.toString()) {
      return next(new errorHandler(403, "Unauthorized to view this reservation"));
    }

    res.status(200).json({
      success: true,
      reservation,
    });
  } catch (error) {
    console.error("Error fetching reservation:", error.message, error.stack);
    next(new errorHandler(500, "Failed to fetch reservation"));
  }
};

// Get All Reservations with Pagination
exports.getAllReservations = async (req, res, next) => {
  try {
    let { date, status, customerName, page = 1, limit = 10 } = req.query;

    // Parse page and limit as numbers
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const query = {};
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        return next(new errorHandler(400, "Invalid date format"));
      }
      const startOfDay = parsedDate.setHours(0, 0, 0, 0);
      const endOfDay = parsedDate.setHours(23, 59, 59, 999);
      query.reservationDate = { $gte: startOfDay, $lte: endOfDay };
    }
    if (status) query.status = status;
    if (customerName) query.customerName = { $regex: customerName, $options: "i" };

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch paginated reservations and total count
    const [reservations, total] = await Promise.all([
      Reservation.find(query)
        .populate("createdBy", "name role")
        .populate("updatedBy", "name role")
        .sort({ reservationDate: 1 })
        .skip(skip)
        .limit(limit),
      Reservation.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      reservations,
    });
  } catch (error) {
    console.error("Error fetching all reservations:", error.message, error.stack);
    next(new errorHandler(500, "Failed to fetch reservations"));
  }
};

// Get Reservations by Customer Name with Pagination
exports.getReservationsByCustomerName = async (req, res, next) => {
  try {
    const { customerName, status, page = 1, limit = 10 } = req.query;

    if (!customerName) {
      return next(new errorHandler(400, "Customer name is required"));
    }

    // Parse page and limit as numbers
    page = parseInt(page, 10) || 1;
    limit = parseInt(limit, 10) || 10;

    const query = { customerName: { $regex: customerName, $options: "i" } };
    if (status) query.status = status;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch paginated reservations and total count
    const [reservations, total] = await Promise.all([
      Reservation.find(query)
        .populate("createdBy", "name role")
        .populate("updatedBy", "name role")
        .sort({ reservationDate: -1 })
        .skip(skip)
        .limit(limit),
      Reservation.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      reservations,
    });
  } catch (error) {
    console.error("Error fetching reservations by customer name:", error.message, error.stack);
    next(new errorHandler(500, "Failed to fetch reservations"));
  }
};