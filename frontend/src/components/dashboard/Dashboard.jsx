import React, { useEffect, useState } from "react";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useContract } from "../../context/ContractContext";
import ContractInfo from "../common/ContractInfo";

const Dashboard = () => {
  const { isConnected, mlDetections, realTimeData, sendMessage } = useWebSocket();
  const { contract, account } = useContract();

  const [contractData, setContractData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContractData = async () => {
      if (!contract) return;

      try {
        // Replace 'someReadMethod' with your actual contract method
        const data = await contract.someReadMethod();
        setContractData(data.toString());
      } catch (err) {
        console.error("Contract call error:", err);
        setError(err.message || "Unknown error");
      }
    };

    fetchContractData();
  }, [contract]);

  return (
    <div>
      <h1>Dashboard</h1>

      <section>
        <h2>WebSocket Status</h2>
        <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
        <p>Threat Level: {realTimeData.threatLevel}</p>
        <p>Active Threats: {realTimeData.activeThreats}</p>
        <p>Blocked Transactions: {realTimeData.blockedTransactions}</p>
        <p>Avg Processing Time: {realTimeData.processingTime} ms</p>
      </section>

      <section>
        <h2>ML Detections (Latest)</h2>
        <ul>
          {mlDetections.map((detection, index) => (
            <li key={index}>{JSON.stringify(detection)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Contract Info</h2>
        <ContractInfo />
        {account && <p>Connected Account: {account}</p>}
        {contractData && <p>Contract Data: {contractData}</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </section>
    </div>
  );
};

export default Dashboard;
