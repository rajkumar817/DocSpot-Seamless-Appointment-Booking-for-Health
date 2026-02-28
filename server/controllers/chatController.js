const catchAsync = require("../utils/catchAsync");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Doctor = require("../models/doctorModel");
const AppError = require("../utils/appError");

// Get all conversations for a user
exports.getConversations = catchAsync(async (req, res, next) => {
    const userId = req.user._id.toString();

    const conversations = await Conversation.find({
        participants: userId,
    })
        .sort({ lastMessageTime: -1 })
        .limit(50);

    res.status(200).json({
        status: "success",
        message: "Conversations fetched successfully",
        data: conversations,
    });
});

// Get or create a conversation between user and doctor
exports.getOrCreateConversation = catchAsync(async (req, res, next) => {
    const { doctorId } = req.body;
    const userId = req.user._id.toString();

    if (!doctorId) {
        return next(new AppError("Doctor ID is required", 400));
    }

    // Check if conversation already exists
    let conversation = await Conversation.findByParticipants(userId, doctorId);

    if (!conversation) {
        // Fetch user and doctor details
        const user = await User.findById(userId);
        const doctor = await Doctor.findOne({ userId: doctorId });

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        if (!doctor) {
            return next(new AppError("Doctor not found", 404));
        }

        // Create new conversation
        conversation = await Conversation.create({
            participants: [userId, doctorId],
            participantDetails: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                },
                doctor: {
                    id: doctor.userId,
                    name: doctor.fullName,
                    email: doctor.email,
                    prefix: doctor.prefix,
                    specialization: doctor.specialization,
                },
            },
            unreadCount: {
                [userId]: 0,
                [doctorId]: 0,
            },
        });
    }

    res.status(200).json({
        status: "success",
        message: "Conversation retrieved successfully",
        data: conversation,
    });
});

// Get messages for a conversation
exports.getMessages = catchAsync(async (req, res, next) => {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        return next(new AppError("Conversation not found", 404));
    }

    if (!conversation.isParticipant(userId)) {
        return next(
            new AppError("You are not authorized to view this conversation", 403)
        );
    }

    // Fetch messages
    const messages = await Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const totalMessages = await Message.countDocuments({ conversationId });

    res.status(200).json({
        status: "success",
        message: "Messages fetched successfully",
        data: {
            messages: messages.reverse(), // Reverse to show oldest first
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasMore: skip + messages.length < totalMessages,
            },
        },
    });
});

// Mark messages as read
exports.markMessagesAsRead = catchAsync(async (req, res, next) => {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    // Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        return next(new AppError("Conversation not found", 404));
    }

    if (!conversation.isParticipant(userId)) {
        return next(
            new AppError("You are not authorized to access this conversation", 403)
        );
    }

    // Mark all messages in this conversation as read by this user
    await Message.updateMany(
        {
            conversationId,
            senderId: { $ne: userId }, // Only mark messages not sent by this user
            readBy: { $ne: userId }, // Only mark messages not already read
        },
        {
            $addToSet: { readBy: userId },
        }
    );

    // Reset unread count for this user
    conversation.unreadCount.set(userId, 0);
    await conversation.save();

    res.status(200).json({
        status: "success",
        message: "Messages marked as read",
    });
});

// Delete a conversation (soft delete - just remove from user's view)
exports.deleteConversation = catchAsync(async (req, res, next) => {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
        return next(new AppError("Conversation not found", 404));
    }

    if (!conversation.isParticipant(userId)) {
        return next(
            new AppError("You are not authorized to delete this conversation", 403)
        );
    }

    // For now, we'll do a hard delete. You can implement soft delete if needed
    await Conversation.findByIdAndDelete(conversationId);
    await Message.deleteMany({ conversationId });

    res.status(204).json({
        status: "success",
        data: null,
    });
});
