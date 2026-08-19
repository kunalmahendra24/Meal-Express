import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useApp } from './AppContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { isAuthenticated, user, API_URL } = useApp();
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated || !user?._id) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
            return;
        }

        if (socketRef.current) {
            return;
        }

        // withCredentials sends the httpOnly token cookie with the handshake; no token is passed in JS
        const instance = io(API_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        socketRef.current = instance;
        setSocket(instance);

        return () => {
            instance.disconnect();
            socketRef.current = null;
            setSocket(null);
        };
    }, [isAuthenticated, user?._id, API_URL]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);

export default SocketContext;
