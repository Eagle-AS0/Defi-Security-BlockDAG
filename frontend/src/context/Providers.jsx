import React from 'react';
import { AppProvider } from "./AppContext";
import { WebSocketProvider } from './WebSocketContext';
import { ContractProvider } from './ContractContext';

export const Providers = ({ children }) => (
  <AppProvider>
    <ContractProvider>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </ContractProvider>
  </AppProvider>
);
