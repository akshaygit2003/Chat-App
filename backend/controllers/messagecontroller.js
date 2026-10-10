import Conversation from "../models/conversation.js";
import Message from "../models/messages.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import AppError from "../utils/AppError.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!message || message.trim() === "") {
      return next(new AppError("Message content cannot be empty", 400));
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      senderId,
      receiverId,
      message,
    });

    // Update conversation last message snippet and maintain backwards compatibility
    conversation.lastMessage = {
      text: message,
      senderId,
      createdAt: newMessage.createdAt || new Date(),
    };
    conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save(), newMessage.save()]);

    // Realtime notification via Socket.io
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

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
        return res.status(200).json({ messages: [], nextCursor: null, hasMore: false });
      }
      return res.status(200).json([]);
    }

    // Query messages by conversationId, with fallback to participant matching for legacy records
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

    // Fetch limit + 1 to calculate hasMore
    const rawMessages = await Message.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1);

    const hasMore = rawMessages.length > limit;
    const resultMessages = hasMore ? rawMessages.slice(0, limit) : rawMessages;
    const nextCursor = hasMore ? resultMessages[resultMessages.length - 1]._id : null;

    // Chronological ordering for client display
    const chronologicalMessages = [...resultMessages].reverse();

    if (paginated === "true" || cursor) {
      return res.status(200).json({
        messages: chronologicalMessages,
        nextCursor,
        hasMore,
      });
    }

    // Default: returns array directly for complete backwards compatibility
    res.status(200).json(chronologicalMessages);
  } catch (error) {
    next(error);
  }
};
