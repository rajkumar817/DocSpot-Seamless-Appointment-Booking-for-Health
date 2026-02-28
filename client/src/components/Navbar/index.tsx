// React Imports
import React, { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// MUI Imports
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
// React Icons
import { IoNotificationsCircleOutline } from "react-icons/io5";
import { IoHomeOutline } from "react-icons/io5";
import { IoDocumentTextOutline } from "react-icons/io5";
import { FaUserDoctor } from "react-icons/fa6";
import { RiLogoutCircleLine } from "react-icons/ri";
import { FaRegCircleUser } from "react-icons/fa6";
import { RiMenu3Fill } from "react-icons/ri";
import { RiMenu2Fill } from "react-icons/ri";
import { FaUsers } from "react-icons/fa";
import { IoChatbubblesOutline } from "react-icons/io5";
import { BiPulse } from "react-icons/bi";
// Hooks
import useTypedSelector from "../../hooks/useTypedSelector";
// Auth
import {
  selectedUserId,
  selectedUserName,
  selectedUserNotifications,
  userIsAdmin,
  userIsDoctor,
} from "../../redux/auth/authSlice";
// Custom
import CustomChip from "../CustomChip";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": {
      ...openedMixin(theme),
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
    },
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": {
      ...closedMixin(theme),
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#fff",
    },
  }),
}));

interface DashboardProps {
  children: ReactNode;
}

export default function Navbar({ children }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const userName = useTypedSelector(selectedUserName);
  const isAdmin = useTypedSelector(userIsAdmin);
  const isDoctor = useTypedSelector(userIsDoctor);
  const userId = useTypedSelector(selectedUserId);
  const userNotifications = useTypedSelector(selectedUserNotifications);

  const theme = useTheme();
  // Responsive drawer state
  const isMobile = window.innerWidth < 768;
  const [open, setOpen] = React.useState(!isMobile);

  // Close drawer on route change on mobile
  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  }, [location.pathname]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const userRoutes = [
    { text: "Home", icon: IoHomeOutline, path: "/dashboard" },
    {
      text: "Appointments",
      icon: IoDocumentTextOutline,
      path: "/appointments",
    },
    { text: "Apply Doctor", icon: FaUserDoctor, path: "/apply-doctor" },
    { text: "Chat", icon: IoChatbubblesOutline, path: "/chat" },
    { text: "Profile", icon: FaRegCircleUser, path: `/profile/${userId}` },
  ];

  const doctorRoutes = [
    { text: "Home", icon: IoHomeOutline, path: "/dashboard" },
    {
      text: "Appointments",
      icon: IoDocumentTextOutline,
      path: "/doctors/appointments",
    },
    { text: "Chat", icon: IoChatbubblesOutline, path: "/chat" },
    { text: "Profile", icon: FaRegCircleUser, path: `/profile/${userId}` },
  ];

  const adminRoutes = [
    { text: "Home", icon: IoHomeOutline, path: "/dashboard" },
    {
      text: "Users",
      icon: FaUsers,
      path: "/users",
    },
    { text: "Doctors", icon: FaUserDoctor, path: "/doctors" },
    { text: "System Activity", icon: BiPulse, path: "/admin/system-activity" },
    { text: "Profile", icon: FaRegCircleUser, path: `/profile/${userId}` },
  ];

  const routes = isAdmin ? adminRoutes : isDoctor ? doctorRoutes : userRoutes;
  const chipLabel = isAdmin ? "Admin" : isDoctor ? "Doctor" : "User";

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        sx={{
          background: "#fff",
          color: "#667eea",
          boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              mr: 2,
              ...(open && { display: "none" }),
              color: "#667eea",
            }}
          >
            <RiMenu3Fill />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: "600",
              color: "#667eea",
            }}
          >
            {userName}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {chipLabel?.length > 0 && <CustomChip label={chipLabel} />}
            <Box
              sx={{ cursor: "pointer", position: "relative" }}
              onClick={() => {
                navigate("/notifications");
              }}
            >
              {userNotifications?.length > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    background: "#ff4757",
                    color: "#fff",
                    height: "18px",
                    width: "18px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "50%",
                    left: "15px",
                    top: "-8px",
                    fontSize: "11px",
                    fontWeight: "600",
                  }}
                >
                  {userNotifications?.length}
                </Box>
              )}
              <Tooltip title="Notifications" placement="top">
                <div>
                  <IoNotificationsCircleOutline style={{ fontSize: "25px", color: "#667eea" }} />
                </div>
              </Tooltip>
            </Box>
            <Box
              sx={{ cursor: "pointer" }}
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              <Tooltip title="Logout" placement="top">
                <div>
                  <RiLogoutCircleLine style={{ fontSize: "23px", color: "#667eea" }} />
                </div>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ display: "flex", justifyContent: "space-between", color: "#fff" }}>
          <Box sx={{ marginLeft: "20px", fontWeight: "600", fontSize: "20px", fontFamily: "'Poppins', sans-serif", opacity: open ? 1 : 0, transition: "opacity 0.2s" }}>
            BOOK A DOCTOR
          </Box>
          <IconButton onClick={handleDrawerClose} sx={{ color: "#fff" }}>
            {theme.direction === "ltr" ? <RiMenu2Fill /> : <RiMenu3Fill />}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)" }} />
        <List sx={{ margin: open ? "0 18px" : "0 9px" }}>
          {routes.map((route, index) => (
            <ListItem
              key={route.text}
              disablePadding
              sx={{
                display: "block",
                backgroundColor:
                  location.pathname === route.path ? "rgba(255, 255, 255, 0.2)" : "inherit",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ListItemButton
                component={Link}
                to={route.path}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    // minWidth: 0,
                    // mr: open ? 3 : "auto",
                    justifyContent: "center",
                    "& .MuiListItemIcon-root": {
                      minWidth: open ? "56px" : "0px",
                    },
                  }}
                >
                  <ListItemIcon sx={{ fontSize: "20px", color: "#fff" }}>
                    {React.createElement(route.icon)}
                  </ListItemIcon>
                </ListItemIcon>
                <ListItemText
                  primary={route.text}
                  sx={{
                    opacity: open ? 1 : 0,
                    "& .MuiListItemText-primary": {
                      fontFamily: "'Poppins', sans-serif",
                      color: "#fff",
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
