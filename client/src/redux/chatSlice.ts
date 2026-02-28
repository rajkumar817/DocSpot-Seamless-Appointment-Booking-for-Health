import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    senderType: "user" | "doctor";
    senderName: string;
    content: string;
    readBy: string[];
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Conversation {
    _id: string;
    participants: string[];
    participantDetails: {
        user: {
            id: string;
            name: string;
            email: string;
        };
        doctor: {
            id: string;
            name: string;
            email: string;
            prefix: string;
            specialization: string;
        };
    };
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: Record<string, number>;
    createdAt: string;
    updatedAt: string;
}

interface ChatState {
    conversations: Conversation[];
    messages: Record<string, Message[]>; // conversationId -> messages
    activeConversationId: string | null;
    typingUsers: Record<string, string>; // conversationId -> userName
    onlineUsers: Set<string>;
}

const initialState: ChatState = {
    conversations: [],
    messages: {},
    activeConversationId: null,
    typingUsers: {},
    onlineUsers: new Set(),
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setConversations: (state, action: PayloadAction<Conversation[]>) => {
            state.conversations = action.payload;
        },

        addConversation: (state, action: PayloadAction<Conversation>) => {
            const exists = state.conversations.find((c) => c._id === action.payload._id);
            if (!exists) {
                state.conversations.unshift(action.payload);
            }
        },

        updateConversation: (state, action: PayloadAction<Partial<Conversation> & { id: string }>) => {
            const index = state.conversations.findIndex((c) => c._id === action.payload.id);
            if (index !== -1) {
                state.conversations[index] = {
                    ...state.conversations[index],
                    ...action.payload,
                };
                // Move to top
                const [conversation] = state.conversations.splice(index, 1);
                state.conversations.unshift(conversation);
            }
        },

        setMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
            state.messages[action.payload.conversationId] = action.payload.messages;
        },

        addMessage: (state, action: PayloadAction<Message>) => {
            const conversationId = action.payload.conversationId;
            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }

            // Check if message already exists
            const exists = state.messages[conversationId].find((m) => m._id === action.payload._id);
            if (!exists) {
                state.messages[conversationId].push(action.payload);
            }
        },

        setActiveConversation: (state, action: PayloadAction<string | null>) => {
            state.activeConversationId = action.payload;
        },

        setTyping: (state, action: PayloadAction<{ conversationId: string; userName: string }>) => {
            state.typingUsers[action.payload.conversationId] = action.payload.userName;
        },

        clearTyping: (state, action: PayloadAction<string>) => {
            delete state.typingUsers[action.payload];
        },

        setUserOnline: (state, action: PayloadAction<string>) => {
            state.onlineUsers.add(action.payload);
        },

        setUserOffline: (state, action: PayloadAction<string>) => {
            state.onlineUsers.delete(action.payload);
        },

        clearChat: (state) => {
            state.conversations = [];
            state.messages = {};
            state.activeConversationId = null;
            state.typingUsers = {};
            state.onlineUsers = new Set();
        },
    },
});

export const {
    setConversations,
    addConversation,
    updateConversation,
    setMessages,
    addMessage,
    setActiveConversation,
    setTyping,
    clearTyping,
    setUserOnline,
    setUserOffline,
    clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
