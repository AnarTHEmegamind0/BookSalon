const nodemailer = require("nodemailer");
const { emailService, emailUser, emailPass } = require("../config/env");

// Create transporter
const transporter = nodemailer.createTransport({
  service: emailService,
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "Your Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Account</h2>
          <p>Your verification code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; background: #f4f4f4; padding: 10px; text-align: center;">${otp}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Your password reset code is:</p>
          <h1 style="font-size: 32px; letter-spacing: 5px; background: #f4f4f4; padding: 10px; text-align: center;">${otp}</h1>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
};
