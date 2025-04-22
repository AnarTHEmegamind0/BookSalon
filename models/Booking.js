const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Booking must be associated with a user"],
  },
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Salon",
    required: [true, "Booking must be associated with a salon"],
  },
  service: {
    id: {
      type: String,
      required: [true, "Service ID is required"],
    },
    name: {
      type: String,
      required: [true, "Service name is required"],
    },
    price: {
      type: Number,
      required: [true, "Service price is required"],
    },
    duration: {
      type: Number,
      required: [true, "Service duration is required"],
    },
  },
  date: {
    type: Date,
    required: [true, "Booking date is required"],
  },
  startTime: {
    type: String,
    required: [true, "Start time is required"],
  }, // Format: "14:30"
  endTime: {
    type: String,
    required: [true, "End time is required"],
  }, // Format: "15:30"
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
bookingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
