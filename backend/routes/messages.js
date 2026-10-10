import express from "express";
import { getMessages, sendMessage } from "../controllers/messagecontroller.js";
import protectRoute from "../middleware/protectRoute.js";
import { validate } from "../middleware/validate.js";
import { getMessagesSchema, sendMessageSchema } from "../validations/validationSchemas.js";

const router = express.Router();

router.get("/:id", protectRoute, validate(getMessagesSchema), getMessages);
router.post("/send/:id", protectRoute, validate(sendMessageSchema), sendMessage);

export default router;
