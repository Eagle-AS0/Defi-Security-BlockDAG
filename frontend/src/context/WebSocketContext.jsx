// src/contexts/WebSocketContext.jsx
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { config } from '../utils/config';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mlDetections, setMlDetections] = useState([]);
  const [realTimeData, setRealTimeData] = useState({
    threatLevel: 0,
    activeThreats: 0,
    blockedTransactions: 0,
    processingTime: 0
  });

  useEffect(() => {
    if (!config.WEBSOCKET_URL) {
      console.error('Missing WebSocket URL in config.');
      return;
    }

    const socket = io(config.WEBSOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('ml_detection', (data) => {
      setMlDetections(prev => [data, ...prev.slice(0, 99)]);
    });

    socket.on('threat_level_update', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        threatLevel: data.level,
        activeThreats: data.activeThreats
      }));
    });

    socket.on('transaction_blocked', () => {
      setRealTimeData(prev => ({
        ...prev,
        blockedTransactions: prev.blockedTransactions + 1
      }));
    });

    socket.on('processing_metrics', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        processingTime: data.avgProcessingTime
      }));
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, []);

  const sendMessage = (event, data) => {
    if (!socketRef.current || !isConnected) {
      console.warn(`Socket not connected. Skipping emit: ${event}`);
      return;
    }
    socketRef.current.emit(event, data);
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        mlDetections,
        realTimeData,
        sendMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
