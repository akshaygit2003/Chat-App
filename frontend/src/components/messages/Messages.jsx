import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import useListenMessages from "../../hooks/useListenMessages";
import useConversation from "../../zustand/useConversation";

const Messages = () => {
  const { messages, loading, loadingMore, hasMore, loadMoreMessages } =
    useGetMessages();
  useListenMessages();
  const { isTyping, selectedConversation } = useConversation();

  const containerRef = useRef();
  const lastMessageRef = useRef();
  const prevScrollHeightRef = useRef(0);
  const isPrependRef = useRef(false);

  // Auto-scroll to bottom on new message send/receive
  useEffect(() => {
    if (!isPrependRef.current) {
      setTimeout(() => {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      // Maintain scroll position after prepending older messages
      if (containerRef.current) {
        const heightDifference =
          containerRef.current.scrollHeight - prevScrollHeightRef.current;
        containerRef.current.scrollTop = heightDifference;
      }
      isPrependRef.current = false;
    }
  }, [messages]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight } = e.currentTarget;
    if (scrollTop <= 10 && hasMore && !loadingMore) {
      prevScrollHeightRef.current = scrollHeight;
      isPrependRef.current = true;
      loadMoreMessages();
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="px-4 flex-1 overflow-auto"
    >
      {/* Top loader when fetching older messages via infinite scroll */}
      {loadingMore && (
        <div className="flex justify-center py-2">
          <span className="loading loading-spinner loading-xs text-blue-400"></span>
        </div>
      )}

      {/* Initial load skeleton */}
      {loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}

      {/* Render messages */}
      {!loading &&
        messages.length > 0 &&
        messages.map((message) => (
          <div key={message._id} ref={lastMessageRef}>
            <Message message={message} />
          </div>
        ))}

      {/* Empty conversation placeholder */}
      {!loading && messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
          <p>Send a message to start the conversation!</p>
        </div>
      )}

      {/* Real-time typing bubble */}
      {isTyping && (
        <div className="chat chat-start my-1.5">
          <div className="chat-bubble bg-slate-800 text-gray-300 py-2 px-3 text-xs flex items-center gap-2 rounded-2xl border border-slate-700/60 shadow-sm">
            <span className="italic font-medium text-gray-400">
              {selectedConversation?.fullName || "User"} is typing
            </span>
            <span className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
