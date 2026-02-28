const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const Doctor = require("./models/doctorModel");
const Conversation = require("./models/conversationModel");
const Message = require("./models/messageModel");

// Store online users: { userId: socketId }
const onlineUsers = new Map();

// Initialize socket handlers
const initializeSocketHandlers = (io) => {
    // Middleware for socket authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error("Authentication token required"));
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return next(new Error("User not found"));
            }

            // Attach user to socket
            socket.userId = user._id.toString();
            socket.userType = user.isDoctor ? "doctor" : "user";
            socket.userName = user.name;

            next();
        } catch (error) {
            next(new Error("Authentication failed"));
        }
    });

    // Handle socket connections
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.userId} (${socket.userType})`);

        // Add user to online users
        onlineUsers.set(socket.userId, socket.id);

        // Join user's personal room
        socket.join(socket.userId);

        // Broadcast online status to all conversations
        socket.broadcast.emit("user-online", {
            userId: socket.userId,
            userName: socket.userName,
        });

        // Handle joining a conversation
        socket.on("join-conversation", async (data) => {
            try {
                const { conversationId } = data;

                // Verify user is part of the conversation
                const conversation = await Conversation.findById(conversationId);
                if (conversation && conversation.isParticipant(socket.userId)) {
                    socket.join(conversationId);
                    console.log(`User ${socket.userId} joined conversation ${conversationId}`);
                }
            } catch (error) {
                console.error("Error joining conversation:", error);
                socket.emit("error", { message: "Failed to join conversation" });
            }
        });

        // Handle sending a message
        socket.on("send-message", async (data) => {
            try {
                const { conversationId, content } = data;

                // Verify conversation exists and user is a participant
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) {
                    return socket.emit("error", { message: "Conversation not found" });
                }

                if (!conversation.isParticipant(socket.userId)) {
                    return socket.emit("error", {
                        message: "You are not part of this conversation",
                    });
                }

                // Create and save the message
                const message = await Message.create({
                    conversationId,
                    senderId: socket.userId,
                    senderType: socket.userType,
                    senderName: socket.userName,
                    content: content.trim(),
                    readBy: [socket.userId], // Sender has read it
                });

                // Update conversation's last message
                conversation.lastMessage = content.trim();
                conversation.lastMessageTime = new Date();

                // Increment unread count for other participant
                const otherParticipant = conversation.participants.find(
                    (p) => p !== socket.userId
                );
                if (otherParticipant) {
                    const currentCount = conversation.unreadCount.get(otherParticipant) || 0;
                    conversation.unreadCount.set(otherParticipant, currentCount + 1);
                }

                await conversation.save();

                // Emit message to all users in the conversation
                io.to(conversationId).emit("new-message", {
                    message: message.toObject(),
                    conversation: {
                        id: conversation._id,
                        lastMessage: conversation.lastMessage,
                        lastMessageTime: conversation.lastMessageTime,
                        unreadCount: Object.fromEntries(conversation.unreadCount),
                    },
                });

                console.log(`Message sent in conversation ${conversationId}`);
            } catch (error) {
                console.error("Error sending message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        // Handle typing indicator
        socket.on("typing", (data) => {
            const { conversationId } = data;
            socket.to(conversationId).emit("user-typing", {
                userId: socket.userId,
                userName: socket.userName,
                conversationId,
            });
        });

        // Handle stop typing indicator
        socket.on("stop-typing", (data) => {
            const { conversationId } = data;
            socket.to(conversationId).emit("user-stop-typing", {
                userId: socket.userId,
                conversationId,
            });
        });

        // Handle marking messages as read
        socket.on("mark-read", async (data) => {
            try {
                const { conversationId } = data;

                // Update messages
                await Message.updateMany(
                    {
                        conversationId,
                        senderId: { $ne: socket.userId },
                        readBy: { $ne: socket.userId },
                    },
                    {
                        $addToSet: { readBy: socket.userId },
                    }
                );

                // Update conversation unread count
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    conversation.unreadCount.set(socket.userId, 0);
                    await conversation.save();

                    // Notify other participants
                    socket.to(conversationId).emit("messages-read", {
                        conversationId,
                        userId: socket.userId,
                    });
                }
            } catch (error) {
                console.error("Error marking messages as read:", error);
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.userId}`);

            // Remove from online users
            onlineUsers.delete(socket.userId);

            // Broadcast offline status
            socket.broadcast.emit("user-offline", {
                userId: socket.userId,
            });
        });
    });
};

module.exports = initializeSocketHandlers;
