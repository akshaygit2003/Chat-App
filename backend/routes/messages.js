import express from "express";
import {
  getMessages,
  markMessagesAsRead,
  sendMessage,
} from "../controllers/messagecontroller.js";
import protectRoute from "../middleware/protectRoute.js";
import upload from "../middleware/multer.js";
import { validate } from "../middleware/validate.js";
import {
  getMessagesSchema,
  sendMessageSchema,
} from "../validations/validationSchemas.js";

const router = express.Router();

router.get("/:id", protectRoute, validate(getMessagesSchema), getMessages);
router.post(
  "/send/:id",
  protectRoute,
  upload.single("image"),
  validate(sendMessageSchema),
  sendMessage
);
router.put("/read/:id", protectRoute, markMessagesAsRead);

export default router;
