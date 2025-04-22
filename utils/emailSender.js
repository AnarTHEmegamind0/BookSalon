const sendEmail = async (email, subject, message) => {
  try {
    // Implement your email sending logic here
    // Example: Use nodemailer or any email service
    return true; // Return true if email sent successfully
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};

module.exports = sendEmail;