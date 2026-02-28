import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Chip,
    CircularProgress,
} from "@mui/material";
import { IoClose, IoCloudUpload, IoDocument } from "react-icons/io5";
import {
    useAddConsultationDataMutation,
    useGetConsultationDataQuery,
} from "../../../redux/api/doctorSlice";
import ToastAlert from "../../../components/ToastAlert/ToastAlert";

interface ConsultationModalProps {
    open: boolean;
    onClose: () => void;
    appointmentId: string;
    patientName: string;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({
    open,
    onClose,
    appointmentId,
    patientName,
}) => {
    const [consultationNotes, setConsultationNotes] = useState("");
    const [prescription, setPrescription] = useState("");
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [toast, setToast] = useState({
        message: "",
        appearence: false,
        type: "",
    });

    const { data: consultationData, isLoading: dataLoading, refetch } = useGetConsultationDataQuery(
        { appointmentId },
        { skip: !appointmentId }
    );

    const [addConsultation, { isLoading: saving }] = useAddConsultationDataMutation();

    useEffect(() => {
        if (consultationData?.data) {
            setConsultationNotes(consultationData.data.consultationNotes || "");
            setPrescription(consultationData.data.prescription || "");
        }
    }, [consultationData]);

    const handleCloseToast = () => {
        setToast({ ...toast, appearence: false });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type !== "application/pdf") {
                setToast({
                    message: "Please upload only PDF files",
                    appearence: true,
                    type: "error",
                });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setToast({
                    message: "File size should not exceed 5MB",
                    appearence: true,
                    type: "error",
                });
                return;
            }
            setPdfFile(file);
        }
    };

    const handleSave = async () => {
        try {
            const consultationDataPayload: any = {
                consultationNotes,
                prescription,
            };

            if (pdfFile) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64String = reader.result as string;
                    consultationDataPayload.medicalRecord = {
                        fileName: pdfFile.name,
                        fileType: pdfFile.type,
                        fileSize: pdfFile.size,
                        fileData: base64String,
                    };

                    const response: any = await addConsultation({
                        appointmentId,
                        consultationData: consultationDataPayload,
                    });

                    if (response?.data?.status) {
                        setToast({
                            message: "Consultation data saved successfully",
                            appearence: true,
                            type: "success",
                        });
                        setPdfFile(null);
                        refetch();
                    } else {
                        setToast({
                            message: response?.error?.data?.message || "Failed to save consultation data",
                            appearence: true,
                            type: "error",
                        });
                    }
                };
                reader.readAsDataURL(pdfFile);
            } else {
                const response: any = await addConsultation({
                    appointmentId,
                    consultationData: consultationDataPayload,
                });

                if (response?.data?.status) {
                    setToast({
                        message: "Consultation data saved successfully",
                        appearence: true,
                        type: "success",
                    });
                    refetch();
                } else {
                    setToast({
                        message: response?.error?.data?.message || "Failed to save consultation data",
                        appearence: true,
                        type: "error",
                    });
                }
            }
        } catch (error) {
            setToast({
                message: "Something went wrong",
                appearence: true,
                type: "error",
            });
        }
    };

    const handleDownloadPdf = (record: any) => {
        const link = document.createElement("a");
        link.href = record.fileData;
        link.download = record.fileName;
        link.click();
    };

    return (
        <>
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
                        Consultation - {patientName}
                    </Typography>
                    <IconButton onClick={onClose} sx={{ color: "#fff" }}>
                        <IoClose />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ padding: "24px", marginTop: "16px" }}>
                    {dataLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ marginBottom: "20px" }}>
                                <Typography
                                    sx={{
                                        marginBottom: "8px",
                                        color: "#2d3748",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: "500",
                                        fontSize: "14px",
                                    }}
                                >
                                    Consultation Notes
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={consultationNotes}
                                    onChange={(e) => setConsultationNotes(e.target.value)}
                                    placeholder="Enter consultation notes..."
                                    sx={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        "& .MuiOutlinedInput-root": {
                                            fontFamily: "'Poppins', sans-serif",
                                            "&:hover fieldset": {
                                                borderColor: "#667eea",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#667eea",
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            <Box sx={{ marginBottom: "20px" }}>
                                <Typography
                                    sx={{
                                        marginBottom: "8px",
                                        color: "#2d3748",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: "500",
                                        fontSize: "14px",
                                    }}
                                >
                                    Prescription
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={prescription}
                                    onChange={(e) => setPrescription(e.target.value)}
                                    placeholder="Enter prescription details..."
                                    sx={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        "& .MuiOutlinedInput-root": {
                                            fontFamily: "'Poppins', sans-serif",
                                            "&:hover fieldset": {
                                                borderColor: "#667eea",
                                            },
                                            "&.Mui-focused fieldset": {
                                                borderColor: "#667eea",
                                            },
                                        },
                                    }}
                                />
                            </Box>

                            <Box sx={{ marginBottom: "20px" }}>
                                <Typography
                                    sx={{
                                        marginBottom: "8px",
                                        color: "#2d3748",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: "500",
                                        fontSize: "14px",
                                    }}
                                >
                                    Medical Records (PDF)
                                </Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<IoCloudUpload />}
                                    sx={{
                                        textTransform: "capitalize",
                                        fontFamily: "'Poppins', sans-serif",
                                        borderColor: "#667eea",
                                        color: "#667eea",
                                        "&:hover": {
                                            borderColor: "#764ba2",
                                            backgroundColor: "rgba(102, 126, 234, 0.1)",
                                        },
                                    }}
                                >
                                    Upload PDF
                                    <input
                                        type="file"
                                        hidden
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                    />
                                </Button>
                                {pdfFile && (
                                    <Chip
                                        label={`${pdfFile.name} (${(pdfFile.size / 1024).toFixed(2)} KB)`}
                                        onDelete={() => setPdfFile(null)}
                                        sx={{ marginLeft: "10px", fontFamily: "'Poppins', sans-serif" }}
                                    />
                                )}
                            </Box>

                            {consultationData?.data?.medicalRecords &&
                                consultationData.data.medicalRecords.length > 0 && (
                                    <Box sx={{ marginTop: "20px" }}>
                                        <Typography
                                            sx={{
                                                marginBottom: "12px",
                                                color: "#2d3748",
                                                fontFamily: "'Poppins', sans-serif",
                                                fontWeight: "500",
                                                fontSize: "14px",
                                            }}
                                        >
                                            Uploaded Medical Records
                                        </Typography>
                                        {consultationData.data.medicalRecords.map((record: any, index: number) => (
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
                                                <IoDocument style={{ color: "#667eea", marginRight: "12px" }} />
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
                    )}
                </DialogContent>

                <DialogActions sx={{ padding: "16px 24px" }}>
                    <Button
                        onClick={onClose}
                        sx={{
                            textTransform: "capitalize",
                            fontFamily: "'Poppins', sans-serif",
                            color: "#718096",
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={saving}
                        sx={{
                            textTransform: "capitalize",
                            fontFamily: "'Poppins', sans-serif",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                            },
                        }}
                    >
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastAlert
                appearence={toast.appearence}
                type={toast.type}
                message={toast.message}
                handleClose={handleCloseToast}
            />
        </>
    );
};

export default ConsultationModal;
