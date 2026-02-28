import React from "react";

// Typing indicator component for chat
interface TypingIndicatorProps {
    userName: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName }) => {
    return (
        <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
        </div>
    );
};

export default TypingIndicator;
