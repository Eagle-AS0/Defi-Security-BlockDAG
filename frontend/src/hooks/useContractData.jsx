import { useState, useEffect, useCallback } from 'react';
import guardService from '../services/api/GUARDSERVICE';
import oracleService from '../services/api/oracleService';
import { config } from '../utils/config';
import { ethers } from 'ethers';

export const useContractData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const [contractData, setContractData] = useState({
    guard: {
      threshold: 0,
      isPaused: false,
      detectedAttacks: 0,
      blockedTransactions: 0,
    },
    oracle: {
      threatLevel: 0,
      lastUpdate: 0,
    },
  });

  // Initialize Guard and Oracle services with signer
  const initializeServices = useCallback(async () => {
    if (!window.ethereum) {
      setError('Ethereum provider not found');
      setInitialized(false);
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      await Promise.all([
        guardService.initialize(signer),
        oracleService.initialize(signer),
      ]);

      setInitialized(true);
    } catch (err) {
      console.error('Failed to initialize services:', err);
      setError('Failed to initialize services: ' + err.message);
      setInitialized(false);
    }
  }, []);

  // Fetch contract data from Guard and Oracle contracts
  const fetchContractData = useCallback(async () => {
    if (!initialized) {
      setError('Guard or Oracle service not initialized');
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const [
        threshold,
        isPaused,
        isThreatDetected,
        oracleData,
      ] = await Promise.all([
        guardService.getThreshold(),   // <-- Correct method name
        guardService.isPaused(),
        guardService.isThreatDetected(),
        oracleService.getOracleData(),
      ]);

      // Oracle data structure: assume oracleData = { threatLevel, field2, ... }
      // Adapt this if your oracleService.getOracleData returns something else
      const threatLevel = oracleData.threatLevel ?? 0;
      const lastUpdate = oracleData.field2 ?? 0;
      const isPausedValue = isPaused ?? false;

      setContractData({
        guard: {
          threshold: Number(threshold),
          isPaused: isPausedValue,
          detectedAttacks: isThreatDetected ? 1 : 0,
          blockedTransactions: 0,
        },
        oracle: {
          threatLevel: Number(threatLevel),
          lastUpdate: Number(lastUpdate),
        },
      });

      setLastFetchedAt(Date.now());
    } catch (err) {
      console.error('Failed to fetch contract data:', err);
      setError(err.message || 'Error fetching contract data');
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  // Initialize on mount
  useEffect(() => {
    initializeServices();
  }, [initializeServices]);

  // Fetch data initially and on interval
  useEffect(() => {
    if (initialized) {
      fetchContractData();
      const interval = setInterval(fetchContractData, config.REFRESH_INTERVALS.CONTRACT_DATA);
      return () => clearInterval(interval);
    }
  }, [initialized, fetchContractData]);

  // Handle account and network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountChange = () => {
      if (initialized) fetchContractData();
    };
    const handleChainChange = () => window.location.reload();

    window.ethereum.on('accountsChanged', handleAccountChange);
    window.ethereum.on('chainChanged', handleChainChange);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountChange);
      window.ethereum.removeListener('chainChanged', handleChainChange);
    };
  }, [fetchContractData, initialized]);

  return {
    contractData,
    loading,
    error,
    lastFetchedAt,
    refetch: fetchContractData,
    updateThreshold: async (newThreshold) => {
      if (!initialized) throw new Error('Guard service not initialized');
      try {
        await guardService.setWithdrawThreshold(newThreshold);
        await fetchContractData();
      } catch (err) {
        setError(err.message || 'Error updating threshold');
        throw err;
      }
    },
    pauseGuard: async () => {
      if (!initialized) throw new Error('Guard service not initialized');
      try {
        await guardService.pause();
        await fetchContractData();
      } catch (err) {
        setError(err.message || 'Error pausing guard');
        throw err;
      }
    },
    unpauseGuard: async () => {
      if (!initialized) throw new Error('Guard service not initialized');
      try {
        await guardService.unpause();
        await fetchContractData();
      } catch (err) {
        setError(err.message || 'Error unpausing guard');
        throw err;
      }
    },
  };
};
