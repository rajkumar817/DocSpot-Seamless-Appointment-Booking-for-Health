import React, { useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/auth/authSlice";
import useTypedSelector from "../hooks/useTypedSelector";
import { selectedUserNotifications } from "../redux/auth/authSlice";
import { toast } from "react-hot-toast";

const NotificationListener = () => {
    const { socket } = useSocket();
    const dispatch = useDispatch();
    const user = useTypedSelector((state) => state.auth.user);
    const currentNotifications = useTypedSelector(selectedUserNotifications);

    // Use ref to access current user inside effect without triggering re-runs
    const userRef = React.useRef(user);

    // Update ref whenever user changes
    useEffect(() => {
        userRef.current = user;
    }, [user]);

    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification: any) => {
            // Play a sound
            const audio = new Audio("/assets/notification.mp3"); // Ensure this file exists or use a URL
            audio.play().catch((e) => console.log("Audio play failed", e));

            // Show toast
            toast(notification.message, {
                icon: "🔔",
                duration: 5000,
                style: {
                    borderRadius: "10px",
                    background: "#333",
                    color: "#fff",
                },
            });

            // Update Redux state using ref values
            const currentUser = userRef.current;
            if (currentUser && currentUser.data && currentUser.data.user) {
                const updatedUser = {
                    ...currentUser,
                    data: {
                        ...currentUser.data,
                        user: {
                            ...currentUser.data.user,
                            unseenNotifications: [
                                ...currentUser.data.user.unseenNotifications,
                                notification, // The backend sends the notification object
                            ],
                        },
                    },
                };

                dispatch(setUser(updatedUser));
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }
        };

        socket.on("new-notification", handleNewNotification);

        return () => {
            socket.off("new-notification", handleNewNotification);
        };
    }, [socket, dispatch]); // Removed user from dependencies

    return null; // This component handles logic only
};

export default NotificationListener;
