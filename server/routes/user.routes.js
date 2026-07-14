import express from "express";
import {
  getProfile,
  updateProfile,
  getUserProfile,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import upload from "../config/multer.js";

const router = express.Router();

// ============================================
// IMPORTANT: Specific routes MUST come BEFORE dynamic routes
// ============================================

// 1️⃣ Get own profile (protected)
router.get("/profile", authMiddleware, getProfile);

// 2️⃣ Update own profile (protected)
router.put("/profile", authMiddleware, upload.single("photo"), updateProfile);

// 3️⃣ View ANY user's profile by ID (public - no auth required)
//    This MUST come AFTER specific routes
router.get("/:userId", getUserProfile);

export default router;
