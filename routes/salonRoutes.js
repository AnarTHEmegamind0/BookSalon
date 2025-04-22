const express = require("express");
const router = express.Router();
const {
  getSalons,
  getSalonById,
  createSalon,
  updateSalon,
  deleteSalon,
} = require("../controllers/salonController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    addReview,
    updateReview,
    deleteReview,
    reviewValidation,
  } = require("../controllers/reviewController");
  

// Public routes
router.get("/", getSalons);
router.get("/:id", getSalonById);

// Protected routes - salon owner and admin only
router.post("/", protect, authorize("salon-owner"), createSalon);
router.put("/:id", protect, authorize("salon-owner", "admin"), updateSalon);
router.delete("/:id", protect, authorize("salon-owner", "admin"), deleteSalon);

// TODO: Add routes for salon reviews
// Add this to salonRoutes.js

// Add reviews routes
router.post("/:id/reviews", protect, reviewValidation, validate, addReview);
router.put("/:id/reviews", protect, reviewValidation, validate, updateReview);
router.delete("/:id/reviews", protect, deleteReview);

module.exports = router;
