const express = require("express");
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All booking routes are protected
router.use(protect);

// Client can create bookings and see their own bookings
router.post("/", createBooking);

// Admin can see all bookings
router.get("/", authorize("admin"), getAllBookings);

// Get, update, delete specific booking
router.get("/:id", getBookingById);
router.put("/:id", updateBooking);
router.delete("/:id", deleteBooking);

module.exports = router;
