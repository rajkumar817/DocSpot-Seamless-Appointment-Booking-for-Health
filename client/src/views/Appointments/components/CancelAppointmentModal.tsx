import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
} from "@mui/material";

interface CancelAppointmentModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    appointmentId: string;
    patientName?: string;
    doctorName?: string;
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
    open,
    onClose,
    onConfirm,
    doctorName,
}) => {
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = () => {
        if (reason.trim().length < 10) {
            setError("Reason must be at least 10 characters");
            return;
        }

        onConfirm(reason);
        setReason("");
        setError("");
    };

    const handleClose = () => {
        setReason("");
        setError("");
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle
                sx={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                }}
            >
                Cancel Appointment
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {doctorName && `Appointment with ${doctorName}`}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                        Please provide a reason for cancellation (minimum 10 characters):
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value);
                            setError("");
                        }}
                        placeholder="Enter your reason for cancellation..."
                        error={!!error}
                        helperText={error || `${reason.length}/10 characters minimum`}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                fontFamily: "'Poppins', sans-serif",
                            },
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    sx={{
                        textTransform: "capitalize",
                        fontFamily: "'Poppins', sans-serif",
                    }}
                >
                    Close
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={reason.trim().length < 10}
                    sx={{
                        textTransform: "capitalize",
                        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        fontFamily: "'Poppins', sans-serif",
                        "&:hover": {
                            background: "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                        },
                    }}
                >
                    Confirm Cancellation
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CancelAppointmentModal;
