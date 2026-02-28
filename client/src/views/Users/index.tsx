// React Imports
import { useState } from "react";
// MUI Imports
import { Box, Tooltip, Card, CardContent, Avatar, IconButton, Grid, TextField, InputAdornment } from "@mui/material";
// Custom Imports
import { Heading } from "../../components/Heading";
import Navbar from "../../components/Navbar";
import OverlayLoader from "../../components/Spinner/OverlayLoader";
// Redux
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
} from "../../redux/api/userSlice";
// Utils
import { formatDateTime } from "../../utils";
import CustomChip from "../../components/CustomChip";
import { MdDeleteOutline, MdSearch } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import ToastAlert from "../../components/ToastAlert/ToastAlert";
import Spinner from "../../components/Spinner";

const Users = () => {
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState({
    message: "",
    appearence: false,
    type: "",
  });

  const handleCloseToast = () => {
    setToast({ ...toast, appearence: false });
  };

  const { data, isLoading, isSuccess } = useGetAllUsersQuery({});

  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();

  const DeleteHandler = async (id: string) => {
    try {
      const user: any = await deleteUser({ userId: id });

      if (user?.data === null) {
        setToast({
          ...toast,
          message: "User Deleted Successfully",
          appearence: true,
          type: "success",
        });
      }
    } catch (error) {
      console.error("Deleting User Error:", error);
      setToast({
        ...toast,
        message: "Something went wrong",
        appearence: true,
        type: "error",
      });
    }
  };

  // Filter users based on search
  const filteredUsers = data?.data?.filter((user: any) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (isAdmin: boolean, isDoctor: boolean) => {
    if (isAdmin) return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
    if (isDoctor) return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
    return "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)";
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
            Users Management
          </Heading>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search users by name or email..."
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

        {/* User Cards Grid */}
        <Grid container spacing={3}>
          {isSuccess && filteredUsers.length > 0 ? (
            filteredUsers.map((user: any) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
                <Card
                  sx={{
                    borderRadius: "20px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    background: "white",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 48px rgba(102, 126, 234, 0.3)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Avatar and Role Badge */}
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
                          background: getRoleColor(user.isAdmin, user.isDoctor),
                          fontSize: "28px",
                          fontWeight: "600",
                          mb: 2,
                        }}
                      >
                        {getInitials(user.name)}
                      </Avatar>

                      <CustomChip
                        label={
                          user?.isAdmin
                            ? "Owner"
                            : user?.isDoctor
                              ? "Doctor"
                              : "User"
                        }
                      />
                    </Box>

                    {/* User Info */}
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Box
                        sx={{
                          fontSize: "18px",
                          fontWeight: "600",
                          color: "#1f2937",
                          mb: 0.5,
                          fontFamily: "'Poppins', sans-serif",
                        }}
                      >
                        {user.name}
                      </Box>
                      <Box
                        sx={{
                          fontSize: "14px",
                          color: "#6b7280",
                          mb: 1,
                          wordBreak: "break-all",
                        }}
                      >
                        {user.email}
                      </Box>
                      <Box
                        sx={{
                          fontSize: "12px",
                          color: "#9ca3af",
                        }}
                      >
                        Joined: {formatDateTime(user.createdAt)}
                      </Box>
                    </Box>

                    {/* Actions */}
                    {!user.isAdmin && !user.isDoctor && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          pt: 2,
                          borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {userId === user.id && deleteLoading ? (
                          <Spinner size={20} />
                        ) : (
                          <Tooltip title="Delete User" placement="top">
                            <IconButton
                              onClick={() => {
                                DeleteHandler(user.id);
                                setUserId(user.id);
                              }}
                              sx={{
                                color: "#ef4444",
                                "&:hover": {
                                  background: "rgba(239, 68, 68, 0.1)",
                                },
                              }}
                            >
                              <MdDeleteOutline style={{ fontSize: "20px" }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    )}
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
                <FaUserCircle style={{ fontSize: "64px", opacity: 0.3, marginBottom: "16px" }} />
                <Box sx={{ fontSize: "18px", fontWeight: "500" }}>
                  {searchTerm ? "No users found matching your search" : "No users found"}
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

export default Users;
