import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import { Heading } from "../../../components/Heading";
import { Box, Tooltip, Button, Grid, Divider } from "@mui/material";
import {
  useDoctorAppointmentsQuery,
  useAppointmentStatusMutation,
  useMarkAsNoShowMutation,
} from "../../../redux/api/doctorSlice";
import useTypedSelector from "../../../hooks/useTypedSelector";
import { selectedUserId } from "../../../redux/auth/authSlice";
import OverlayLoader from "../../../components/Spinner/OverlayLoader";
import { formatDate, formatTime, maskingPhoneNumber } from "../../../utils";
import { IoBookOutline } from "react-icons/io5";
import { TiTickOutline } from "react-icons/ti";
import { FcCancel } from "react-icons/fc";
import { MdInfo } from "react-icons/md";
import ToastAlert from "../../../components/ToastAlert/ToastAlert";
import ConsultationModal from "./ConsultationModal";
import RescheduleModal from "./RescheduleModal";
import RescheduleHistoryModal from "./RescheduleHistoryModal";



const DoctorAppointment = () => {
  const userId = useTypedSelector(selectedUserId);

  const [toast, setToast] = useState({
    message: "",
    appearence: false,
    type: "",
  });

  const [consultationModal, setConsultationModal] = useState({
    open: false,
    appointmentId: "",
    patientName: "",
  });

  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    appointmentId: "",
    patientName: "",
    currentDate: "",
    currentTime: "",
  });

  const [historyModal, setHistoryModal] = useState({
    open: false,
    rescheduleHistory: [],
    currentDate: "",
    currentTime: "",
  });

  const handleCloseToast = () => {
    setToast({ ...toast, appearence: false });
  };

  const { data, isLoading, isSuccess, refetch } = useDoctorAppointmentsQuery({
    userId,
  });

  const [changeStatus, { isLoading: statusLoading }] =
    useAppointmentStatusMutation();

  const [markNoShow, { isLoading: noShowLoading }] = useMarkAsNoShowMutation();

  // Helper function to check if appointment is within 12 hours
  const isWithin12Hours = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${new Date(time).toISOString().split('T')[1]}`);
    const currentTime = new Date();
    const hoursDifference = (appointmentDateTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    return hoursDifference < 12;
  };

  const handleStatusChange = async (appointmentId: string, status: string) => {
    try {
      const response: any = await changeStatus({
        appointmentId,
        status,
      });

      if (response?.data?.status) {
        setToast({
          message: response?.data?.message || `Appointment ${status} successfully`,
          appearence: true,
          type: "success",
        });
        refetch();
      }

      if (response?.error) {
        setToast({
          message: response?.error?.data?.message || "Failed to update status",
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

  const handleNoShow = async (appointmentId: string) => {
    try {
      const response: any = await markNoShow({ appointmentId });

      if (response?.data?.status) {
        setToast({
          message: "Appointment marked as no-show",
          appearence: true,
          type: "success",
        });
        refetch();
      }

      if (response?.error) {
        setToast({
          message: response?.error?.data?.message || "Failed to mark as no-show",
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

  // Debug: Log appointment data to check cancellation fields
  useEffect(() => {
    if (data?.data) {
      console.log("Doctor appointments data:", data.data);
      const cancelledAppts = data.data.filter((apt: any) => apt.status === "rejected");
      console.log("Cancelled appointments:", cancelledAppts);
    }
  }, [data]);

  return (
    <>
      {(isLoading || statusLoading) && <OverlayLoader />}

      <Navbar>
        <Heading sx={{ fontFamily: "'Poppins', sans-serif", fontSize: "32px", fontWeight: "700", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Appointments</Heading>
        <Box sx={{ margin: "20px 0" }}>
          {isSuccess && data.data.length > 0 ? (
            <Grid container spacing={3}>
              {data.data.map((row: any) => (
                <Grid item xs={12} md={6} lg={4} key={row._id}>
                  <Box
                    sx={{
                      background: row.status === "pending"
                        ? "linear-gradient(135deg, #b45309 0%, #92400e 100%)"
                        : row.status === "approved"
                          ? "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)"
                          : row.status === "completed"
                            ? "linear-gradient(135deg, #065f46 0%, #064e3b 100%)"
                            : row.status === "no-show"
                              ? "linear-gradient(135deg, #c2410c 0%, #9a3412 100%)"
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
                    {/* Header with Patient Name and Status */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                      <Box>
                        <Box sx={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#fff",
                          fontFamily: "'Poppins', sans-serif",
                          marginBottom: "4px"
                        }}>
                          {row.userInfo?.name}
                        </Box>
                        <Box sx={{
                          fontSize: "13px",
                          color: "rgba(255, 255, 255, 0.8)",
                          fontFamily: "'Poppins', sans-serif"
                        }}>
                          {maskingPhoneNumber(row?.userInfo?.phoneNumber)}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                                : row.status === "no-show"
                                  ? "⚠ No-Show"
                                  : row.status === "rescheduled"
                                    ? "🔄 Rescheduled"
                                    : row.status === "completed"
                                      ? "✓ Completed"
                                      : ""}
                        </Box>
                        {row.status === "rejected" && row.cancellationReason && (
                          <Tooltip title={`Cancellation reason: ${row.cancellationReason}`} arrow>
                            <Box sx={{ cursor: "pointer" }}>
                              <MdInfo style={{ fontSize: "22px", color: "#fff" }} />
                            </Box>
                          </Tooltip>
                        )}
                        {row.status === "rescheduled" && row.rescheduleHistory && row.rescheduleHistory.length > 0 && (
                          <Tooltip title="View reschedule history" arrow>
                            <Box
                              onClick={() =>
                                setHistoryModal({
                                  open: true,
                                  rescheduleHistory: row.rescheduleHistory,
                                  currentDate: row.date,
                                  currentTime: row.time,
                                })
                              }
                              sx={{ cursor: "pointer" }}
                            >
                              <MdInfo style={{ fontSize: "22px", color: "#fff" }} />
                            </Box>
                          </Tooltip>
                        )}
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
                    {row.status === "pending" && (
                      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleStatusChange(row._id, "approved")}
                          sx={{
                            flex: 1,
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
                          <TiTickOutline style={{ marginRight: "6px", fontSize: "18px" }} />
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleStatusChange(row._id, "rejected")}
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
                          <FcCancel style={{ marginRight: "6px", fontSize: "18px" }} />
                          Reject
                        </Button>
                      </Box>
                    )}
                    {row.status === "approved" && (
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {!isWithin12Hours(row.date, row.time) && (
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() =>
                              setRescheduleModal({
                                open: true,
                                appointmentId: row._id,
                                patientName: row.userInfo?.name,
                                currentDate: row.date,
                                currentTime: row.time,
                              })
                            }
                            sx={{
                              flex: "1 1 auto",
                              textTransform: "capitalize",
                              background: "rgba(255, 255, 255, 0.2)",
                              color: "#fff",
                              fontFamily: "'Poppins', sans-serif",
                              fontWeight: "600",
                              borderRadius: "12px",
                              padding: "8px 16px",
                              fontSize: "13px",
                              border: "1px solid rgba(255, 255, 255, 0.3)",
                              backdropFilter: "blur(10px)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background: "rgba(255, 255, 255, 0.3)",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            Reschedule
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleNoShow(row._id)}
                          sx={{
                            flex: "1 1 auto",
                            textTransform: "capitalize",
                            background: "rgba(255, 255, 255, 0.2)",
                            color: "#fff",
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: "600",
                            borderRadius: "12px",
                            padding: "8px 16px",
                            fontSize: "13px",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                            backdropFilter: "blur(10px)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              background: "rgba(255, 255, 255, 0.3)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          No-Show
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          fullWidth
                          onClick={() =>
                            setConsultationModal({
                              open: true,
                              appointmentId: row._id,
                              patientName: row.userInfo?.name,
                            })
                          }
                          sx={{
                            textTransform: "capitalize",
                            background: "#fff",
                            color: "#667eea",
                            fontFamily: "'Poppins', sans-serif",
                            fontWeight: "600",
                            borderRadius: "12px",
                            padding: "10px 20px",
                            boxShadow: "0 4px 15px 0 rgba(255, 255, 255, 0.3)",
                            transition: "all 0.3s ease",
                            marginTop: "8px",
                            "&:hover": {
                              background: "rgba(255, 255, 255, 0.95)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 6px 20px 0 rgba(255, 255, 255, 0.4)",
                            },
                          }}
                        >
                          Add Consultation
                        </Button>
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
                            appointmentId: row._id,
                            patientName: row.userInfo?.name,
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
                Appointments will appear here
              </Box>
            </Box>
          )}
        </Box>
      </Navbar>

      <ConsultationModal
        open={consultationModal.open}
        onClose={() =>
          setConsultationModal({
            open: false,
            appointmentId: "",
            patientName: "",
          })
        }
        appointmentId={consultationModal.appointmentId}
        patientName={consultationModal.patientName}
      />

      <RescheduleModal
        open={rescheduleModal.open}
        onClose={() =>
          setRescheduleModal({
            open: false,
            appointmentId: "",
            patientName: "",
            currentDate: "",
            currentTime: "",
          })
        }
        appointmentId={rescheduleModal.appointmentId}
        patientName={rescheduleModal.patientName}
        currentDate={rescheduleModal.currentDate}
        currentTime={rescheduleModal.currentTime}
        onSuccess={refetch}
      />

      <RescheduleHistoryModal
        open={historyModal.open}
        onClose={() =>
          setHistoryModal({
            open: false,
            rescheduleHistory: [],
            currentDate: "",
            currentTime: "",
          })
        }
        rescheduleHistory={historyModal.rescheduleHistory}
        currentDate={historyModal.currentDate}
        currentTime={historyModal.currentTime}
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

export default DoctorAppointment;
