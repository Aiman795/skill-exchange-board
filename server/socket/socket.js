import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";

const registerSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`⚡ Socket connected: ${socket.userId}`);

    socket.on("join_room", ({ roomId }) => {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`👥 User ${socket.userId} joined room ${roomId}`);
    });

    socket.on("send_message", async ({ roomId, receiverId, listingId, content }) => {
      if (!roomId || !receiverId || !listingId || !content?.trim()) {
        return;
      }

      try {
        const message = await Message.create({
          senderId: socket.userId,
          receiverId,
          listingId,
          content: content.trim(),
        });

        const populatedMessage = await Message.findById(message._id)
          .populate("senderId", "name photoUrl")
          .populate("receiverId", "name photoUrl");

        io.to(roomId).emit("receive_message", populatedMessage);
      } catch (error) {
        console.error("❌ Socket send_message error:", error);
        socket.emit("message_error", {
          message: "Failed to send message",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`⚡ Socket disconnected: ${socket.userId}`);
    });
  });

  return io;
};

export default registerSocket;
