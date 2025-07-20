// src/contexts/ContractContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";

export const ContractContext = createContext(null);

export const ContractProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [connected, setConnected] = useState(false);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      console.warn("⚠️ Ethereum wallet not detected.");
      return;
    }

    try {
      const prov = new ethers.providers.Web3Provider(window.ethereum);
      await prov.send("eth_requestAccounts", []);
      const signer = prov.getSigner();
      const address = await signer.getAddress();
      const network = await prov.getNetwork();

      setProvider(prov);
      setSigner(signer);
      setAccount(address);
      setChainId(network.chainId);
      setConnected(true);

      console.log("🔌 Connected to wallet:", address);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  }, []);

  // Handle Metamask events
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        console.warn("🦊 Wallet disconnected.");
        setConnected(false);
        setAccount(null);
        setSigner(null);
        return;
      }

      setAccount(accounts[0]);
      console.log("🔁 Account changed:", accounts[0]);
    });

    window.ethereum.on("chainChanged", () => {
      console.log("🔁 Chain changed. Reloading...");
      window.location.reload();
    });

    return () => {
      window.ethereum.removeAllListeners("accountsChanged");
      window.ethereum.removeAllListeners("chainChanged");
    };
  }, []);

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  return (
    <ContractContext.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        connected,
        refreshConnection: connectWallet,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => useContext(ContractContext);
