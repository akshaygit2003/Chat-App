import express from "express";
import { googleAuth, login, logout, signup } from "../controllers/authentication.js";
import { validate } from "../middleware/validate.js";
import {
  googleAuthSchema,
  loginSchema,
  signupSchema,
} from "../validations/validationSchemas.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/google", validate(googleAuthSchema), googleAuth);
router.post("/logout", logout);

export default router;
