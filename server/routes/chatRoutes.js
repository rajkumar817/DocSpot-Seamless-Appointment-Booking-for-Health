const express = require("express");
const authController = require("../controllers/authController");
const chatController = require("../controllers/chatController");

const router = express.Router();

// All chat routes require authentication
router.use(authController.protect);

// Get all conversations for the logged-in user
router.get("/conversations", chatController.getConversations);

// Create or get a conversation with a doctor
router.post("/conversations", chatController.getOrCreateConversation);

// Get messages for a specific conversation
router.get("/conversations/:conversationId/messages", chatController.getMessages);

// Mark messages in a conversation as read
router.put("/conversations/:conversationId/read", chatController.markMessagesAsRead);

// Delete a conversation
router.delete("/conversations/:conversationId", chatController.deleteConversation);

module.exports = router;
