import Message from "../models/Message.js";
import Report from "../models/Report.js";
import User from "../models/User.js";

export const getConversationMessages = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { otherUserId } = req.params;
    const { listingId } = req.query;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: "Other user ID is required",
      });
    }

    if (currentUserId === otherUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself",
      });
    }

    const filter = {
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId },
      ],
    };

    if (listingId) {
      filter.listingId = listingId;
    }

    const messages = await Message.find(filter)
      .sort({ timestamp: 1 })
      .populate("senderId", "name photoUrl")
      .populate("receiverId", "name photoUrl");

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("❌ Error fetching conversation messages:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { otherUserId } = req.params;
    const { content, listingId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: "Listing ID is required for chat messages",
      });
    }

    if (currentUserId === otherUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself",
      });
    }

    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (otherUser.blockedUsers?.some((id) => id.toString() === currentUserId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot send messages to this user because they blocked you",
      });
    }

    const currentUser = await User.findById(currentUserId);
    if (currentUser.blockedUsers?.some((id) => id.toString() === otherUserId)) {
      return res.status(403).json({
        success: false,
        message: "You have blocked this user",
      });
    }

    const message = await Message.create({
      senderId: currentUserId,
      receiverId: otherUserId,
      listingId,
      content: content.trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name photoUrl")
      .populate("receiverId", "name photoUrl");

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

export const reportUser = async (req, res) => {
  try {
    const reporterId = req.userId;
    const { reportedUserId } = req.params;
    const { reason } = req.body;

    if (!reportedUserId) {
      return res.status(400).json({
        success: false,
        message: "Reported user ID is required",
      });
    }

    if (reporterId === reportedUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot report yourself",
      });
    }

    const existingReport = await Report.findOne({ reporterId, reportedUserId });
    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: "You have already reported this user",
      });
    }

    const report = await Report.create({
      reporterId,
      reportedUserId,
      reason: reason || "",
    });

    res.status(201).json({
      success: true,
      message: "User reported successfully",
      report,
    });
  } catch (error) {
    console.error("❌ Error reporting user:", error);
    res.status(500).json({
      success: false,
      message: "Error reporting user",
      error: error.message,
    });
  }
};

export const blockUser = async (req, res) => {
  try {
    const currentUserId = req.userId;
    const { targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Target user ID is required",
      });
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself",
      });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (currentUser.blockedUsers?.some((id) => id.toString() === targetUserId)) {
      return res.status(409).json({
        success: false,
        message: "User is already blocked",
      });
    }

    currentUser.blockedUsers.push(targetUserId);
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
    });
  } catch (error) {
    console.error("❌ Error blocking user:", error);
    res.status(500).json({
      success: false,
      message: "Error blocking user",
      error: error.message,
    });
  }
};
