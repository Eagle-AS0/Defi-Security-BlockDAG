# 🔐 DeFi Security Layer — BlockDAG Hackathon Project

Welcome to **DeFi Security - BlockDAG**, a real-time, AI-powered modular security layer designed to protect decentralized finance (DeFi) protocols from fraud, flash loan attacks, and other smart contract exploits. This system was built for the **BlockDAG Hackathon** and combines anomaly detection with smart contract guardrails to offer plug-and-play protection for DeFi applications.

---

## 📌 Project Overview and Purpose

In the rapidly evolving world of DeFi, security vulnerabilities continue to pose significant risks. This project introduces a modular, programmable AI-driven middleware to detect, prevent, and respond to threats in real-time. By combining smart contracts, oracles, and AI anomaly detection, it aims to safeguard vaults, liquidity pools, and protocol integrity.

---

## 🚀 Objective

To build a **programmable, plug-and-play middleware** for DeFi protocols that:

- Detects frauds and abnormal behavior using AI
- Monitors vaults and liquidity events
- Protects against reentrancy, flash loans, and admin misuse
- Includes circuit-breakers and on-chain governance mechanisms

---

## 🧱 Architecture Overview

### 1. Smart Contract Guardrails

- Written in **Solidity**
- Acts as middleware between users and protocol vaults
- Features:
  - Reentrancy protection
  - Vault access control
  - Admin time-lock for sensitive actions

### 2. On-Chain Monitoring Oracle

- Chainlink-compatible custom oracle
- Tracks key metrics:
  - Transaction frequency
  - Liquidity pool depth
  - Wallet interaction types
- Streams real-time data to off-chain analytics engine

### 3. AI-Powered Anomaly Detection

- Built using **Python**, **Flask**, and **scikit-learn**
- Uses models like:
  - Isolation Forest
  - One-Class SVM
- Detects:
  - Volume spikes
  - Unusual withdrawal timings
  - Obfuscated contract calls

### 4. Logging, Alerts, and Governance

- **Logs stored on IPFS** for tamper-proof audit trails
- Real-time **alerts to Web3 wallets** via WalletConnect
- **React dashboard** shows:
  - Protocol risk index
  - Active alerts
  - Vault status

---

## 🛠 Tech Stack

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| Smart Contracts | Solidity, Hardhat                    |
| Oracles         | Chainlink, The Graph                 |
| Backend (AI)    | Python, Flask, Web3.py, scikit-learn |
| Frontend        | React.js, Ethers.js                  |
| Notifications   | MetaMask, WalletConnect              |
| Logging         | IPFS                                 |

---

## 📁 Project Structure

```
.
├── contracts/               # Solidity contracts: Guard, Vault, Oracle, Token
├── frontend/                # React app files: app.js, index.html, style.css
├── ai-backend/              # Flask backend: app.py, train_model.py, predict.py
├── artifacts/, build-info/  # Compiled contract files
├── features.csv             # Extracted features for training
├── model.pkl                # Trained ML model
├── test_monitor.py          # AI anomaly monitor
├── server.js                # Optional Node.js server for API layer
├── requirements.txt         # Python dependencies
└── README.md                # Project documentation (this file)
```

---

## 💻 Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/Defi-Security-BlockDAG.git
cd Defi-Security-BlockDAG

# Install Python dependencies
cd ai-backend
pip install -r requirements.txt

# Compile smart contracts
cd ../contracts
npx hardhat compile

# Start frontend (example)
cd ../frontend
npm install
npm start
```

---

## ▶️ Usage Instructions

1. Start the backend Flask app to enable AI monitoring:

```bash
python app.py
```

2. Deploy smart contracts via Hardhat:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Access the React dashboard via `http://localhost:3000`
4. Interact with Vault smart contracts via MetaMask and watch real-time alerts
5. Review logs stored on IPFS and monitor risk scores dynamically

---

## ✅ Key Features

- Modular guard smart contracts
- Live oracle monitoring
- AI-based fraud detection in real-time
- IPFS-based log storage
- MetaMask/WalletConnect governance alerts
- Full-stack integration (Solidity + Python + React)

---

## 📊 Demo Dashboard


![Frontend](https://github.com/Eagle-AS0/Defi-Security-BlockDAG/blob/main/Results/Screenshot%202025-07-22%20232507.png)

![Frontend](https://github.com/Eagle-AS0/Defi-Security-BlockDAG/blob/main/Results/Screenshot%202025-07-22%20232538.png)

![Frontend](https://github.com/Eagle-AS0/Defi-Security-BlockDAG/blob/main/Results/Screenshot%202025-07-22%20232608.png)

![Frontend](https://github.com/Eagle-AS0/Defi-Security-BlockDAG/blob/main/Results/Screenshot%202025-07-22%20232639.png)

![Frontend](https://github.com/Eagle-AS0/Defi-Security-BlockDAG/blob/main/Results/Screenshot%202025-07-22%20232711.png)

![Frontend](https://github.com/Eagle-AS0/Defi-Security-BlockDAG/blob/main/Results/Screenshot%202025-07-22%20232747.png)


<!-- This is a hidden comment that will not be displayed when rendered

![Backend](https://github.com/Eagle-AS0/Defi-Security-BlockDAG/blob/main/Results/photo_2025-07-22_23-29-41.jpg)

![Backend](https://github.com/Eagle-AS0/Defi-Security-BlockDAG/blob/main/Results/photo_2025-07-22_23-29-42%20(2).jpg)    -->













### 🎥 Demo Video

[Watch the full walkthrough on YouTube](https://youtu.be/your-demo-video-link)

---

## 📌 Future Improvements

- Integrate more ML models (e.g., LSTM, Autoencoders)
- Build advanced DAO-based access control
- Add Chainlink VRF for randomness in guard functions
- Deploy on multiple testnets and mainnets

---

## 🤝 Contribution

Pull requests and contributions are welcome! Please fork the repo, create a feature branch, and submit a PR. Make sure to follow modular file structure and comment your code clearly.

---

## 📜 License

This project is licensed under the [**LICENSE**]( https://github.com/Eagle-AS0/Defi-Security-BlockDAG/blob/main/LICENSE) See the LICENSE file for more details.

---

## 🙌 Acknowledgments

- **BlockDAG Hackathon** for the challenge
- **Chainlink** for decentralized oracle tooling
- **OpenZeppelin** for secure smart contract templates
- **The Graph** and **IPFS** communities

---

## 🔗 Useful Links

- [Chainlink Documentation](https://docs.chain.link/)
- [IPFS Docs](https://docs.ipfs.tech/)
- [Scikit-learn Anomaly Detection](https://scikit-learn.org/stable/modules/outlier_detection.html)
- [Hardhat Smart Contract Framework](https://hardhat.org/)

---

### Built with ❤️ by Team DefiSec @ BlockDAG Hackathon

