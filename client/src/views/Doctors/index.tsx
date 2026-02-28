// React Imports
import { useState } from "react";
// Redux
import {
  useChangeDoctorStatusMutation,
  useGetAllDoctorsQuery,
} from "../../redux/api/doctorSlice";
// MUI Imports
import { Box, Tooltip, Card, CardContent, Avatar, IconButton, Grid, TextField, InputAdornment, Chip } from "@mui/material";
// Utils
import { formatDateTime, maskingPhoneNumber } from "../../utils";
// React Icons
import { TiTickOutline } from "react-icons/ti";
import { MdBlock, MdSearch, MdEmail, MdPhone } from "react-icons/md";
import { CgUnblock } from "react-icons/cg";
import { FaUserDoctor, FaStethoscope } from "react-icons/fa6";
// Custom Imports
import CustomChip from "../../components/CustomChip";
import ToastAlert from "../../components/ToastAlert/ToastAlert";
import Spinner from "../../components/Spinner";
import { Heading } from "../../components/Heading";
import Navbar from "../../components/Navbar";
import OverlayLoader from "../../components/Spinner/OverlayLoader";

const Doctors = () => {
  const [doctorId, setDoctorId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({
    message: "",
    appearence: false,
    type: "",
  });

  const { data, isLoading, isSuccess } = useGetAllDoctorsQuery({});

  const handleCloseToast = () => {
    setToast({ ...toast, appearence: false });
  };

  const [doctorStatus, { isLoading: doctorLoading }] =
    useChangeDoctorStatusMutation();

  const doctorHandler = async (data: any, status: string) => {
    try {
      const payload = {
        doctorId: data._id,
        status: status,
        userId: data.userId,
      };

      const doctor: any = await doctorStatus(payload);

      if (doctor?.data?.status) {
        setToast({
          ...toast,
          message: "Doctor Status Changed Successfully",
          appearence: true,
          type: "success",
        });
      }
      if (doctor?.error) {
        setToast({
          ...toast,
          message: doctor?.error?.data?.message,
          appearence: true,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Doctor Status Changed Error:", error);
      setToast({
        ...toast,
        message: "Something went wrong",
        appearence: true,
        type: "error",
      });
    }
  };

  // Filter doctors based on search
  const filteredDoctors = data?.data?.filter((doctor: any) =>
    doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    if (status === "approved") return "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)";
    if (status === "pending") return "linear-gradient(135deg, #fa709a 0%, #fee140 100%)";
    return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
  };

  return (
    <>
      {isLoading && <OverlayLoader />}
      <Navbar>
        <Box sx={{ mb: 4 }}>
          <Heading
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "32px",
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            Doctors Management
          </Heading>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search doctors by name, specialty, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch style={{ fontSize: "24px", color: "#667eea" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: "500px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                background: "white",
                "& fieldset": {
                  borderColor: "rgba(102, 126, 234, 0.2)",
                },
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

        {/* Doctor Cards Grid */}
        <Grid container spacing={3}>
          {isSuccess && filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor: any) => (
              <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    background: "white",
                    position: "relative",
                    overflow: "visible",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 48px rgba(102, 126, 234, 0.3)",
                    },
                  }}
                >
                  {/* Status Badge */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      zIndex: 1,
                    }}
                  >
                    <CustomChip
                      label={
                        doctor.status === "pending"
                          ? "Pending"
                          : doctor.status === "approved"
                            ? "Approved"
                            : "Blocked"
                      }
                    />
                  </Box>

                  <CardContent sx={{ p: 3 }}>
                    {/* Avatar */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          background: getStatusColor(doctor.status),
                          fontSize: "28px",
                          fontWeight: "600",
                          mb: 2,
                        }}
                      >
                        {getInitials(doctor.fullName)}
                      </Avatar>

                      <Box
                        sx={{
                          fontSize: "20px",
                          fontWeight: "600",
                          color: "#1f2937",
                          mb: 0.5,
                          fontFamily: "'Poppins', sans-serif",
                          textAlign: "center",
                        }}
                      >
                        {doctor.prefix} {doctor.fullName}
                      </Box>

                      <Chip
                        icon={<FaStethoscope style={{ fontSize: "14px" }} />}
                        label={doctor.specialization}
                        size="small"
                        sx={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          fontWeight: "500",
                          "& .MuiChip-icon": {
                            color: "white",
                          },
                        }}
                      />
                    </Box>

                    {/* Doctor Info */}
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                          fontSize: "14px",
                          color: "#6b7280",
                        }}
                      >
                        <MdEmail style={{ fontSize: "16px", color: "#667eea" }} />
                        <Box sx={{ wordBreak: "break-all" }}>{doctor.email}</Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                          fontSize: "14px",
                          color: "#6b7280",
                        }}
                      >
                        <MdPhone style={{ fontSize: "16px", color: "#667eea" }} />
                        {maskingPhoneNumber(doctor.phoneNumber)}
                      </Box>

                      <Box
                        sx={{
                          fontSize: "12px",
                          color: "#9ca3af",
                          textAlign: "center",
                          mt: 2,
                        }}
                      >
                        Joined: {formatDateTime(doctor.createdAt)}
                      </Box>
                    </Box>

                    {/* Experience and Fee */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-around",
                        mb: 2,
                        p: 2,
                        background: "rgba(102, 126, 234, 0.05)",
                        borderRadius: "12px",
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Box sx={{ fontSize: "18px", fontWeight: "600", color: "#667eea" }}>
                          {doctor.experience}
                        </Box>
                        <Box sx={{ fontSize: "12px", color: "#6b7280" }}>Experience</Box>
                      </Box>
                      <Box sx={{ textAlign: "center" }}>
                        <Box sx={{ fontSize: "18px", fontWeight: "600", color: "#667eea" }}>
                          ₹{doctor.feePerConsultation}
                        </Box>
                        <Box sx={{ fontSize: "12px", color: "#6b7280" }}>Fee</Box>
                      </Box>
                    </Box>

                    {/* Action Button */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        pt: 2,
                        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {doctorId === doctor._id && doctorLoading ? (
                        <Spinner size={20} />
                      ) : (
                        <Tooltip
                          title={
                            doctor.status === "pending"
                              ? "Approve Doctor"
                              : doctor.status === "blocked"
                                ? "Unblock Doctor"
                                : "Block Doctor"
                          }
                          placement="top"
                        >
                          <IconButton
                            onClick={() => {
                              doctorHandler(
                                doctor,
                                doctor.status === "pending"
                                  ? "approved"
                                  : doctor.status === "blocked"
                                    ? "approved"
                                    : "blocked"
                              );
                              setDoctorId(doctor._id);
                            }}
                            sx={{
                              background:
                                doctor.status === "pending"
                                  ? "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
                                  : doctor.status === "blocked"
                                    ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                                    : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                              color: "white",
                              px: 3,
                              py: 1,
                              borderRadius: "12px",
                              "&:hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {doctor.status === "pending" ? (
                                <TiTickOutline style={{ fontSize: "20px" }} />
                              ) : doctor.status === "blocked" ? (
                                <CgUnblock style={{ fontSize: "17px" }} />
                              ) : (
                                <MdBlock style={{ fontSize: "17px" }} />
                              )}
                              <Box sx={{ fontSize: "14px", fontWeight: "600" }}>
                                {doctor.status === "pending"
                                  ? "Approve"
                                  : doctor.status === "blocked"
                                    ? "Unblock"
                                    : "Block"}
                              </Box>
                            </Box>
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "#6b7280",
                }}
              >
                <FaUserDoctor style={{ fontSize: "64px", opacity: 0.3, marginBottom: "16px" }} />
                <Box sx={{ fontSize: "18px", fontWeight: "500" }}>
                  {searchTerm ? "No doctors found matching your search" : "No doctors found"}
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Navbar>
      <ToastAlert
        appearence={toast.appearence}
        type={toast.type}
        message={toast.message}
        handleClose={handleCloseToast}
      />
    </>
  );
};

export default Doctors;
