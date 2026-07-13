import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.get("/", (req, res) => {
  res.send("Skill Exchange Board API is running...");
});

// Feature routes (signup, listings, matches, messages) will be added here
// by the team as those tasks are picked up, e.g.:
// app.use("/api/users", userRoutes);
// app.use("/api/listings", listingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});