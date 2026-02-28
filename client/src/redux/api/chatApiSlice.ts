import { apiSlice } from "./apiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: () => "/chat/conversations",
            providesTags: ["Conversations"],
        }),

        getOrCreateConversation: builder.mutation({
            query: ({ doctorId }) => ({
                url: "/chat/conversations",
                method: "POST",
                body: { doctorId },
            }),
            invalidatesTags: ["Conversations"],
        }),

        getMessages: builder.query({
            query: ({ conversationId, page = 1, limit = 50 }) =>
                `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
            providesTags: ["Messages"],
        }),

        markMessagesAsRead: builder.mutation({
            query: (conversationId) => ({
                url: `/chat/conversations/${conversationId}/read`,
                method: "PUT",
            }),
            invalidatesTags: ["Conversations", "Messages"],
        }),

        deleteConversation: builder.mutation({
            query: (conversationId) => ({
                url: `/chat/conversations/${conversationId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Conversations"],
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useGetOrCreateConversationMutation,
    useGetMessagesQuery,
    useMarkMessagesAsReadMutation,
    useDeleteConversationMutation,
} = chatApiSlice;
