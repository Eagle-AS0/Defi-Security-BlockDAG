import pandas as pd
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import os

def train_and_save():
    # ✅ Check if file exists
    if not os.path.exists("features.csv"):
        print("❌ features.csv file not found. Please run feature extraction first.")
        return

    # ✅ Load extracted features
    try:
        features = pd.read_csv("features.csv")
    except Exception as e:
        print("❌ Error loading features.csv:", e)
        return

    # ✅ Ensure required columns are present
    required_cols = {"length", "has_delegatecall", "has_call", "has_selfdestruct", "has_msg_sender", "label"}
    if not required_cols.issubset(features.columns):
        print("❌ features.csv is missing required columns:", required_cols - set(features.columns))
        return

    # 🎯 Features (X) and Target (y)
    X = features[["length", "has_delegatecall", "has_call", "has_selfdestruct", "has_msg_sender"]]
    y = features["label"]

    # 🔀 Split into train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 🧠 Train RandomForest model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # 📊 Evaluate model
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"✅ Model trained with accuracy: {acc:.2f}")

    # 💾 Save trained model
    try:
        with open("model.pkl", "wb") as f:
            pickle.dump(model, f)
        print("✅ model.pkl saved successfully")
    except Exception as e:
        print("❌ Failed to save model.pkl:", e)

if __name__ == "__main__":
    train_and_save()
