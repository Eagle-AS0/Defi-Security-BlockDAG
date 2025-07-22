# Defi-Security-BlockDAG
AI-Powered Modular Security Layer for DeFi Protocols  This project was built for the BlockDAG Hackathon. It introduces a real-time, modular security system designed to protect DeFi smart contracts from fraud, flash loan exploits, and vault vulnerabilities using AI-based anomaly detection and on-chain guardrails.

DeFi Security - BlockDAG Hackathon Project

🔐 Overview
*DEFI Security* is a modular and programmable AI-based protection layer for DeFi protocols. It safeguards vaults, yield farms, and bridges by detecting and responding to threats in real-time.

🎯 Objective
To build a plug-and-play security middleware for DeFi protocols that:
- Detects frauds and abnormal behavior using AI
- Monitors vaults and protects against reentrancy, flash loans, and admin misuse
- Includes a circuit breaker system and DAO-based control

🏗 Architecture
1. *Vault.sol* – Base smart contract for token deposits/withdrawals
2. *Guard.sol* – Monitors, limits, and can pause vault activity
3. *Oracle Layer* – Custom Chainlink-compatible on-chain data fetcher
4. *AI Layer* – Flask app with Isolation Forest / One-Class SVM
5. *Dashboard* – React frontend with real-time status, alerts, and wallet control
6. *Log Layer* – Logs are stored on IPFS for audit trail

🛠 Tech Stack
- Solidity, Hardhat, OpenZeppelin
- Python, Flask, Web3.py, scikit-learn
- Chainlink, The Graph
- React.js, Ethers.js
- MetaMask, WalletConnect
- IPFS (log storage)
