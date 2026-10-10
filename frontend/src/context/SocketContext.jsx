import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../utils/api";

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      const backendUrl =
        API_BASE_URL ||
        (import.meta.env.MODE === "development" ? "http://localhost:5000" : "/");
      const socket = io(backendUrl, {
        query: { userId: authUser._id },
        auth: { token: authUser.token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
      });

      setSocket(socket);

      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      return () => {
        socket.off("getOnlineUsers");
        socket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
