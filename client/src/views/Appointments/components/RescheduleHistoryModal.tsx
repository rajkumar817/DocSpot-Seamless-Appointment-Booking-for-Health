import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
} from "@mui/material";
import { MdHistory, MdSchedule, MdArrowForward } from "react-icons/md";
import { formatDate, formatTime } from "../../../utils";

interface RescheduleHistoryModalProps {
    open: boolean;
    onClose: () => void;
    rescheduleHistory: Array<{
        previousDate: string;
        previousTime: string;
        newDate: string;
        newTime: string;
        rescheduledBy: string;
        rescheduledAt: string;
        reason: string;
    }>;
    currentDate: string;
    currentTime: string;
}

const RescheduleHistoryModal: React.FC<RescheduleHistoryModalProps> = ({
    open,
    onClose,
    rescheduleHistory,
    currentDate,
    currentTime,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle
                sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <MdHistory size={24} />
                Reschedule History
            </DialogTitle>
            <DialogContent sx={{ mt: 3, pb: 3 }}>
                {rescheduleHistory && rescheduleHistory.length > 0 ? (
                    <Box>
                        {rescheduleHistory.map((item, index) => (
                            <Box key={index} sx={{ mb: 3 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mb: 1,
                                    }}
                                >
                                    <MdSchedule size={20} color="#667eea" />
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(item.rescheduledAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}{" "}
                                        at{" "}
                                        {new Date(item.rescheduledAt).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: "8px",
                                        background: "#f5f7fa",
                                        border: "1px solid #e1e8ed",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <Box sx={{ flex: 1, minWidth: "200px" }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Previous
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "#f5576c",
                                                }}
                                            >
                                                {formatDate(item.previousDate)} {formatTime(item.previousTime)}
                                            </Typography>
                                        </Box>
                                        <MdArrowForward size={24} color="#667eea" />
                                        <Box sx={{ flex: 1, minWidth: "200px" }}>
                                            <Typography variant="caption" color="text.secondary">
                                                Rescheduled to
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "#11998e",
                                                }}
                                            >
                                                {formatDate(item.newDate)} {formatTime(item.newTime)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ mt: 1.5 }}>
                                        <Typography variant="caption" color="text.secondary">
                                            Rescheduled by: <strong>{item.rescheduledBy}</strong>
                                        </Typography>
                                        {item.reason && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: "block",
                                                    mt: 0.5,
                                                    fontStyle: "italic",
                                                    color: "text.secondary",
                                                }}
                                            >
                                                Reason: {item.reason}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                {index < rescheduleHistory.length - 1 && (
                                    <Divider sx={{ mt: 2 }} />
                                )}
                            </Box>
                        ))}

                        {/* Current appointment */}
                        <Box
                            sx={{
                                mt: 3,
                                p: 2,
                                borderRadius: "8px",
                                background: "linear-gradient(135deg, rgba(17, 153, 142, 0.1) 0%, rgba(56, 239, 125, 0.1) 100%)",
                                border: "2px solid #11998e",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 1,
                                }}
                            >
                                <MdSchedule size={20} color="#11998e" />
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 600,
                                        color: "#11998e",
                                    }}
                                >
                                    Current Appointment
                                </Typography>
                            </Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: "#11998e",
                                }}
                            >
                                {formatDate(currentDate)} {formatTime(currentTime)}
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                        <MdHistory size={48} color="#ccc" />
                        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                            No reschedule history available
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        textTransform: "capitalize",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        fontFamily: "'Poppins', sans-serif",
                        "&:hover": {
                            background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                        },
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RescheduleHistoryModal;
