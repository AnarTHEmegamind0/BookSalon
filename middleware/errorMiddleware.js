// Error middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = new Error(message);
    error.statusCode = 400;
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    error = new Error("Invalid token");
    error.statusCode = 401;
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    error = new Error("Token expired");
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.message || "Server Error",
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;
