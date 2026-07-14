import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["offer", "request"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    availability: {
      type: String,
      required: true,
      trim: true,
    },
    radiusKm: {
      type: Number,
      default: 5,
      min: 1,
      max: 100,
    },
    // Location fields
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    locationName: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "Pakistan",
    },
    status: {
      type: String,
      enum: ["active", "matched", "closed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
listingSchema.index({ location: "2dsphere" });

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
