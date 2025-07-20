import React from 'react';
import { useContractData } from '../../hooks/useContractData';

const ContractInfo = () => {
  const {
    contractData,
    loading,
    error,
    updateThreshold,
    pauseGuard,
    unpauseGuard,
    refetch,
  } = useContractData();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h3>Guard Info</h3>
      <p>Threshold: {contractData.guard.threshold}</p>
      <p>Paused: {contractData.guard.isPaused ? 'Yes' : 'No'}</p>
      <p>Detected Attacks: {contractData.guard.detectedAttacks}</p>
      <p>Blocked Transactions: {contractData.guard.blockedTransactions}</p>

      <h3>Oracle Info</h3>
      <p>Threat Level: {contractData.oracle.threatLevel}</p>
      <p>
        Last Update:{' '}
        {new Date(contractData.oracle.lastUpdate * 1000).toLocaleString()}
      </p>

      <button onClick={() => updateThreshold(contractData.guard.threshold + 1)}>
        Increase Threshold
      </button>

      {contractData.guard.isPaused ? (
        <button onClick={unpauseGuard}>Unpause Guard</button>
      ) : (
        <button onClick={pauseGuard}>Pause Guard</button>
      )}

      <button onClick={refetch}>Refresh</button>
    </div>
  );
};

export default ContractInfo;
