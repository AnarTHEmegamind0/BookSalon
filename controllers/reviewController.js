const Salon = require("../models/Salon");
const { body } = require("express-validator");

// Add a review to a salon
const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const salonId = req.params.id;

    // Find salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        error: "Salon not found",
      });
    }

    // Check if user has already reviewed this salon
    const alreadyReviewed = salon.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        error: "You have already reviewed this salon",
      });
    }

    // Add review
    salon.reviews.push({
      user: req.user._id,
      rating: Number(rating),
      comment,
    });

    // Update salon rating
    salon.updateRating();

    // Save salon
    await salon.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      data: {
        rating: salon.rating,
        reviews: salon.reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update a review
const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const salonId = req.params.id;

    // Find salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        error: "Salon not found",
      });
    }

    // Find review
    const review = salon.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Update review
    review.rating = Number(rating) || review.rating;
    review.comment = comment || review.comment;
    review.date = Date.now();

    // Update salon rating
    salon.updateRating();

    // Save salon
    await salon.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: {
        rating: salon.rating,
        reviews: salon.reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a review
const deleteReview = async (req, res, next) => {
  try {
    const salonId = req.params.id;

    // Find salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({
        success: false,
        error: "Salon not found",
      });
    }

    // Find review index
    const reviewIndex = salon.reviews.findIndex(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Review not found",
      });
    }

    // Remove review
    salon.reviews.splice(reviewIndex, 1);

    // Update salon rating
    salon.updateRating();

    // Save salon
    await salon.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: {
        rating: salon.rating,
        reviews: salon.reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const reviewValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment").notEmpty().withMessage("Comment is required"),
];

module.exports = {
  addReview,
  updateReview,
  deleteReview,
  reviewValidation,
};
