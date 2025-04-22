const { body } = require("express-validator");
const User = require("../models/User");
const { hashPassword, verifyPassword } = require("../utils/hashPassword");
const { generateToken, generateRefreshToken } = require("../utils/jwt");
const {
  generateOTP,
  setOTPExpiration,
  isOTPExpired,
} = require("../utils/otpGenerator");
const sendEmail = require("../utils/emailSender");

// Register a new user
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = setOTPExpiration();

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || "client",
      otp,
      otpExpires,
    });

    const emailSent = await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: "Failed to send email",
      });
    }

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please verify your account with the OTP sent to your email/phone",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify user account with OTP
const verifyAccount = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: "User is already verified",
      });
    }

    // Check if OTP is valid
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP",
      });
    }

    // Check if OTP is expired
    if (isOTPExpired(user.otpExpires)) {
      return res.status(400).json({
        success: false,
        error: "OTP has expired",
      });
    }

    // Update user
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if password is correct
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP
      const otp = generateOTP();
      const otpExpires = setOTPExpiration();

      // Update user
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      try {
        const emailSent = await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);
        if (!emailSent) {
          return res.status(500).json({
            success: false,
            error: "Failed to send email",
          });
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: "An unexpected error occurred",
        });
      }

      return res.status(401).json({
        success: false,
        error: "Account not verified",
        message:
          "Please verify your account with the OTP sent to your email/phone",
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Request new OTP
const requestOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not found",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = setOTPExpiration();

    // Update user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    try {
      const emailSent = await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);
      if (!emailSent) {
        return res.status(500).json({
          success: false,
          error: "Failed to send email",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "An unexpected error occurred",
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not found",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = setOTPExpiration();

    // Update user
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    try {
      const emailSent = await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);
      if (!emailSent) {
        return res.status(500).json({
          success: false,
          error: "Failed to send email",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "An unexpected error occurred",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not found",
      });
    }

    // Check if OTP is valid
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP",
      });
    }

    // Check if OTP is expired
    if (isOTPExpired(user.otpExpires)) {
      return res.status(400).json({
        success: false,
        error: "OTP has expired",
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -otp -otpExpires"
    );

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;

    // Find user by id
    const user = await User.findById(req.user.id);

    // Update user fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;

    // Save user
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profileImage: user.profileImage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("phone").notEmpty().withMessage("Phone number is required"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const verifyAccountValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("otp").notEmpty().withMessage("OTP is required"),
];

const requestOTPValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
];

const resetPasswordValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("otp").notEmpty().withMessage("OTP is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const updateProfileValidation = [
  body("name").optional().isString().withMessage("Name must be a string"),
  body("phone").optional().isString().withMessage("Phone must be a string"),
  body("profileImage").optional().isURL().withMessage("Invalid profile image URL"),
];

module.exports = {
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
};
