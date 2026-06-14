import { create } from 'zustand';
import { Message } from '../types';

interface ChatState {
  isOpen: boolean;
  messages: Message[];
  isStreaming: boolean;
  toggleChat: () => void;
  addMessage: (msg: Message) => void;
  appendChunk: (chunk: string) => void;
  setStreaming: (v: boolean) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  messages: [],
  isStreaming: false,
  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  appendChunk: (chunk) =>
    set((state) => {
      if (state.messages.length === 0) return state;
      const updated = [...state.messages];
      const lastIndex = updated.length - 1;
      updated[lastIndex] = {
        ...updated[lastIndex],
        content: updated[lastIndex].content + chunk,
      };
      return { messages: updated };
    }),
  setStreaming: (v) => set({ isStreaming: v }),
  clearMessages: () => set({ messages: [] }),
  setMessages: (messages) => set({ messages }),
}));
