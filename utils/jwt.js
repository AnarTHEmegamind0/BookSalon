const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Set token expiration
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d", // Set refresh token expiration
  });
};

// Replace TODO with:
const emailSent = await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);
if (!emailSent) {
  return res.status(500).json({
    success: false,
    error: "Failed to send OTP",
  });
}

// Ensure sensitive data is excluded in responses
res.status(200).json({
  success: true,
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

module.exports = {
  generateToken,
  generateRefreshToken,
};
