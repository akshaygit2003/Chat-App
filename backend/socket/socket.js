import { Server } from "socket.io";
import http from "http";
import express from "express";
import jwt from "jsonwebtoken";
import Message from "../models/messages.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});

// Multi-device / multi-tab map: Map<userId, Set<socketId>>
const userSocketMap = new Map();

export const getReceiverSocketIds = (receiverId) => {
  if (!receiverId) return [];
  const sockets = userSocketMap.get(receiverId.toString());
  return sockets ? Array.from(sockets) : [];
};

// Backwards-compatible single ID getter (returns first socket ID if available)
export const getReceiverSocketId = (receiverId) => {
  const ids = getReceiverSocketIds(receiverId);
  return ids.length > 0 ? ids[0] : undefined;
};

// WebSocket Handshake Authentication Middleware
io.use((socket, next) => {
  try {
    let token = null;

    // 1. Check cookies in handshake headers
    const rawCookies = socket.handshake.headers.cookie;
    if (rawCookies) {
      const match = rawCookies
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith("jwt="));
      if (match) {
        token = match.split("=")[1];
      }
    }

    // 2. Check auth payload or query params
    if (!token && socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    }
    if (!token && socket.handshake.query?.token) {
      token = socket.handshake.query.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.userId) {
        socket.userId = decoded.userId.toString();
        return next();
      }
    }

    // Fallback: If client supplied userId in query (during client connection initialization)
    const queryUserId = socket.handshake.query.userId;
    if (queryUserId && queryUserId !== "undefined") {
      socket.userId = queryUserId.toString();
      return next();
    }

    // If unauthenticated, allow or reject based on query
    next();
  } catch (err) {
    // If token error, fall back to query userId if present
    const queryUserId = socket.handshake.query.userId;
    if (queryUserId && queryUserId !== "undefined") {
      socket.userId = queryUserId.toString();
      return next();
    }
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId || socket.handshake.query.userId;

  if (userId && userId !== "undefined") {
    const userStr = userId.toString();
    if (!userSocketMap.has(userStr)) {
      userSocketMap.set(userStr, new Set());
    }
    userSocketMap.get(userStr).add(socket.id);
  }

  // Broadcast online users
  io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));

  // Typing indicators
  socket.on("typing", ({ receiverId }) => {
    if (!receiverId || !userId) return;
    const receiverSockets = getReceiverSocketIds(receiverId);
    receiverSockets.forEach((sId) => {
      io.to(sId).emit("userTyping", { senderId: userId });
    });
  });

  socket.on("stopTyping", ({ receiverId }) => {
    if (!receiverId || !userId) return;
    const receiverSockets = getReceiverSocketIds(receiverId);
    receiverSockets.forEach((sId) => {
      io.to(sId).emit("userStoppedTyping", { senderId: userId });
    });
  });

  // Mark messages as read real-time event
  socket.on("markMessagesAsRead", async ({ senderId }) => {
    try {
      if (!senderId || !userId) return;

      // Update message status in MongoDB where current user is the receiver
      await Message.updateMany(
        {
          senderId,
          receiverId: userId,
          status: { $ne: "read" },
        },
        { $set: { status: "read" } }
      );

      // Notify the original sender across all their open tabs
      const senderSockets = getReceiverSocketIds(senderId);
      senderSockets.forEach((sId) => {
        io.to(sId).emit("messagesRead", { readerId: userId });
      });
    } catch (err) {
      console.error("Error in markMessagesAsRead socket handler:", err);
    }
  });

  // Disconnection handler
  socket.on("disconnect", () => {
    if (userId && userId !== "undefined") {
      const userStr = userId.toString();
      const userSockets = userSocketMap.get(userStr);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          userSocketMap.delete(userStr);
        }
      }
    }
    io.emit("getOnlineUsers", Array.from(userSocketMap.keys()));
  });
});

export { app, io, server };
