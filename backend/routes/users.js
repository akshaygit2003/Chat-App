import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import upload from "../middleware/multer.js";
import { validate } from "../middleware/validate.js";
import { updateProfileSchema } from "../validations/validationSchemas.js";
import {
  getUsersForSidebar,
  updateAvatar,
  updateProfile,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);
router.put("/profile", protectRoute, validate(updateProfileSchema), updateProfile);
router.post("/profile/avatar", protectRoute, upload.single("avatar"), updateAvatar);

export default router;
