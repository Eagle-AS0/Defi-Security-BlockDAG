import os
import re
import csv
SRC_DIR = r"D:\Defi-Security-BloackDAG\Defi-Security-BloackDAG\ai-backend\DeFiVulnLabs\src\test"


OUTPUT = "features.csv"

def extract_features_from_code(code):
       return {
        "length": len(code),
        "has_delegatecall": int("delegatecall" in code),
        "has_call": int("call(" in code and "delegatecall" not in code),
        "has_selfdestruct": int("selfdestruct" in code),
        "has_msg_sender": int("msg.sender" in code),
        "txFreq": 3,            # Static/default transaction frequency
        "poolDepth": 10000,     # Static/default liquidity pool depth
        "alertLevel": 5         # Static/default alert severity
    }

def is_attack(filename):
    filename = filename.lower()
    return any(x in filename for x in ["attack", "reentrancy", "malicious", "phish", "exploit"])

def main():
    rows = []
    for root, _, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith(".sol"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    code = f.read()
                    features = extract_features_from_code(code)
                    features["label"] = int(is_attack(file))
                    rows.append(features)

    if not rows:
        print("⚠️ No Solidity files found.")
        return

    with open(OUTPUT, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    print(f"✅ Extracted {len(rows)} rows into {OUTPUT}")

if __name__ == "__main__":
    main()
