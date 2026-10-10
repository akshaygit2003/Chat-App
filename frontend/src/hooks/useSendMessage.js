import { useState } from "react";
import useConversation from "../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import { API_BASE_URL, getAuthHeaders } from "../utils/api";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, updateMessage, selectedConversation } =
    useConversation();
  const { authUser } = useAuthContext();

  const sendMessage = async ({
    messageText = "",
    imageFile = null,
    audioBlob = null,
    audioDuration = 0,
    location = null,
    poll = null,
  }) => {
    if (
      !messageText?.trim() &&
      !imageFile &&
      !audioBlob &&
      !location &&
      !poll
    ) {
      return;
    }

    const tempId = `temp_${Date.now()}`;
    const imagePreview = imageFile ? URL.createObjectURL(imageFile) : "";
    const audioPreview = audioBlob ? URL.createObjectURL(audioBlob) : "";

    let messageType = "text";
    if (audioBlob) messageType = "voice";
    else if (imageFile) messageType = "image";
    else if (location) messageType = "location";
    else if (poll) messageType = "poll";

    // Optimistic message append
    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedConversation._id,
      messageType,
      message: messageText || "",
      image: imagePreview,
      audio: audioPreview,
      audioDuration,
      location: location || undefined,
      poll: poll
        ? {
            question: poll.question,
            options: poll.options.map((opt, idx) => ({
              _id: `opt_${idx}`,
              text: opt,
              votes: [],
            })),
          }
        : undefined,
      status: "sending",
      createdAt: new Date().toISOString(),
    };

    setMessages([...messages, optimisticMessage]);
    setLoading(true);

    try {
      let res;
      // If binary files are present (Image or Voice recording)
      if (imageFile || audioBlob) {
        const formData = new FormData();
        if (messageText) formData.append("message", messageText.trim());

        if (imageFile) {
          formData.append("file", imageFile);
        } else if (audioBlob) {
          formData.append(
            "file",
            audioBlob,
            `voice-note-${Date.now()}.webm`
          );
          formData.append("audioDuration", audioDuration);
        }

        res = await fetch(
          `${API_BASE_URL}/api/messages/send/${selectedConversation._id}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              ...getAuthHeaders(),
            },
            body: formData,
          }
        );
      } else {
        // JSON payload for text, location, or poll
        const payload = {
          message: messageText,
          location,
          poll,
        };

        res = await fetch(
          `${API_BASE_URL}/api/messages/send/${selectedConversation._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Replace optimistic placeholder with confirmed server payload
      updateMessage(tempId, data);
    } catch (error) {
      // Rollback optimistic message on failure
      setMessages((prevMessages) =>
        Array.isArray(prevMessages)
          ? prevMessages.filter((m) => m._id !== tempId)
          : []
      );
      toast.error(error.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
};

export default useSendMessage;
