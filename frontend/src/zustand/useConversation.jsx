import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({
      selectedConversation,
      messages: [],
      nextCursor: null,
      hasMore: false,
      isTyping: false,
    }),
  messages: [],
  setMessages: (messages) =>
    set((state) => ({
      messages:
        typeof messages === "function"
          ? messages(Array.isArray(state.messages) ? state.messages : [])
          : Array.isArray(messages)
          ? messages
          : [],
    })),
  prependMessages: (olderMessages) =>
    set((state) => ({
      messages: [
        ...(Array.isArray(olderMessages) ? olderMessages : []),
        ...(Array.isArray(state.messages) ? state.messages : []),
      ],
    })),
  nextCursor: null,
  setNextCursor: (nextCursor) => set({ nextCursor }),
  hasMore: false,
  setHasMore: (hasMore) => set({ hasMore }),
  isTyping: false,
  setIsTyping: (isTyping) => set({ isTyping }),
  markAllRead: () =>
    set((state) => ({
      messages: (Array.isArray(state.messages) ? state.messages : []).map(
        (m) => ({ ...m, status: "read" })
      ),
    })),
  updateMessage: (tempId, realMessage) =>
    set((state) => ({
      messages: (Array.isArray(state.messages) ? state.messages : []).map(
        (m) => (m._id === tempId ? realMessage : m)
      ),
    })),
  updatePoll: (messageId, updatedPoll) =>
    set((state) => ({
      messages: (Array.isArray(state.messages) ? state.messages : []).map(
        (m) => (m._id === messageId ? { ...m, poll: updatedPoll } : m)
      ),
    })),
}));

export default useConversation;
