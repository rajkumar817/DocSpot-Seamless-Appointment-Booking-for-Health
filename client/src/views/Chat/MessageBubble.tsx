import React from "react";

// Message bubble component for chat
interface Message {
    _id: string;
    content: string;
    createdAt: string;
}

// Component to display sender name and message content
interface MessageBubbleProps {
    message: any;
    isSent: boolean;
    senderName?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSent, senderName }) => {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className={`message-bubble ${isSent ? "sent" : "received"}`}>
            {senderName && (
                <div className="message-sender-name" style={{ textTransform: 'capitalize' }}>
                    {senderName}
                </div>
            )}
            <div className="message-content">{message.content}</div>
            <div className="message-time">{formatTime(message.createdAt)}</div>
        </div>
    );
};

export default MessageBubble;
