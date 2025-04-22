const crypto = require("crypto");

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Set OTP expiration (15 minutes from now)
const setOTPExpiration = () => {
  return new Date(Date.now() + 15 * 60 * 1000);
};

// Verify OTP expiration
const isOTPExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

module.exports = {
  generateOTP,
  setOTPExpiration,
  isOTPExpired,
};
