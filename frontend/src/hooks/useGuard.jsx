// src/hooks/useGuard.js
import { useEffect, useState, useCallback } from "react";
import { useContract } from "../contexts/ContractContext";
import guardService from "../services/api/GUARDSERVICE";

export const useGuard = () => {
  const { signer, connected } = useContract();
  const [isPaused, setIsPaused] = useState(null);
  const [threshold, setThreshold] = useState(null);
  const [threatDetected, setThreatDetected] = useState(false);

  const fetchData = useCallback(async () => {
    if (!signer || !connected) return;

    await guardService.initialize(signer);

    const [paused, thresholdValue, threat] = await Promise.all([
      guardService.isPaused(),
      guardService.getWithdrawThreshold(),
      guardService.isThreatDetected(),
    ]);

    setIsPaused(paused);
    setThreshold(Number(thresholdValue));
    setThreatDetected(threat);
  }, [signer, connected]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateThreshold = async (val) => {
    await guardService.setWithdrawThreshold(val);
    fetchData();
  };

  const pause = async () => {
    await guardService.pause();
    fetchData();
  };

  const unpause = async () => {
    await guardService.unpause();
    fetchData();
  };

  return {
    isPaused,
    threshold,
    threatDetected,
    updateThreshold,
    pause,
    unpause,
    refetch: fetchData,
  };
};
