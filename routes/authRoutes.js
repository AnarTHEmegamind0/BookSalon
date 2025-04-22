const express = require("express");
const router = express.Router();
const {
  register,
  verifyAccount,
  login,
  requestOTP,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  registerValidation,
  loginValidation,
  verifyAccountValidation,
  requestOTPValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
} = require("../controllers/authController");
const validate = require("../middleware/validateMiddleware");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerValidation, validate, register);
router.post("/verify", verifyAccountValidation, validate, verifyAccount);
router.post("/login", loginValidation, validate, login);
router.post("/request-otp", requestOTPValidation, validate, requestOTP);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validate,
  forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  validate,
  resetPassword
);

// Protected routes
router.get("/me", protect, getCurrentUser);
router.put(
  "/update-profile",
  protect,
  updateProfileValidation,
  validate,
  updateProfile
);

module.exports = router;
