import mongoose from "mongoose";

const { Schema } = mongoose;

const listingSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    type: {
      type: String,
      enum: ["offer", "request"],
      required: [true, "Type is required (offer or request)"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    radiusKm: {
      type: Number,
      default: 5,
      min: [0, "Radius cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "matched", "closed"],
      default: "active",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.models.Listing || mongoose.model("Listing", listingSchema);
