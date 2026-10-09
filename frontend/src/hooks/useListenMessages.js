import { useEffect } from "react";

import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";

import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
  const { socket } = useSocketContext();
  const { messages, setMessages, selectedConversation } = useConversation();

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      // Only append if the message belongs to the active selected conversation
      if (selectedConversation && (newMessage.senderId === selectedConversation._id || newMessage.receiverId === selectedConversation._id)) {
        newMessage.shouldShake = true;
        const sound = new Audio(notificationSound);
        sound.play().catch(() => {});
        setMessages([...messages, newMessage]);
      }
    };

    socket?.on("newMessage", handleNewMessage);

    return () => socket?.off("newMessage", handleNewMessage);
  }, [socket, setMessages, messages, selectedConversation]);
};
export default useListenMessages;
