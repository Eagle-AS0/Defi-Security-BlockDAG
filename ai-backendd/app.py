from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from web3 import Web3
from dotenv import load_dotenv
import pickle
import numpy as np
import json
import os

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Connect to Hardhat node
w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
if not w3.is_connected():
    raise Exception("❌ Failed to connect to blockchain node")

# Load wallet
private_key = os.getenv("PRIVATE_KEY")
account = w3.eth.account.from_key(private_key)
print("✅ Wallet loaded:", account.address)

# Load Guard contract
with open("GuardABI.json") as f:
    guard_abi = json.load(f)
guard_address = Web3.to_checksum_address(os.getenv("GUARD_ADDRESS"))
guard = w3.eth.contract(address=guard_address, abi=guard_abi)

# Load Oracle contract
with open("OracleABI.json") as f:
    oracle_abi = json.load(f)
oracle_address = Web3.to_checksum_address(os.getenv("ORACLE_ADDRESS"))
oracle = w3.eth.contract(address=oracle_address, abi=oracle_abi)

# Load ML model
model = pickle.load(open("model.pkl", "rb"))

# Optional: Vault contract (e.g., for withdrawThreshold)
vault = None
vault_address = os.getenv("VAULT_ADDRESS")
if vault_address:
    try:
        with open("VaultABI.json") as f:
            vault_abi = json.load(f)
        vault = w3.eth.contract(address=Web3.to_checksum_address(vault_address), abi=vault_abi)
        print("✅ Vault contract loaded")
    except Exception as e:
        print("⚠️ Failed to load Vault contract:", e)

# Transaction sender
def send_transaction(function_call):
    nonce = w3.eth.get_transaction_count(account.address, "pending")
    tx = function_call.build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 300000,
        'gasPrice': w3.to_wei('1', 'gwei'),
        'chainId': 31337
    })
    signed_tx = w3.eth.account.sign_transaction(tx, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return receipt

@app.route("/")
def home():
    return "✅ Flask backend is running!"

@app.route("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/check_pause", methods=["GET"])
def check_pause():
    try:
        paused = guard.functions.paused().call()
        return jsonify({"paused": paused})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/unpause", methods=["POST"])
def unpause():
    try:
        if not guard.functions.paused().call():
            return jsonify({"message": "Contract is already unpaused"})
        receipt = send_transaction(guard.functions.unpause())
        return jsonify({
            "message": "Contract unpaused",
            "tx_hash": receipt.transactionHash.hex()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/monitor", methods=["POST"])
def monitor():
    data = request.get_json()
    try:
        # Input validation
        X = np.array([[
            float(data.get("length", 0)),
            int(data.get("has_delegatecall", 0)),
            int(data.get("has_call", 0)),
            int(data.get("has_selfdestruct", 0)),
            int(data.get("has_msg_sender", 0))
        ]])

        prediction = model.predict(X)[0]

        if prediction == 1:
            nonce = w3.eth.get_transaction_count(account.address, "pending")

            # Oracle update
            oracle_tx = oracle.functions.setOracleData(3, 10000, 5).build_transaction({
                "chainId": 31337,
                "gas": 200000,
                "gasPrice": w3.to_wei("1", "gwei"),
                "nonce": nonce
            })
            signed_oracle_tx = w3.eth.account.sign_transaction(oracle_tx, private_key=private_key)
            oracle_tx_hash = w3.eth.send_raw_transaction(signed_oracle_tx.rawTransaction)

            # Pause Vault
            nonce += 1
            pause_tx = guard.functions.pauseVault(True).build_transaction({
                "chainId": 31337,
                "gas": 300000,
                "gasPrice": w3.to_wei("1", "gwei"),
                "nonce": nonce
            })
            signed_pause_tx = w3.eth.account.sign_transaction(pause_tx, private_key=private_key)
            pause_tx_hash = w3.eth.send_raw_transaction(signed_pause_tx.rawTransaction)

            # WebSocket alert
            socketio.emit('alert', {
                "type": "anomaly_detected",
                "vault_tx": pause_tx_hash.hex(),
                "oracle_tx": oracle_tx_hash.hex()
            })

            return jsonify({
                "status": "paused",
                "vault_tx": pause_tx_hash.hex(),
                "oracle_tx": oracle_tx_hash.hex()
            })

        return jsonify({"status": "normal"})

    except Exception as e:
        print("Error in /monitor:", e)
        return jsonify({"error": str(e)}), 400

# Optional: Call withdrawThreshold if vault loaded
@app.route("/withdraw_threshold", methods=["GET"])
def get_withdraw_threshold():
    if not vault:
        return jsonify({"error": "Vault contract not configured"}), 500
    try:
        threshold = vault.functions.withdrawThreshold().call()
        return jsonify({"withdraw_threshold": threshold})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# WebSocket handlers
@socketio.on('connect')
def ws_connect():
    print("WebSocket client connected")
    emit('message', {'msg': 'Welcome WebSocket client!'})

@socketio.on('disconnect')
def ws_disconnect():
    print("WebSocket client disconnected")

@socketio.on('client_message')
def handle_client_message(data):
    print(f"Received message from client: {data}")
    emit('server_response', {'msg': f"Server received: {data}"})

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
