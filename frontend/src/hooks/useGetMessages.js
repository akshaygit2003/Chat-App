import { useEffect, useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../utils/api";
import { useSocketContext } from "../context/SocketContext";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { socket } = useSocketContext();
  const {
    messages,
    setMessages,
    prependMessages,
    selectedConversation,
    nextCursor,
    setNextCursor,
    hasMore,
    setHasMore,
  } = useConversation();

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/messages/${selectedConversation._id}?paginated=true&limit=30`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        if (Array.isArray(data)) {
          setMessages(data);
          setHasMore(false);
          setNextCursor(null);
        } else {
          setMessages(data.messages || []);
          setNextCursor(data.nextCursor || null);
          setHasMore(Boolean(data.hasMore));
        }

        // Notify server that messages from this conversation have been read
        socket?.emit("markMessagesAsRead", { senderId: selectedConversation._id });
        fetch(`${API_BASE_URL}/api/messages/read/${selectedConversation._id}`, {
          method: "PUT",
          credentials: "include",
        }).catch(() => {});
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (selectedConversation?._id) getMessages();
  }, [selectedConversation?._id, setMessages, setNextCursor, setHasMore, socket]);

  const loadMoreMessages = async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/messages/${selectedConversation._id}?cursor=${nextCursor}&paginated=true&limit=30`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (!Array.isArray(data)) {
        prependMessages(data.messages || []);
        setNextCursor(data.nextCursor || null);
        setHasMore(Boolean(data.hasMore));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoadingMore(false);
    }
  };

  return { messages, loading, loadingMore, hasMore, loadMoreMessages };
};

export default useGetMessages;
