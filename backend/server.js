import "dotenv/config";
import path from "path";
import fs from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";
import userRoutes from "./routes/users.js";

import connectToMongoDB from "./db/database.js";
import { app, server } from "./socket/socket.js";
import errorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/AppError.js";

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// Rate limiter for authentication endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
});
app.use("/api/auth", authLimiter);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or allow in dev/prod
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" })); // Parse JSON payloads
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Root endpoint for API health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

const frontendDistPath = path.join(__dirname, "frontend", "dist");

// Root endpoint if frontend dist doesn't exist
app.get("/", (req, res, next) => {
  if (!fs.existsSync(frontendDistPath)) {
    return res.send("Chat App Backend API is running successfully");
  }
  next();
});

// Serve frontend static files if build exists
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

// 404 for unhandled API routes
app.all("/api/*", (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Centralized Global Error Handler
app.use(errorHandler);

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server Running on port ${PORT}`);
});
