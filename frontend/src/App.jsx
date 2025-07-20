import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import guardService from './services/api/GUARDSERVICE';
import oracleService from './services/api/oracleService';  // <-- import oracleService
import { WebSocketProvider } from './context/WebSocketContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Controls from './components/Controls/GuardControls';
import Alerts from './components/alerts/Alerts';

function App() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      if (!window.ethereum) {
        console.error("No Ethereum provider found");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      try {
        await guardService.initialize(signer);
        await oracleService.initialize(signer);   // <-- initialize oracleService here
        setInitialized(true);
      } catch (err) {
        console.error("Failed to initialize services:", err);
      }
    }
    init();
  }, []);

  if (!initialized) {
    return <div>Loading blockchain data...</div>;
  }

  return (
    <WebSocketProvider>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '1rem' }}>
          <Dashboard />
          <Controls />
          <Alerts />
        </main>
      </div>
    </WebSocketProvider>
  );
}

export default App;
