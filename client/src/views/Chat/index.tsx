import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/SocketContext";
import { RootState } from "../../redux/store";
import {
    useGetConversationsQuery,
    useGetMessagesQuery,
} from "../../redux/api/chatApiSlice";
import {
    setConversations,
    setMessages,
    addMessage,
    updateConversation,
    setTyping,
    clearTyping,
    setUserOnline,
    setUserOffline,
    setActiveConversation,
} from "../../redux/chatSlice";
import ConversationList from "./ConversationList";
import MessageArea from "./MessageArea";
import Navbar from "../../components/Navbar";
import "./styles.css";

const Chat: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { socket, isConnected } = useSocket();
    const { activeConversationId } = useSelector((state: RootState) => state.chat);
    const [showSidebar, setShowSidebar] = useState(true);

    // Fetch conversations
    const { data: conversationsData, refetch: refetchConversations } =
        useGetConversationsQuery(undefined, {
            skip: !isConnected,
        });

    // Fetch messages for active conversation
    const { data: messagesData, refetch: refetchMessages } = useGetMessagesQuery(
        { conversationId: activeConversationId || "", page: 1, limit: 50 },
        {
            skip: !activeConversationId,
        }
    );

    // Load conversations into Redux
    useEffect(() => {
        if (conversationsData?.data) {
            dispatch(setConversations(conversationsData.data));
        }
    }, [conversationsData, dispatch]);

    // Load messages into Redux
    useEffect(() => {
        if (messagesData?.data?.messages && activeConversationId) {
            dispatch(
                setMessages({
                    conversationId: activeConversationId,
                    messages: messagesData.data.messages,
                })
            );
        }
    }, [messagesData, activeConversationId, dispatch]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        // New message received
        socket.on("new-message", (data: any) => {
            dispatch(addMessage(data.message));

            if (data.conversation) {
                dispatch(
                    updateConversation({
                        id: data.conversation.id,
                        lastMessage: data.conversation.lastMessage,
                        lastMessageTime: data.conversation.lastMessageTime,
                        unreadCount: data.conversation.unreadCount,
                    })
                );
            }

            // Refetch conversations to update list
            refetchConversations();
        });

        // User typing
        socket.on("user-typing", (data: any) => {
            dispatch(
                setTyping({
                    conversationId: data.conversationId,
                    userName: data.userName,
                })
            );
        });

        // User stopped typing
        socket.on("user-stop-typing", (data: any) => {
            dispatch(clearTyping(data.conversationId));
        });

        // User online
        socket.on("user-online", (data: any) => {
            dispatch(setUserOnline(data.userId));
        });

        // User offline
        socket.on("user-offline", (data: any) => {
            dispatch(setUserOffline(data.userId));
        });

        // Messages marked as read
        socket.on("messages-read", (data: any) => {
            refetchConversations();
        });

        return () => {
            socket.off("new-message");
            socket.off("user-typing");
            socket.off("user-stop-typing");
            socket.off("user-online");
            socket.off("user-offline");
            socket.off("messages-read");
        };
    }, [socket, dispatch, refetchConversations]);

    const handleSelectConversation = (conversationId: string) => {
        dispatch(setActiveConversation(conversationId));
        setShowSidebar(false);

        // Join conversation room
        if (socket) {
            socket.emit("join-conversation", { conversationId });
        }
    };

    const handleBackToList = () => {
        setShowSidebar(true);
        dispatch(setActiveConversation(null));
    };

    return (
        <Navbar>
            <div style={{ padding: "0 20px" }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "#4a5568",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "10px",
                        fontFamily: "'Poppins', sans-serif"
                    }}
                >
                    ← Go Back
                </button>
            </div>
            <div className="chat-container">
                <div className={`chat-sidebar ${showSidebar ? "mobile-visible" : ""}`}>
                    <ConversationList onSelectConversation={handleSelectConversation} />
                </div>

                <div className="chat-main">
                    {activeConversationId ? (
                        <MessageArea
                            conversationId={activeConversationId}
                            onBack={handleBackToList}
                        />
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">💬</div>
                            <h3>Select a conversation</h3>
                            <p>Choose a conversation from the list to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </Navbar>
    );
};

export default Chat;
