import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useSocket } from "../../contexts/SocketContext";
import { RootState } from "../../redux/store";
import { useMarkMessagesAsReadMutation } from "../../redux/api/chatApiSlice";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface MessageAreaProps {
    conversationId: string;
    onBack: () => void;
}

const MessageArea: React.FC<MessageAreaProps> = ({
    conversationId,
    onBack,
}) => {
    const { socket } = useSocket();
    const [messageText, setMessageText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { messages, conversations, typingUsers, onlineUsers } = useSelector(
        (state: RootState) => state.chat
    );
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const currentUserId = currentUser?.data?.user?._id;
    const isCurrentUserDoctor = currentUser?.data?.user?.isDoctor;
    const [markAsRead] = useMarkMessagesAsReadMutation();

    const conversation = conversations.find((c) => c._id === conversationId);
    const conversationMessages = messages[conversationId] || [];
    const typingUser = typingUsers[conversationId];

    // Get other participant info
    const getOtherParticipant = () => {
        if (!conversation) return null;
        if (isCurrentUserDoctor) {
            return {
                name: conversation.participantDetails.user.name,
                id: conversation.participantDetails.user.id,
            };
        } else {
            return {
                name: `${conversation.participantDetails.doctor.prefix} ${conversation.participantDetails.doctor.name}`,
                id: conversation.participantDetails.doctor.id,
                specialization: conversation.participantDetails.doctor.specialization,
            };
        }
    };

    const otherParticipant = getOtherParticipant();
    const isOnline = otherParticipant && onlineUsers.has(otherParticipant.id);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversationMessages, typingUser]);

    // Mark messages as read when conversation is opened
    useEffect(() => {
        if (conversationId) {
            markAsRead(conversationId);
            if (socket) {
                socket.emit("mark-read", { conversationId });
            }
        }
    }, [conversationId, socket, markAsRead]);

    const handleSendMessage = () => {
        if (!messageText.trim() || !socket) return;

        socket.emit("send-message", {
            conversationId,
            content: messageText.trim(),
        });

        setMessageText("");
        handleStopTyping();
    };

    const handleTyping = () => {
        if (!socket || !conversationId) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit("typing", { conversationId });
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set new timeout to stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            handleStopTyping();
        }, 2000);
    };

    const handleStopTyping = () => {
        if (socket && isTyping) {
            socket.emit("stop-typing", { conversationId });
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            <div className="message-area-header">
                <div className="message-area-header-info">
                    <button className="back-button" onClick={onBack}>
                        ← Back
                    </button>
                    <div>
                        <h3 style={{ textTransform: 'capitalize' }}>{otherParticipant?.name || "Unknown"}</h3>
                        <p>
                            {isOnline ? (
                                <span style={{ color: "#10b981" }}>● Online</span>
                            ) : (
                                <span style={{ opacity: 0.7 }}>Offline</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="messages-container">
                {conversationMessages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💬</div>
                        <h3>No messages yet</h3>
                        <p>Start the conversation by sending a message</p>
                    </div>
                ) : (
                    <>
                        {conversationMessages.map((message) => {
                            const isMyMessage = message.senderId === currentUserId;
                            const myName = isCurrentUserDoctor
                                ? `${currentUser?.data?.user?.name}`
                                : currentUser?.data?.user?.name;

                            return (
                                <MessageBubble
                                    key={message._id}
                                    message={message}
                                    isSent={isMyMessage}
                                    senderName={isMyMessage ? myName : otherParticipant?.name}
                                />
                            );
                        })}
                        {typingUser && <TypingIndicator userName={typingUser} />}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className="message-input-container">
                <div className="message-input-wrapper">
                    <textarea
                        className="message-input"
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => {
                            setMessageText(e.target.value);
                            handleTyping();
                        }}
                        onKeyPress={handleKeyPress}
                        rows={1}
                    />
                    <button
                        className="send-button"
                        onClick={handleSendMessage}
                        disabled={!messageText.trim()}
                    >
                        Send 📤
                    </button>
                </div>
            </div>
        </>
    );
};

export default MessageArea;
