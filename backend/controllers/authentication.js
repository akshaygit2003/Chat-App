import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import generateTokenAndSetCookie from "../utils/generatejwtToken.js";
import AppError from "../utils/AppError.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signup = async (req, res, next) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    if (password !== confirmPassword) {
      return next(new AppError("Passwords don't match", 400));
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return next(new AppError("Username already exists", 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      fullName,
      username: username.toLowerCase(),
      password: hashedPassword,
      gender: gender || "other",
      profilePic: "",
    });

    const token = generateTokenAndSetCookie(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      profilePic: newUser.profilePic,
      bio: newUser.bio,
      gender: newUser.gender,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username.toLowerCase() });
    const isPasswordCorrect = user && (await bcrypt.compare(password, user.password || ""));

    if (!user || !isPasswordCorrect) {
      return next(new AppError("Invalid username or password", 400));
    }

    const token = generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      gender: user.gender,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return next(new AppError("Google credential token is missing", 400));
    }

    let payload;
    if (process.env.GOOGLE_CLIENT_ID) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      // Decode JWT payload for smooth local development when Client ID isn't yet in .env
      const base64Url = credential.split(".")[1];
      payload = JSON.parse(Buffer.from(base64Url, "base64").toString("utf-8"));
    }

    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }],
    });

    if (user) {
      if (!user.googleId) user.googleId = googleId;
      if (!user.profilePic && picture) user.profilePic = picture;
      await user.save();
    } else {
      // Generate clean unique username
      const rawHandle = (email ? email.split("@")[0] : (name || "user")).toLowerCase().replace(/[^a-z0-9_]/g, "");
      let username = rawHandle || "user";
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${rawHandle}${counter++}`;
      }

      user = await User.create({
        fullName: name || "User",
        username,
        email: email.toLowerCase(),
        googleId,
        profilePic: picture || "",
        gender: "other",
      });
    }

    const token = generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      gender: user.gender,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res, next) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
