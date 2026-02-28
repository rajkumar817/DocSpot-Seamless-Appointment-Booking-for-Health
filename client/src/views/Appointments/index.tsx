import { Heading } from "../../components/Heading";
import Navbar from "../../components/Navbar";
import OverlayLoader from "../../components/Spinner/OverlayLoader";
import useTypedSelector from "../../hooks/useTypedSelector";
import { formatDate, formatTime, maskingPhoneNumber } from "../../utils";
import { useUserAppointmentsQuery, useCancelAppointmentMutation } from "../../redux/api/userSlice";
import { selectedUserId } from "../../redux/auth/authSlice";
import { Box, Button, Grid, Divider } from "@mui/material";
import { IoBookOutline } from "react-icons/io5";
import React, { useState, useEffect } from "react";
import ViewConsultationModal from "./components/ViewConsultationModal";
import CancelAppointmentModal from "./components/CancelAppointmentModal";
import ToastAlert from "../../components/ToastAlert/ToastAlert";

const tableHead = ["Id", "Doctor", "Phone", "Date", "Status", "Consultation"];

const Appointments = () => {
  const userId = useTypedSelector(selectedUserId);

  const [consultationModal, setConsultationModal] = useState<{
    open: boolean;
    appointment: any;
  }>({
    open: false,
    appointment: null,
  });

  const [cancelModal, setCancelModal] = useState({
    open: false,
    appointmentId: "",
    doctorName: "",
  });

  const [toast, setToast] = useState({
    message: "",
    appearence: false,
    type: "",
  });

  const { data, isLoading, isSuccess, refetch } = useUserAppointmentsQuery({
    userId,
  });

  const [cancelAppointment, { isLoading: cancelLoading }] = useCancelAppointmentMutation();

  const handleCloseToast = () => {
    setToast({ ...toast, appearence: false });
  };

  // Helper function to check if appointment is within 12 hours
  const isWithin12Hours = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${new Date(time).toISOString().split('T')[1]}`);
    const currentTime = new Date();
    const hoursDifference = (appointmentDateTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    return hoursDifference < 12;
  };

  const handleCancelAppointment = async (reason: string) => {
    try {
      const response: any = await cancelAppointment({
        appointmentId: cancelModal.appointmentId,
        cancellationReason: reason,
      });

      if (response?.data?.status) {
        setToast({
          message: "Appointment cancelled successfully",
          appearence: true,
          type: "success",
        });
        setCancelModal({ open: false, appointmentId: "", doctorName: "" });
        refetch();
      }

      if (response?.error) {
        setToast({
          message: response?.error?.data?.message || "Failed to cancel appointment",
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

  // Auto-refresh appointments every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <>
      {isLoading && <OverlayLoader />}

      <Navbar>
        <Heading sx={{ fontFamily: "'Poppins', sans-serif", fontSize: "32px", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Appointments</Heading>
        <Box
          sx={{
            margin: "20px 0",
          }}
        >
          {isSuccess && data.data.length > 0 ? (
            <Grid container spacing={3}>
              {data.data.map((row: any) => (
                <Grid item xs={12} md={6} lg={4} key={row._id}>
                  <Box
                    sx={{
                      background: row.status === "approved"
                        ? "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)"
                        : row.status === "completed"
                          ? "linear-gradient(135deg, #065f46 0%, #064e3b 100%)"
                          : row.status === "pending"
                            ? "linear-gradient(135deg, #b45309 0%, #92400e 100%)"
                            : "linear-gradient(135deg, #9f1239 0%, #881337 100%)",
                      borderRadius: "20px",
                      padding: "24px",
                      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.4)",
                      },
                    }}
                  >
                    {/* Header with Doctor Name and Status */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <Box>
                        <Box sx={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#fff",
                          fontFamily: "'Poppins', sans-serif",
                          marginBottom: "4px"
                        }}>
                          {`${row.doctorInfo?.prefix} ${row.doctorInfo?.fullName}`}
                        </Box>
                        <Box sx={{
                          fontSize: "13px",
                          color: "rgba(255, 255, 255, 0.8)",
                          fontFamily: "'Poppins', sans-serif"
                        }}>
                          {maskingPhoneNumber(row?.doctorInfo?.phoneNumber)}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          background: "rgba(255, 255, 255, 0.25)",
                          backdropFilter: "blur(10px)",
                          color: "#fff",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          fontFamily: "'Poppins', sans-serif",
                          border: "1px solid rgba(255, 255, 255, 0.3)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px"
                        }}
                      >
                        {row.status === "pending"
                          ? "⏳ Pending"
                          : row.status === "approved"
                            ? "✓ Approved"
                            : row.status === "rejected"
                              ? "✗ Cancelled"
                              : row.status === "rescheduled"
                                ? "🔄 Rescheduled"
                                : row.status === "completed"
                                  ? "✓ Completed"
                                  : row.status === "no-show"
                                    ? "⚠ No-Show"
                                    : ""}
                      </Box>
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)", margin: "16px 0" }} />

                    {/* Appointment Details */}
                    <Box sx={{ marginBottom: "20px" }}>
                      <Box sx={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
                        <Box sx={{
                          minWidth: "100px",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontFamily: "'Poppins', sans-serif"
                        }}>
                          📅 Date & Time
                        </Box>
                        <Box sx={{
                          fontSize: "15px",
                          fontWeight: "600",
                          color: "#fff",
                          fontFamily: "'Poppins', sans-serif"
                        }}>
                          {`${formatDate(row?.date)} at ${formatTime(row?.time)}`}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{
                          minWidth: "100px",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "rgba(255, 255, 255, 0.9)",
                          fontFamily: "'Poppins', sans-serif"
                        }}>
                          🆔 ID
                        </Box>
                        <Box sx={{
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "rgba(255, 255, 255, 0.85)",
                          fontFamily: "'Poppins', sans-serif",
                          wordBreak: "break-all"
                        }}>
                          {row._id}
                        </Box>
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    {row.status === "approved" && (
                      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            setConsultationModal({
                              open: true,
                              appointment: row,
                            })
                          }
                          sx={{
                            flex: 1,
                            textTransform: "capitalize",
                            background: "#fff",
                            color: "#667eea",
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: "600",
                            borderRadius: "12px",
                            padding: "10px 20px",
                            boxShadow: "0 4px 15px 0 rgba(255, 255, 255, 0.3)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: "rgba(255, 255, 255, 0.95)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 20px 0 rgba(255, 255, 255, 0.4)",
                            },
                          }}
                        >
                          <IoBookOutline style={{ marginRight: "8px", fontSize: "18px" }} />
                          View Details
                        </Button>
                        {!isWithin12Hours(row.date, row.time) && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() =>
                              setCancelModal({
                                open: true,
                                appointmentId: row._id,
                                doctorName: `${row.doctorInfo?.prefix} ${row.doctorInfo?.fullName}`,
                              })
                            }
                            sx={{
                              flex: 1,
                              textTransform: "capitalize",
                              background: "rgba(255, 255, 255, 0.2)",
                              color: "#fff",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: "600",
                              borderRadius: "12px",
                              padding: "10px 20px",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              backdropFilter: "blur(10px)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background: "rgba(255, 255, 255, 0.3)",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    )}
                    {row.status === "completed" && (
                      <Button
                        variant="contained"
                        fullWidth
                        size="small"
                        onClick={() =>
                          setConsultationModal({
                            open: true,
                            appointment: row,
                          })
                        }
                        sx={{
                          textTransform: "capitalize",
                          background: "#fff",
                          color: "#11998e",
                          fontFamily: "'Poppins', sans-serif",
                          fontWeight: "600",
                          borderRadius: "12px",
                          padding: "10px 20px",
                          boxShadow: "0 4px 15px 0 rgba(255, 255, 255, 0.3)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background: "rgba(255, 255, 255, 0.95)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 20px 0 rgba(255, 255, 255, 0.4)",
                          },
                        }}
                      >
                        View Consultation
                      </Button>
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box
              sx={{
                background: "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
                borderRadius: "20px",
                padding: "60px 40px",
                textAlign: "center",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <IoBookOutline style={{ fontSize: "64px", color: "#fff", marginBottom: "16px" }} />
              <Box
                sx={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#fff",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {data?.data?.length === 0 ? "No appointments found" : "Loading..."}
              </Box>
              <Box
                sx={{
                  fontSize: "16px",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontFamily: "'Poppins', sans-serif",
                  marginTop: "8px"
                }}
              >
                Book your first appointment to get started
              </Box>
            </Box>
          )}
        </Box>
      </Navbar>

      <ViewConsultationModal
        open={consultationModal.open}
        onClose={() =>
          setConsultationModal({
            open: false,
            appointment: null,
          })
        }
        appointment={consultationModal.appointment}
      />

      <CancelAppointmentModal
        open={cancelModal.open}
        onClose={() =>
          setCancelModal({ open: false, appointmentId: "", doctorName: "" })
        }
        onConfirm={handleCancelAppointment}
        appointmentId={cancelModal.appointmentId}
        doctorName={cancelModal.doctorName}
      />

      {toast.appearence && (
        <ToastAlert
          appearence={toast.appearence}
          type={toast.type}
          message={toast.message}
          handleClose={handleCloseToast}
        />
      )}
    </>
  );
};

export default Appointments;
