import React, { useState } from 'react';
import { useContract } from '../../context/ContractContext';

const GuardControls = () => {
  const { pauseContract, unpauseContract, setThreshold, account } = useContract();
  const [thresholdInput, setThresholdInput] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSetThreshold = async () => {
    if (!thresholdInput || isNaN(thresholdInput)) return;
    setTxStatus('Setting threshold...');
    setIsProcessing(true);
    try {
      await setThreshold(Number(thresholdInput));
      setTxStatus('Threshold updated successfully!');
      setThresholdInput('');
    } catch (err) {
      console.error(err);
      setTxStatus('Failed to update threshold.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePause = async () => {
    setTxStatus('Pausing contract...');
    setIsProcessing(true);
    try {
      await pauseContract();
      setTxStatus('Contract paused!');
    } catch (err) {
      console.error(err);
      setTxStatus('Failed to pause contract.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnpause = async () => {
    setTxStatus('Unpausing contract...');
    setIsProcessing(true);
    try {
      await unpauseContract();
      setTxStatus('Contract unpaused!');
    } catch (err) {
      console.error(err);
      setTxStatus('Failed to unpause contract.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {account ? (
        <>
          <div>
            <input
              type="number"
              placeholder="Set Threshold"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(e.target.value)}
              disabled={isProcessing}
            />
            <button onClick={handleSetThreshold} disabled={isProcessing || !thresholdInput}>
              Update Threshold
            </button>
          </div>
          <div>
            <button onClick={handlePause} disabled={isProcessing}>Pause Contract</button>
            <button onClick={handleUnpause} disabled={isProcessing}>Unpause Contract</button>
          </div>
          <p>{txStatus}</p>
        </>
      ) : (
        <p>Please connect your wallet to manage the contract.</p>
      )}
    </div>
  );
};

export default GuardControls;
