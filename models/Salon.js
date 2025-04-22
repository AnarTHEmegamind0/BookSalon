const mongoose = require("mongoose");

const salonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Salon name is required"],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Salon must have an owner"],
  },
  location: {
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  services: [
    {
      name: {
        type: String,
        required: [true, "Service name is required"],
      },
      description: {
        type: String,
      },
      price: {
        type: Number,
        required: [true, "Service price is required"],
      },
      duration: {
        type: Number,
        required: [true, "Service duration is required"],
      }, // in minutes
      image: {
        type: String,
      },
    },
  ],
  operatingHours: [
    {
      day: {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
      open: {
        type: String,
      }, // Format: "09:00"
      close: {
        type: String,
      }, // Format: "18:00"
    },
  ],
  images: [
    {
      type: String,
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to calculate and update salon rating
salonSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    return;
  }

  const totalRating = this.reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  this.rating = totalRating / this.reviews.length;
};

// Update the updatedAt timestamp before saving
salonSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Salon", salonSchema);
