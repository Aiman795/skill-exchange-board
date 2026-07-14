import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Listing from "./models/Listing.js";
import User from "./models/User.js";

dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

const sampleListings = [
  // OFFERS - Lahore
  {
    type: "offer",
    title: "React.js Mentorship - Beginner to Advanced",
    category: "Programming",
    description:
      "I have 5 years of React experience. Can teach from basics to advanced concepts.",
    availability: "Weekends, 2-5 PM",
    radiusKm: 10,
    locationName: "Gulberg",
    city: "Lahore",
    country: "Pakistan",
    status: "active",
  },
  {
    type: "offer",
    title: "English Language Tutoring",
    category: "Language",
    description:
      "Native English speaker offering conversation practice and grammar help.",
    availability: "Mon-Wed, 6-8 PM",
    radiusKm: 8,
    locationName: "DHA Phase 6",
    city: "Lahore",
    country: "Pakistan",
    status: "active",
  },
  {
    type: "offer",
    title: "Graphic Design Services",
    category: "Graphics",
    description:
      "Professional graphic designer offering logo design and branding materials.",
    availability: "Weekdays, 9 AM - 5 PM",
    radiusKm: 15,
    locationName: "Johar Town",
    city: "Lahore",
    country: "Pakistan",
    status: "active",
  },
  // OFFERS - Karachi
  {
    type: "offer",
    title: "Fitness Training & Nutrition Advice",
    category: "Fitness",
    description:
      "Certified personal trainer offering workout plans and nutrition guidance.",
    availability: "Mon-Fri, 7-9 AM",
    radiusKm: 12,
    locationName: "Clifton",
    city: "Karachi",
    country: "Pakistan",
    status: "active",
  },
  {
    type: "offer",
    title: "Business Strategy Consulting",
    category: "Business",
    description:
      "MBA graduate offering business strategy and marketing planning.",
    availability: "Weekends, 9 AM - 1 PM",
    radiusKm: 20,
    locationName: "DHA Karachi",
    city: "Karachi",
    country: "Pakistan",
    status: "active",
  },
  // OFFERS - Islamabad
  {
    type: "offer",
    title: "Web Development Bootcamp",
    category: "Programming",
    description:
      "Full-stack web development training including React and Node.js.",
    availability: "Weekends, 10 AM - 3 PM",
    radiusKm: 10,
    locationName: "G-11",
    city: "Islamabad",
    country: "Pakistan",
    status: "active",
  },
  {
    type: "offer",
    title: "Spanish Conversation Practice",
    category: "Language",
    description:
      "Fluent Spanish speaker offering conversation practice for all levels.",
    availability: "Mon-Wed, 5-7 PM",
    radiusKm: 6,
    locationName: "F-10",
    city: "Islamabad",
    country: "Pakistan",
    status: "active",
  },
  // REQUESTS - Lahore
  {
    type: "request",
    title: "Looking for React Native Developer Mentor",
    category: "Programming",
    description: "Need help learning React Native for mobile app development.",
    availability: "Weekends, anytime",
    radiusKm: 15,
    locationName: "Gulberg",
    city: "Lahore",
    country: "Pakistan",
    status: "active",
  },
  {
    type: "request",
    title: "Need Arabic Language Tutor",
    category: "Language",
    description: "Looking for a native Arabic speaker to help me learn Arabic.",
    availability: "Evenings, after 6 PM",
    radiusKm: 10,
    locationName: "DHA Phase 5",
    city: "Lahore",
    country: "Pakistan",
    status: "active",
  },
  // REQUESTS - Karachi
  {
    type: "request",
    title: "Guitar Teacher Wanted",
    category: "Music",
    description:
      "Beginner guitarist looking for lessons. Can trade English lessons.",
    availability: "Weekends, 2-4 PM",
    radiusKm: 8,
    locationName: "Clifton",
    city: "Karachi",
    country: "Pakistan",
    status: "active",
  },
  // REQUESTS - Islamabad
  {
    type: "request",
    title: "Need UI/UX Design Feedback",
    category: "Graphics",
    description:
      "Working on a mobile app design and need feedback from experienced UI/UX designer.",
    availability: "Anytime, flexible",
    radiusKm: 10,
    locationName: "F-7",
    city: "Islamabad",
    country: "Pakistan",
    status: "active",
  },
  {
    type: "request",
    title: "Python Programming Tutor",
    category: "Programming",
    description: "Beginner in Python looking for a tutor for data science.",
    availability: "Evenings, 7-9 PM",
    radiusKm: 8,
    locationName: "F-11",
    city: "Islamabad",
    country: "Pakistan",
    status: "active",
  },
];

const seedDatabase = async () => {
  try {
    // Find or create test user
    let user = await User.findOne({ email: "test@example.com" });

    if (!user) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      user = await User.create({
        name: "Test User",
        email: "test@example.com",
        passwordHash: hashedPassword,
        city: "Lahore",
      });
      console.log("✅ Created test user with ID:", user._id);
    } else {
      console.log("✅ Found existing test user with ID:", user._id);
    }

    // Add userId to all listings
    const listingsWithUser = sampleListings.map((listing) => ({
      ...listing,
      userId: user._id,
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
    }));

    // Delete existing listings
    const deleted = await Listing.deleteMany({});
    console.log(`🗑️  Removed ${deleted.deletedCount} existing listings`);

    // Insert new listings
    const result = await Listing.insertMany(listingsWithUser);
    console.log(`✅ Seeded ${result.length} listings successfully!`);

    // Show summary
    const offers = result.filter((l) => l.type === "offer");
    const requests = result.filter((l) => l.type === "request");
    console.log(
      `📊 Summary: ${offers.length} offers, ${requests.length} requests`
    );

    const categories = [...new Set(result.map((l) => l.category))];
    console.log(`📂 Categories: ${categories.join(", ")}`);

    const cities = [...new Set(result.map((l) => l.city))];
    console.log(`📍 Cities: ${cities.join(", ")}`);

    console.log("\n📝 Sample listing:");
    console.log(`  Title: ${result[0].title}`);
    console.log(`  Type: ${result[0].type}`);
    console.log(`  Category: ${result[0].category}`);
    console.log(`  City: ${result[0].city}`);
    console.log(`  Location: ${result[0].locationName}`);
  } catch (error) {
    console.error("❌ Seed error:", error);
    if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
};

seedDatabase();
