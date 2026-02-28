const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
    {
        participants: {
            type: [String],
            required: true,
        },
        participantDetails: {
            user: {
                type: Object,
                required: true,
            },
            doctor: {
                type: Object,
                required: true,
            },
        },
        lastMessage: {
            type: String,
            default: "",
        },
        lastMessageTime: {
            type: Date,
            default: Date.now,
        },
        unreadCount: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient querying
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 });

// Method to check if a user is a participant
conversationSchema.methods.isParticipant = function (userId) {
    return this.participants.includes(userId);
};

// Static method to find conversation between two users
conversationSchema.statics.findByParticipants = async function (
    userId,
    doctorId
) {
    return await this.findOne({
        participants: { $all: [userId, doctorId] },
    });
};

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
