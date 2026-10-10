import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";
import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const {
    messages,
    setMessages,
    selectedConversation,
    setIsTyping,
    markAllRead,
    updatePoll,
  } = useConversation();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      if (
        selectedConversation &&
        (newMessage.senderId === selectedConversation._id ||
          newMessage.receiverId === selectedConversation._id)
      ) {
        newMessage.shouldShake = true;
        const sound = new Audio(notificationSound);
        sound.play().catch(() => {});
        setMessages([...messages, newMessage]);

        // If we received a message while in the chat, immediately mark as read
        if (newMessage.senderId === selectedConversation._id) {
          socket.emit("markMessagesAsRead", { senderId: selectedConversation._id });
        }
      }
    };

    const handleUserTyping = ({ senderId }) => {
      if (selectedConversation && senderId === selectedConversation._id) {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = ({ senderId }) => {
      if (selectedConversation && senderId === selectedConversation._id) {
        setIsTyping(false);
      }
    };

    const handleMessagesRead = ({ readerId }) => {
      if (selectedConversation && readerId === selectedConversation._id) {
        markAllRead();
      }
    };

    const handlePollUpdated = ({ messageId, poll }) => {
      updatePoll(messageId, poll);
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("pollUpdated", handlePollUpdated);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("pollUpdated", handlePollUpdated);
    };
  }, [
    socket,
    setMessages,
    messages,
    selectedConversation,
    setIsTyping,
    markAllRead,
    updatePoll,
  ]);
};

export default useListenMessages;
