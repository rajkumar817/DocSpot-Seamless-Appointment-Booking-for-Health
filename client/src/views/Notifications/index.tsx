// React Imports
import React from "react";
import { useDispatch } from "react-redux";
// MUI Imports
import { Box, Tabs, Tab, Typography, Button, IconButton, Paper, Avatar, Tooltip } from "@mui/material";
// React Icons
import { MdMarkChatUnread, MdMarkChatRead, MdDeleteOutline, MdNotificationsOff } from "react-icons/md";
import { IoCheckmarkDoneCircleOutline } from "react-icons/io5";
import { FaUserMd, FaUser, FaUserShield } from "react-icons/fa";
// Hooks
import useTypedSelector from "../../hooks/useTypedSelector";
// Redux
import {
  selectedUserNotifications,
  selectedUserReadNotifications,
  setUser,
} from "../../redux/auth/authSlice";
import {
  useDeleteNotificationsMutation,
  useSeenNotificationsMutation,
} from "../../redux/api/notificationApiSlice";
// Utils
import { processNotification } from "../../utils";
// Custom Imports
import Navbar from "../../components/Navbar";
import { Heading } from "../../components/Heading";
import ToastAlert from "../../components/ToastAlert/ToastAlert";
import OverlayLoader from "../../components/Spinner/OverlayLoader";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ padding: "24px 0" }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const Notifications = () => {
  const dispatch = useDispatch();
  const userNotifications = useTypedSelector(selectedUserNotifications);
  const readNotifications = useTypedSelector(selectedUserReadNotifications);

  const [value, setValue] = React.useState(0);
  const [toast, setToast] = React.useState({
    message: "",
    appearence: false,
    type: "",
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleCloseToast = () => {
    setToast({ ...toast, appearence: false });
  };

  const [deleteNotifications, { isLoading: deleteNotiLoading }] =
    useDeleteNotificationsMutation();

  const deleteNotificationsHandler = async () => {
    try {
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData!);
      const response: any = await deleteNotifications({});
      if (response.data.status) {
        setToast({
          ...toast,
          message: "All Notifications are deleted",
          appearence: true,
          type: "success",
        });

        const updatedUser = {
          ...user,
          data: {
            ...user.data,
            user: {
              ...user.data.user,
              seenNotifications: response.data.data.seenNotifications,
              unseenNotifications: response.data.data.unseenNotifications,
            },
          },
        };
        dispatch(setUser(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      if (response?.error) {
        setToast({
          ...toast,
          message: user?.error?.data?.message,
          appearence: true,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Deleting Notification Error:", error);
      setToast({
        ...toast,
        message: "Something went wrong",
        appearence: true,
        type: "error",
      });
    }
  };

  const [seenNotification, { isLoading }] = useSeenNotificationsMutation();

  const readNotificationHandler = async () => {
    try {
      const userData = localStorage.getItem("user");
      const user = JSON.parse(userData!);
      const response: any = await seenNotification({});

      if (response.data.status) {
        setToast({
          ...toast,
          message: "Marked all as read",
          appearence: true,
          type: "success",
        });

        const updatedUser = {
          ...user,
          data: {
            ...user.data,
            user: {
              ...user.data.user,
              seenNotifications: response.data.data.seenNotifications,
              unseenNotifications: response.data.data.unseenNotifications,
            },
          },
        };
        dispatch(setUser(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      if (response?.error) {
        setToast({
          ...toast,
          message: user?.error?.data?.message,
          appearence: true,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Notifications Seen Error:", error);
      setToast({
        ...toast,
        message: "Something went wrong",
        appearence: true,
        type: "error",
      });
    }
  };

  const getIcon = (type: string) => {
    // Determine icon based on type if feasible, referencing older implementation logic or expanding
    // For now returning a generic user icon logic
    return <FaUserMd />;
  };

  // Helper comp for empty state
  const EmptyState = ({ message }: { message: string }) => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center",
        opacity: 0.7,
      }}
    >
      <MdNotificationsOff style={{ fontSize: "64px", color: "#667eea", marginBottom: "16px" }} />
      <Typography
        sx={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "18px",
          fontWeight: "500",
          color: "#4a5568",
        }}
      >
        {message}
      </Typography>
    </Box>
  );

  return (
    <>
      {(isLoading || deleteNotiLoading) && <OverlayLoader />}
      <Navbar>
        <Box sx={{ minHeight: "80vh", padding: { xs: "0", md: "20px" } }}>
          <Heading
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: "24px", md: "32px" },
              fontWeight: "700",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "24px",
            }}
          >
            Notifications
          </Heading>

          <Paper
            elevation={0}
            sx={{
              borderRadius: "20px",
              overflow: "hidden",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              background: "#fff",
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="notification tabs"
                sx={{
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#667eea",
                    height: "3px",
                    borderRadius: "3px",
                  },
                  "& .MuiTab-root": {
                    textTransform: "capitalize",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "#a0aec0",
                    minHeight: "60px",
                    "&.Mui-selected": {
                      color: "#667eea",
                    },
                  },
                }}
              >
                <Tab
                  label={`Unseen (${userNotifications?.length || 0})`}
                  {...a11yProps(0)}
                  icon={<MdMarkChatUnread style={{ fontSize: "20px" }} />}
                  iconPosition="start"
                />
                <Tab
                  label={`Seen (${readNotifications?.length || 0})`}
                  {...a11yProps(1)}
                  icon={<MdMarkChatRead style={{ fontSize: "20px" }} />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <CustomTabPanel value={value} index={0}>
              {userNotifications?.length > 0 ? (
                <>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3, px: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={readNotificationHandler}
                      disabled={isLoading}
                      startIcon={<IoCheckmarkDoneCircleOutline />}
                      sx={{
                        textTransform: "capitalize",
                        borderColor: "#667eea",
                        color: "#667eea",
                        borderRadius: "10px",
                        fontFamily: "'Poppins', sans-serif",
                        "&:hover": {
                          borderColor: "#764ba2",
                          background: "rgba(102, 126, 234, 0.05)",
                        },
                      }}
                    >
                      Mark all as read
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 2 }}>
                    {userNotifications.map((notification: any, index: number) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          padding: "20px",
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          background: "linear-gradient(to right, #ffffff, #f7fafc)",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                          "&:hover": {
                            transform: "translateY(-3px)",
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                            borderColor: "#cbd5e0",
                          },
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: "6px",
                            background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                          <Avatar
                            sx={{
                              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              width: 48,
                              height: 48,
                              boxShadow: "0 4px 10px rgba(102, 126, 234, 0.3)",
                            }}
                          >
                            {/* Simple initials or icon */}
                            {notification?.data?.name ? notification.data.name[0].toUpperCase() : <FaUser />}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                              <Typography
                                sx={{
                                  fontFamily: "'Poppins', sans-serif",
                                  fontWeight: "600",
                                  fontSize: "16px",
                                  color: "#2d3748",
                                }}
                              >
                                {processNotification(notification?.type)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#a0aec0", fontFamily: "'Poppins', sans-serif" }}>
                                New
                              </Typography>
                            </Box>
                            <Typography
                              sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "14px",
                                color: "#4a5568",
                                lineHeight: 1.6,
                              }}
                            >
                              <Typography component="span" sx={{ fontWeight: 600, color: "#2d3748" }}>
                                {notification?.data?.name}
                              </Typography>{" "}
                              {notification?.message}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </>
              ) : (
                <EmptyState message="You're all caught up! No new notifications." />
              )}
            </CustomTabPanel>

            <CustomTabPanel value={value} index={1}>
              {readNotifications?.length > 0 ? (
                <>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3, px: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={deleteNotificationsHandler}
                      disabled={deleteNotiLoading}
                      startIcon={<MdDeleteOutline />}
                      sx={{
                        textTransform: "capitalize",
                        borderRadius: "10px",
                        fontFamily: "'Poppins', sans-serif",
                        "&:hover": {
                          background: "rgba(211, 47, 47, 0.05)",
                        },
                      }}
                    >
                      Delete All History
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 2 }}>
                    {readNotifications.map((notification: any, index: number) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          padding: "16px 20px",
                          borderRadius: "16px",
                          border: "1px solid #edf2f7",
                          background: "#f8fafc",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            background: "#fff",
                            borderColor: "#e2e8f0",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <Avatar
                            sx={{
                              background: "#e2e8f0",
                              color: "#718096",
                              width: 40,
                              height: 40,
                            }}
                          >
                            {notification?.data?.name ? notification.data.name[0].toUpperCase() : <FaUser />}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "14px",
                                color: "#718096",
                                lineHeight: 1.5,
                              }}
                            >
                              <Typography component="span" sx={{ fontWeight: 600, color: "#4a5568" }}>
                                {notification?.data?.name}
                              </Typography>{" "}
                              {notification?.message}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#a0aec0", fontFamily: "'Poppins', sans-serif", mt: 0.5, display: "block" }}>
                              {processNotification(notification?.type)}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </>
              ) : (
                <EmptyState message="No notification history found." />
              )}
            </CustomTabPanel>
          </Paper>
        </Box>
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

export default Notifications;
