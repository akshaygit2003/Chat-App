import User from "../models/user.js";
import AppError from "../utils/AppError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const getUsersForSidebar = async (req, res, next) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, bio, gender } = req.body;
    const userId = req.user._id;

    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName.trim();
    if (bio !== undefined) updateFields.bio = bio.trim();
    if (gender !== undefined) updateFields.gender = gender;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return next(new AppError("Please select an image file to upload", 400));
    }

    const secureUrl = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      "chat-app-avatars"
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profilePic: secureUrl } },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
