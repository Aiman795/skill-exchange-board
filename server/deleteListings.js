import mongoose from "mongoose";
import dotenv from "dotenv";
import Listing from "./models/Listing.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const deleteAllListings = async () => {
  try {
    // Count before deletion
    const countBefore = await Listing.countDocuments();
    console.log(`📊 Found ${countBefore} listings before deletion`);

    // Delete all listings
    const result = await Listing.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} listings`);

    // Count after deletion
    const countAfter = await Listing.countDocuments();
    console.log(`📊 Remaining listings: ${countAfter}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

deleteAllListings();
