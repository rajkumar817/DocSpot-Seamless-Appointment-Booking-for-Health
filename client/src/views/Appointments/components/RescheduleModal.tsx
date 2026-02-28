import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    TextField,
    Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import moment, { Moment } from "moment";
import { useRescheduleAppointmentMutation } from "../../../redux/api/doctorSlice";
import ToastAlert from "../../../components/ToastAlert/ToastAlert";

interface RescheduleModalProps {
    open: boolean;
    onClose: () => void;
    appointmentId: string;
    patientName: string;
    currentDate: string;
    currentTime: string;
    onSuccess: () => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({
    open,
    onClose,
    appointmentId,
    patientName,
    currentDate,
    currentTime,
    onSuccess,
}) => {
    const [selectedDate, setSelectedDate] = useState<Moment | null>(
        moment(currentDate)
    );
    const [selectedTime, setSelectedTime] = useState<Moment | null>(
        moment(currentTime)
    );

    const [toast, setToast] = useState({
        message: "",
        appearence: false,
        type: "",
    });

    const [rescheduleAppointment, { isLoading }] =
        useRescheduleAppointmentMutation();

    const handleCloseToast = () => {
        setToast({ ...toast, appearence: false });
    };

    const handleSave = async () => {
        if (!selectedDate || !selectedTime) {
            setToast({
                message: "Please select both date and time",
                appearence: true,
                type: "error",
            });
            return;
        }

        // Check if date is in the past
        const today = moment().startOf("day");
        const appointmentDate = moment(selectedDate).startOf("day");

        if (appointmentDate.isBefore(today)) {
            setToast({
                message: "Cannot reschedule to a past date",
                appearence: true,
                type: "error",
            });
            return;
        }

        try {
            const response: any = await rescheduleAppointment({
                appointmentId,
                date: selectedDate.toISOString(),
                time: selectedTime.toISOString(),
            });

            if (response?.data?.status) {
                setToast({
                    message: response?.data?.message || "Appointment rescheduled successfully",
                    appearence: true,
                    type: "success",
                });
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            }

            if (response?.error) {
                setToast({
                    message: response?.error?.data?.message || "Failed to reschedule appointment",
                    appearence: true,
                    type: "error",
                });
            }
        } catch (error) {
            setToast({
                message: "Something went wrong",
                appearence: true,
                type: "error",
            });
        }
    };

    const handleClose = () => {
        setSelectedDate(moment(currentDate));
        setSelectedTime(moment(currentTime));
        onClose();
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "12px",
                        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                    }}
                >
                    Reschedule Appointment
                </DialogTitle>
                <DialogContent sx={{ mt: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 500,
                                mb: 1,
                            }}
                        >
                            Patient: {patientName}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                fontFamily: "'Poppins', sans-serif",
                                color: "text.secondary",
                            }}
                        >
                            Current Appointment: {moment(currentDate).format("MMM DD, YYYY")}{" "}
                            at {moment(currentTime).format("hh:mm A")}
                        </Typography>
                    </Box>

                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <DatePicker
                                label="New Date"
                                value={selectedDate}
                                onChange={(newValue: Moment | null) => setSelectedDate(newValue)}
                                minDate={moment()}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                fontFamily: "'Poppins', sans-serif",
                                            },
                                        }}
                                    />
                                )}
                            />
                            <TimePicker
                                label="New Time"
                                value={selectedTime}
                                onChange={(newValue: Moment | null) => setSelectedTime(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                fontFamily: "'Poppins', sans-serif",
                                            },
                                        }}
                                    />
                                )}
                            />
                        </Box>
                    </LocalizationProvider>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                            textTransform: "capitalize",
                            fontFamily: "'Poppins', sans-serif",
                            borderColor: "#667eea",
                            color: "#667eea",
                            "&:hover": {
                                borderColor: "#764ba2",
                                backgroundColor: "rgba(102, 126, 234, 0.04)",
                            },
                        }}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        sx={{
                            textTransform: "capitalize",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            fontFamily: "'Poppins', sans-serif",
                            "&:hover": {
                                background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                            },
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save"}
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

export default RescheduleModal;
