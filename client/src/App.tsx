/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./views/Home";
import Dashboard from "./views/Dashboard";
import Login from "./views/Login";
import Signup from "./views/Signup";
import ForgotPassword from "./views/ForgotPassword";
import ResetPassword from "./views/ResetPassword";
import NotFound from "./views/NotFound";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import Appointments from "./views/Appointments";
import ApplyDoctor from "./views/ApplyDoctor";
import Profile from "./views/Profile";
import Doctors from "./views/Doctors";
import Users from "./views/Users";
import Notifications from "./views/Notifications";
import Chat from "./views/Chat";
import DoctorProfile from "./views/DoctorProfile";
import { useVerifyUserQuery } from "./redux/api/userSlice";
import { SocketProvider } from "./contexts/SocketContext";
import { useDispatch } from "react-redux";
import { selectedUserId, setUser } from "./redux/auth/authSlice";
import OverlayLoader from "./components/Spinner/OverlayLoader";
import BookAppointment from "./views/Appointments/components/BookAppointment";
import DoctorAppointment from "./views/Appointments/components/DoctorAppointment";
import useTypedSelector from "./hooks/useTypedSelector";
import NotificationListener from "./components/NotificationListener";
import SystemActivity from "./views/SystemActivity";

function App() {
  const dispatch = useDispatch();
  const userId = useTypedSelector(selectedUserId);

  const { data, isLoading, isSuccess } = useVerifyUserQuery(
    { userId },
    { skip: !userId }
  );

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData && isSuccess && data) {
      const user = JSON.parse(userData);
      const updatedUser = {
        ...user,
        data: {
          ...user.data,
          user: {
            ...user.data.user,
            seenNotifications: data?.data?.seenNotifications || [],
            unseenNotifications: data?.data?.unseenNotifications || [],
          },
        },
      };
      dispatch(setUser(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [data, isSuccess, dispatch]);

  return (
    <>
      {isLoading && <OverlayLoader />}
      <SocketProvider>
        <NotificationListener />
        <Toaster />
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoutes>
                  <Login />
                </PublicRoutes>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoutes>
                  <Signup />
                </PublicRoutes>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoutes>
                  <ForgotPassword />
                </PublicRoutes>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoutes>
                  <ResetPassword />
                </PublicRoutes>
              }
            />
            {/* Public Home Route */}
            <Route path="/" element={<Home />} />
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoutes>
                  <Dashboard />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/appointments"
              element={
                <ProtectedRoutes>
                  <Appointments />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/doctors/appointments"
              element={
                <ProtectedRoutes>
                  <DoctorAppointment />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/book-appointments/:userId"
              element={
                <ProtectedRoutes>
                  <BookAppointment />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/apply-doctor"
              element={
                <ProtectedRoutes>
                  <ApplyDoctor />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/doctor-profile/:id"
              element={
                <ProtectedRoutes>
                  <DoctorProfile />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/doctors"
              element={
                <ProtectedRoutes>
                  <Doctors />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoutes>
                  <Users />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/admin/system-activity"
              element={
                <ProtectedRoutes>
                  <SystemActivity />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoutes>
                  <Profile />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoutes>
                  <Notifications />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoutes>
                  <Chat />
                </ProtectedRoutes>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SocketProvider>
    </>
  );
}

export default App;
