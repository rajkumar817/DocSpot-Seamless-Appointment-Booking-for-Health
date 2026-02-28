const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },
        senderId: {
            type: String,
            required: true,
        },
        senderType: {
            type: String,
            enum: ["user", "doctor"],
            required: true,
        },
        senderName: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: [true, "Message content is required"],
            trim: true,
        },
        readBy: {
            type: [String],
            default: [],
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

// Method to mark message as read by a user
messageSchema.methods.markAsRead = function (userId) {
    if (!this.readBy.includes(userId)) {
        this.readBy.push(userId);
    }
    // If both participants have read it, mark as read
    if (this.readBy.length >= 2) {
        this.isRead = true;
    }
    return this.save();
};

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
