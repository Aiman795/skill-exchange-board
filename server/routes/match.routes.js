import express from "express";
import {
  getMatches,
  getMatchesForListing,
} from "../controllers/match.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// All match routes require authentication
router.get("/my-matches", authMiddleware, getMatches);
router.get("/listing/:id", authMiddleware, getMatchesForListing);

export default router;
