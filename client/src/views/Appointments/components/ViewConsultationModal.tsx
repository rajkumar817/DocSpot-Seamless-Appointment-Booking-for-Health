import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Divider,
    Grid,
    Chip,
} from "@mui/material";
import { IoClose, IoDocument, IoCalendar, IoTime, IoPerson, IoLocation } from "react-icons/io5";
import { formatDate, formatTime, convertToAMPMFormat } from "../../../utils";

interface ViewConsultationModalProps {
    open: boolean;
    onClose: () => void;
    appointment: any;
}

const ViewConsultationModal: React.FC<ViewConsultationModalProps> = ({
    open,
    onClose,
    appointment,
}) => {
    const handleDownloadPdf = (record: any) => {
        const link = document.createElement("a");
        link.href = record.fileData;
        link.download = record.fileName;
        link.click();
    };

    if (!appointment) return null;

    const doctorName = `${appointment.doctorInfo?.prefix ? appointment.doctorInfo.prefix : ""} ${appointment.doctorInfo?.fullName || "Unknown Doctor"}`;
    const specialization = appointment.doctorInfo?.specialization;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "#fff",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "600",
                }}
            >
                <Typography variant="h6" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                    Appointment Details
                </Typography>
                <IconButton onClick={onClose} sx={{ color: "#fff" }}>
                    <IoClose />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ padding: "24px", marginTop: "16px" }}>
                <Box sx={{ marginBottom: "24px" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 1 }}>
                                <IoPerson style={{ color: "#667eea" }} />
                                <Typography sx={{ fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
                                    Doctor:
                                </Typography>
                                <Typography sx={{ fontFamily: "'Poppins', sans-serif" }}>
                                    {doctorName}
                                </Typography>
                            </Box>
                            {specialization && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 1, marginLeft: "24px" }}>
                                    <Typography sx={{ fontSize: "14px", color: "#4a5568", fontFamily: "'Poppins', sans-serif" }}>
                                        {specialization}
                                    </Typography>
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 1 }}>
                                <Typography sx={{ fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
                                    Status:
                                </Typography>
                                <Chip
                                    label={appointment.status}
                                    size="small"
                                    sx={{
                                        textTransform: "capitalize",
                                        backgroundColor:
                                            appointment.status === "approved" ? "#48bb78" :
                                                appointment.status === "completed" ? "#3182ce" :
                                                    appointment.status === "pending" ? "#ecc94b" : "#e53e3e",
                                        color: "#fff",
                                        fontFamily: "'Poppins', sans-serif"
                                    }}
                                />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 1 }}>
                                <IoCalendar style={{ color: "#667eea" }} />
                                <Typography sx={{ fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
                                    Date:
                                </Typography>
                                <Typography sx={{ fontFamily: "'Poppins', sans-serif" }}>
                                    {formatDate(appointment.date)}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginBottom: 1 }}>
                                <IoTime style={{ color: "#667eea" }} />
                                <Typography sx={{ fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
                                    Time:
                                </Typography>
                                <Typography sx={{ fontFamily: "'Poppins', sans-serif" }}>
                                    {formatTime(appointment.time)}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{ margin: "20px 0" }} />

                {/* Consultation Data Section */}
                {appointment.consultationNotes || appointment.prescription || (appointment.medicalRecords && appointment.medicalRecords.length > 0) ? (
                    <>
                        <Typography variant="h6" sx={{ marginBottom: "16px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: "#2d3748" }}>
                            Consultation Report
                        </Typography>

                        {appointment.consultationNotes && (
                            <Box sx={{ marginBottom: "20px" }}>
                                <Typography
                                    sx={{
                                        marginBottom: "8px",
                                        color: "#4a5568",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: "600",
                                        fontSize: "15px",
                                    }}
                                >
                                    Notes
                                </Typography>
                                <Box
                                    sx={{
                                        padding: "16px",
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #e2e8f0",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: "14px",
                                            color: "#2d3748",
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {appointment.consultationNotes}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {appointment.prescription && (
                            <Box sx={{ marginBottom: "20px" }}>
                                <Typography
                                    sx={{
                                        marginBottom: "8px",
                                        color: "#4a5568",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: "600",
                                        fontSize: "15px",
                                    }}
                                >
                                    Prescription
                                </Typography>
                                <Box
                                    sx={{
                                        padding: "16px",
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #e2e8f0",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: "14px",
                                            color: "#2d3748",
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {appointment.prescription}
                                    </Typography>
                                </Box>
                            </Box>
                        )}

                        {appointment.medicalRecords && appointment.medicalRecords.length > 0 && (
                            <Box sx={{ marginTop: "20px" }}>
                                <Typography
                                    sx={{
                                        marginBottom: "12px",
                                        color: "#4a5568",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: "600",
                                        fontSize: "15px",
                                    }}
                                >
                                    Medical Records
                                </Typography>
                                {appointment.medicalRecords.map((record: any, index: number) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            padding: "12px",
                                            backgroundColor: "#fff",
                                            borderRadius: "8px",
                                            marginBottom: "8px",
                                            border: "1px solid #e2e8f0",
                                        }}
                                    >
                                        <IoDocument style={{ color: "#667eea", marginRight: "12px", fontSize: "24px" }} />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography
                                                sx={{
                                                    fontFamily: "'Poppins', sans-serif",
                                                    fontSize: "14px",
                                                    fontWeight: "500",
                                                }}
                                            >
                                                {record.fileName}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontFamily: "'Poppins', sans-serif",
                                                    fontSize: "12px",
                                                    color: "#718096",
                                                }}
                                            >
                                                {new Date(record.uploadedAt).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Button
                                            size="small"
                                            onClick={() => handleDownloadPdf(record)}
                                            sx={{
                                                textTransform: "capitalize",
                                                fontFamily: "'Poppins', sans-serif",
                                                color: "#667eea",
                                            }}
                                        >
                                            Download
                                        </Button>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </>
                ) : (
                    <Box
                        sx={{
                            padding: "30px",
                            textAlign: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.5)",
                            borderRadius: "12px",
                            border: "1px dashed #cbd5e0"
                        }}
                    >
                        <Typography
                            sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "15px",
                                color: "#718096",
                            }}
                        >
                            No consultation report available yet.
                        </Typography>
                    </Box>
                )}

                {/* User Documents Section (if any uploaded during booking) */}
                {appointment.documents && appointment.documents.length > 0 && (
                    <>
                        <Divider sx={{ margin: "20px 0" }} />
                        <Typography variant="h6" sx={{ marginBottom: "16px", fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: "#2d3748" }}>
                            Your Uploaded Documents
                        </Typography>
                        {appointment.documents.map((doc: any, index: number) => (
                            <Box
                                key={index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "12px",
                                    backgroundColor: "#fff",
                                    borderRadius: "8px",
                                    marginBottom: "8px",
                                    border: "1px solid #e2e8f0",
                                }}
                            >
                                <IoDocument style={{ color: "#667eea", marginRight: "12px", fontSize: "24px" }} />
                                <Box sx={{ flex: 1 }}>
                                    <Typography
                                        sx={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {doc.fileName}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: "12px",
                                            color: "#718096",
                                        }}
                                    >
                                        {new Date(doc.uploadedAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Button
                                    size="small"
                                    onClick={() => handleDownloadPdf(doc)}
                                    sx={{
                                        textTransform: "capitalize",
                                        fontFamily: "'Poppins', sans-serif",
                                        color: "#667eea",
                                    }}
                                >
                                    Download
                                </Button>
                            </Box>
                        ))}
                    </>
                )}

            </DialogContent>

            <DialogActions sx={{ padding: "16px 24px" }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        textTransform: "capitalize",
                        fontFamily: "'Poppins', sans-serif",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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

export default ViewConsultationModal;
