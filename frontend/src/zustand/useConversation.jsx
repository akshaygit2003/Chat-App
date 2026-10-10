import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation, messages: [], nextCursor: null, hasMore: false, isTyping: false }),
  messages: [],
  setMessages: (messages) => set({ messages }),
  prependMessages: (olderMessages) =>
    set((state) => ({ messages: [...olderMessages, ...state.messages] })),
  nextCursor: null,
  setNextCursor: (nextCursor) => set({ nextCursor }),
  hasMore: false,
  setHasMore: (hasMore) => set({ hasMore }),
  isTyping: false,
  setIsTyping: (isTyping) => set({ isTyping }),
  markAllRead: () =>
    set((state) => ({
      messages: state.messages.map((m) => ({ ...m, status: "read" })),
    })),
  updateMessage: (tempId, realMessage) =>
    set((state) => ({
      messages: state.messages.map((m) => (m._id === tempId ? realMessage : m)),
    })),
}));

export default useConversation;
