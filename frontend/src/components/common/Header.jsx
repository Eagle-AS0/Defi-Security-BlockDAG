import React from 'react';
import { Shield, Activity, AlertTriangle } from 'lucide-react';
import { useContractData } from '../../hooks/useContractData';

import { useWebSocket } from '../../hooks/useWebSocket';

const Header = () => {
  const { contractData } = useContractData();
  const { isConnected, realTimeData } = useWebSocket();

  const isPaused = contractData?.guard?.isPaused ?? false;
  const threatLevel = realTimeData?.threatLevel ?? 0;

  const getStatusColor = () => {
    if (isPaused) return 'red';
    if (threatLevel > 70) return 'orange';
    return 'green';
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <Shield />
          <h1>DeFi Security Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="status-item">
            <Activity />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="status-item">
            <AlertTriangle />
            <span>{isPaused ? 'Paused' : 'Active'}</span>
          </div>
          <div className="status-item">
            Threat Level:{' '}
            <span style={{ color: getStatusColor() }}>
              {threatLevel}%
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
