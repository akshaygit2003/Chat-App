import { useState } from "react";
import useConversation from "../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../utils/api";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { authUser } = useAuthContext();

  const sendMessage = async (messageText, imageFile = null) => {
    if (!messageText?.trim() && !imageFile) return;

    const tempId = `temp_${Date.now()}`;
    const previewUrl = imageFile ? URL.createObjectURL(imageFile) : "";

    // Optimistic message append
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedConversation._id,
      message: messageText || "",
      image: previewUrl,
      status: "sending",
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, optimisticMessage]);
    setLoading(true);

    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        if (messageText) formData.append("message", messageText.trim());
        formData.append("image", imageFile);

        res = await fetch(
          `${API_BASE_URL}/api/messages/send/${selectedConversation._id}`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );
      } else {
        res = await fetch(
          `${API_BASE_URL}/api/messages/send/${selectedConversation._id}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ message: messageText }),
          }
        );
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Replace optimistic placeholder with confirmed server message
      setMessages((prevMessages) =>
        prevMessages.map((m) => (m._id === tempId ? data : m))
      );
    } catch (error) {
      // Rollback optimistic message on failure
      setMessages((prevMessages) =>
        prevMessages.filter((m) => m._id !== tempId)
      );
      toast.error(error.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};

export default useSendMessage;
