import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../redux/store";
import { useGetOrCreateConversationMutation } from "../../redux/api/chatApiSlice";
import { useGetApprovedDoctorsQuery } from "../../redux/api/doctorSlice";
import { setActiveConversation } from "../../redux/chatSlice";
import { Button, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemText, ListItemAvatar, Avatar, IconButton } from "@mui/material";
import { IoAdd, IoClose } from "react-icons/io5";

interface ConversationListProps {
    onSelectConversation: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
    onSelectConversation,
}) => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const { conversations, activeConversationId, onlineUsers } = useSelector(
        (state: RootState) => state.chat
    );
    const currentUser = useSelector((state: RootState) => state.auth.user);
    const currentUserId = currentUser?.data?.user?._id;
    const isDoctor = currentUser?.data?.user?.isDoctor;

    // Fetch approved doctors for new chat
    const { data: doctorsData } = useGetApprovedDoctorsQuery({}, { skip: isDoctor });
    const [getOrCreateConversation, { isLoading: creatingChat }] = useGetOrCreateConversationMutation();

    const filteredConversations = conversations.filter((conv) => {
        const otherParticipant =
            isDoctor
                ? conv.participantDetails.user.name
                : conv.participantDetails.doctor.name;
        return otherParticipant.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getOtherParticipant = (conversation: any) => {
        if (isDoctor) {
            return {
                name: conversation.participantDetails.user.name,
                id: conversation.participantDetails.user.id,
                initials: conversation.participantDetails.user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase(),
            };
        } else {
            return {
                name: `${conversation.participantDetails.doctor.prefix} ${conversation.participantDetails.doctor.name}`,
                id: conversation.participantDetails.doctor.id,
                initials: conversation.participantDetails.doctor.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase(),
                specialization: conversation.participantDetails.doctor.specialization,
            };
        }
    };

    const isUserOnline = (userId: string) => {
        return onlineUsers.has(userId);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const handleStartNewChat = async (doctorId: string) => {
        try {
            const result: any = await getOrCreateConversation({ doctorId });

            if (result?.data?.data?._id) {
                setShowNewChatModal(false);
                onSelectConversation(result.data.data._id);
            }
        } catch (error) {
            console.error("Error starting chat:", error);
        }
    };

    return (
        <>
            <div className="conversation-list-header">
                <h2>Messages</h2>
                {!isDoctor && (
                    <IconButton
                        onClick={() => setShowNewChatModal(true)}
                        sx={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "#fff",
                            width: "36px",
                            height: "36px",
                            "&:hover": {
                                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                            },
                        }}
                    >
                        <IoAdd size={20} />
                    </IconButton>
                )}
            </div>

            <div className="conversation-search">
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="conversations-list">
                {filteredConversations.length === 0 ? (
                    <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center" }}>
                        <p style={{ marginBottom: "16px" }}>No conversations yet</p>
                        {!isDoctor && (
                            <Button
                                variant="contained"
                                onClick={() => setShowNewChatModal(true)}
                                sx={{
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "#fff",
                                    textTransform: "none",
                                    fontFamily: "'Poppins', sans-serif",
                                    fontWeight: "600",
                                    padding: "10px 24px",
                                    borderRadius: "10px",
                                    "&:hover": {
                                        background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                                    },
                                }}
                                startIcon={<IoAdd />}
                            >
                                Start New Chat
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredConversations.map((conversation) => {
                        const participant = getOtherParticipant(conversation);
                        const unreadCount =
                            conversation.unreadCount[currentUserId || ""] || 0;
                        const isActive = conversation._id === activeConversationId;

                        return (
                            <div
                                key={conversation._id}
                                className={`conversation-item ${isActive ? "active" : ""}`}
                                onClick={() => onSelectConversation(conversation._id)}
                            >
                                <div className="conversation-avatar">
                                    {participant.initials}
                                    {isUserOnline(participant.id) && (
                                        <div className="online-indicator"></div>
                                    )}
                                </div>

                                <div className="conversation-info">
                                    <div className="conversation-name" style={{ textTransform: 'capitalize' }}>
                                        {participant.name}
                                    </div>
                                    <div className="conversation-last-message">
                                        {conversation.lastMessage || "No messages yet"}
                                    </div>
                                </div>

                                <div className="conversation-meta">
                                    {conversation.lastMessageTime && (
                                        <div className="conversation-time">
                                            {formatTime(conversation.lastMessageTime)}
                                        </div>
                                    )}
                                    {unreadCount > 0 && (
                                        <div className="unread-badge">{unreadCount}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* New Chat Modal */}
            <Dialog
                open={showNewChatModal}
                onClose={() => setShowNewChatModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "600",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    Select a Doctor to Chat
                    <IconButton
                        onClick={() => setShowNewChatModal(false)}
                        sx={{ color: "#fff" }}
                    >
                        <IoClose />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ padding: 0 }}>
                    <List>
                        {doctorsData?.data?.map((doctor: any) => (
                            <ListItem key={doctor.userId} disablePadding>
                                <ListItemButton
                                    onClick={() => handleStartNewChat(doctor.userId)}
                                    disabled={creatingChat}
                                    sx={{
                                        padding: "16px 24px",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
                                        },
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{
                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            fontFamily: "'Poppins', sans-serif",
                                            fontWeight: "600",
                                        }}>
                                            {doctor.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={`${doctor.prefix} ${doctor.fullName}`}
                                        secondary={doctor.specialization}
                                        primaryTypographyProps={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontWeight: "600",
                                        }}
                                        secondaryTypographyProps={{
                                            fontFamily: "'Poppins', sans-serif",
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ConversationList;
