import express from "express";
import {
  getListings,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
  searchListings,
  getNearbyListings,
} from "../controllers/listing.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"; // 👈 Changed to default import

const router = express.Router();

// Public routes
router.get("/", getListings);
router.get("/search", searchListings);
router.get("/nearby", getNearbyListings);

// Protected routes (using authMiddleware instead of protect)
router.get("/mine", authMiddleware, getMyListings);
router.post("/", authMiddleware, createListing);
router.put("/:id", authMiddleware, updateListing);
router.delete("/:id", authMiddleware, deleteListing);

export default router;
