import express from "express";
import {
  getMessages,
  markMessagesAsRead,
  sendMessage,
  votePoll,
} from "../controllers/messagecontroller.js";
import protectRoute from "../middleware/protectRoute.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post(
  "/send/:id",
  protectRoute,
  upload.any(),
  (req, res, next) => {
    // Standardize single file if uploaded via upload.any()
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  },
  sendMessage
);
router.put("/read/:id", protectRoute, markMessagesAsRead);
router.put("/poll-vote/:id", protectRoute, votePoll);

export default router;
