import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  getConversationMessages,
  sendMessage,
  reportUser,
  blockUser,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/:otherUserId/messages", authMiddleware, getConversationMessages);
router.post("/:otherUserId/messages", authMiddleware, sendMessage);
router.post("/:reportedUserId/report", authMiddleware, reportUser);
router.post("/:targetUserId/block", authMiddleware, blockUser);

export default router;
