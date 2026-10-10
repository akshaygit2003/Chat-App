import Conversation from "../models/conversation.js";
import Message from "../models/messages.js";
import { getReceiverSocketIds, io } from "../socket/socket.js";
import AppError from "../utils/AppError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { message, audioDuration, location, poll } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = "";
    let audioUrl = "";
    let messageType = "text";
    let lastMessageText = "";

    // Parse potential JSON strings if sent via multipart form
    let parsedLocation = null;
    if (location) {
      parsedLocation =
        typeof location === "string" ? JSON.parse(location) : location;
    }

    let parsedPoll = null;
    if (poll) {
      parsedPoll = typeof poll === "string" ? JSON.parse(poll) : poll;
    }

    // Handle File Attachment (Audio or Image)
    if (req.file) {
      const mime = req.file.mimetype;
      if (mime.startsWith("audio/") || mime.includes("webm")) {
        audioUrl = await uploadToCloudinary(
          req.file.buffer,
          mime,
          "chat-app-voice",
          "auto"
        );
        messageType = "voice";
        lastMessageText = "🎤 Voice message";
      } else {
        imageUrl = await uploadToCloudinary(
          req.file.buffer,
          mime,
          "chat-app-messages",
          "image"
        );
        messageType = "image";
        lastMessageText = "📷 Photo";
      }
    } else if (parsedLocation) {
      messageType = "location";
      lastMessageText = "📍 Location shared";
    } else if (parsedPoll) {
      messageType = "poll";
      lastMessageText = `📊 Poll: ${parsedPoll.question || "Poll"}`;
    }

    const trimmedMessage = message ? message.trim() : "";
    if (
      !trimmedMessage &&
      !imageUrl &&
      !audioUrl &&
      !parsedLocation &&
      !parsedPoll
    ) {
      return next(
        new AppError(
          "Please provide a text message, image, audio, location, or poll",
          400
        )
      );
    }

    if (!lastMessageText) {
      lastMessageText = trimmedMessage || "New message";
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Determine initial status based on receiver online presence
    const receiverSocketIds = getReceiverSocketIds(receiverId);
    const initialStatus = receiverSocketIds.length > 0 ? "delivered" : "sent";

    // Format poll options with empty vote arrays if poll is present
    let pollPayload = undefined;
    if (parsedPoll && parsedPoll.question && parsedPoll.options) {
      pollPayload = {
        question: parsedPoll.question.trim(),
        options: parsedPoll.options
          .filter((opt) => opt && opt.trim() !== "")
          .map((opt) => ({
            text: opt.trim(),
            votes: [],
          })),
      };
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      messageType,
      message: trimmedMessage,
      image: imageUrl,
      audio: audioUrl,
      audioDuration: Number(audioDuration) || 0,
      location: parsedLocation || undefined,
      poll: pollPayload,
      status: initialStatus,
    });

    // Update conversation lastMessage snippet
    conversation.lastMessage = {
      text: lastMessageText,
      senderId,
      createdAt: newMessage.createdAt || new Date(),
    };
    conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save(), newMessage.save()]);

    // Broadcast in real-time to all connected devices/tabs of the receiver
    receiverSocketIds.forEach((sId) => {
      io.to(sId).emit("newMessage", newMessage);
    });

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;
    const { cursor, paginated } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    });

    if (!conversation) {
      if (paginated === "true" || cursor) {
        return res
          .status(200)
          .json({ messages: [], nextCursor: null, hasMore: false });
      }
      return res.status(200).json([]);
    }

    const filter = {
      $or: [
        { conversationId: conversation._id },
        {
          conversationId: { $exists: false },
          senderId: { $in: [senderId, userToChatId] },
          receiverId: { $in: [senderId, userToChatId] },
        },
      ],
    };

    if (cursor) {
      filter._id = { $lt: cursor };
    }

    const rawMessages = await Message.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1);

    const hasMore = rawMessages.length > limit;
    const resultMessages = hasMore ? rawMessages.slice(0, limit) : rawMessages;
    const nextCursor = hasMore
      ? resultMessages[resultMessages.length - 1]._id
      : null;

    const chronologicalMessages = [...resultMessages].reverse();

    if (paginated === "true" || cursor) {
      return res.status(200).json({
        messages: chronologicalMessages,
        nextCursor,
        hasMore,
      });
    }

    res.status(200).json(chronologicalMessages);
  } catch (error) {
    next(error);
  }
};

export const markMessagesAsRead = async (req, res, next) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany(
      {
        senderId,
        receiverId,
        status: { $ne: "read" },
      },
      { $set: { status: "read" } }
    );

    const senderSocketIds = getReceiverSocketIds(senderId);
    senderSocketIds.forEach((sId) => {
      io.to(sId).emit("messagesRead", { readerId: receiverId });
    });

    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    next(error);
  }
};

export const votePoll = async (req, res, next) => {
  try {
    const { id: messageId } = req.params;
    const { optionId } = req.body;
    const userId = req.user._id;

    const messageDoc = await Message.findById(messageId);
    if (!messageDoc || messageDoc.messageType !== "poll" || !messageDoc.poll) {
      return next(new AppError("Poll not found", 404));
    }

    const option = messageDoc.poll.options.id(optionId);
    if (!option) {
      return next(new AppError("Poll option not found", 404));
    }

    // Toggle vote
    const userIndex = option.votes.findIndex(
      (vId) => vId.toString() === userId.toString()
    );

    if (userIndex > -1) {
      option.votes.splice(userIndex, 1);
    } else {
      option.votes.push(userId);
    }

    await messageDoc.save();

    // Broadcast updated poll event in real time to both participants
    const participantIds = [messageDoc.senderId, messageDoc.receiverId];
    participantIds.forEach((pId) => {
      const socketIds = getReceiverSocketIds(pId);
      socketIds.forEach((sId) => {
        io.to(sId).emit("pollUpdated", {
          messageId: messageDoc._id,
          poll: messageDoc.poll,
        });
      });
    });

    res.status(200).json(messageDoc);
  } catch (error) {
    next(error);
  }
};
