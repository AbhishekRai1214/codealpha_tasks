import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect socket
    const newSocket = io('/', {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      // Join personal room for user notifications
      newSocket.emit('joinUserRoom', user._id);
    });

    // Listen for real-time notifications
    newSocket.on('notification', (notif) => {
      console.log('Received notification:', notif);
      setNotifications(prev => [
        {
          id: Date.now() + Math.random().toString(),
          message: notif.message,
          type: notif.type
        },
        ...prev
      ]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addNotificationManual = (message, type = 'INFO') => {
    setNotifications(prev => [
      {
        id: Date.now() + Math.random().toString(),
        message,
        type
      },
      ...prev
    ]);
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, removeNotification, addNotificationManual }}>
      {children}
      
      {/* Real-time Toasts Panel */}
      <div className="toast-container">
        {notifications.slice(0, 5).map((notif) => (
          <div key={notif.id} className="toast-item">
            <div className="toast-message">{notif.message}</div>
            <button className="toast-close" onClick={() => removeNotification(notif.id)}>×</button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};
