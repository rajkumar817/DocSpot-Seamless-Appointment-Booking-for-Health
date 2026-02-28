import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Get token from localStorage - it's stored in the user object
        const userDataString = localStorage.getItem("user");

        if (!userDataString) {
            console.log("No user data found, skipping socket connection");
            return;
        }

        let token;
        try {
            const userData = JSON.parse(userDataString);
            token = userData?.token;
        } catch (error) {
            console.error("Error parsing user data:", error);
            return;
        }

        if (!token) {
            console.log("No token found in user data, skipping socket connection");
            return;
        }

        // Initialize socket connection
        const socketInstance = io(process.env.REACT_APP_SERVER_URL || "http://localhost:5000", {
            auth: {
                token,
            },
            transports: ["websocket", "polling"],
        });

        // Connection event handlers
        socketInstance.on("connect", () => {
            console.log("Socket connected:", socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        socketInstance.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
            setIsConnected(false);
        });

        socketInstance.on("error", (error) => {
            console.error("Socket error:", error);
        });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = React.useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};
