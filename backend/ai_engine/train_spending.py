# backend/ai_engine/train_spending.py
import os
import sys
import django
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# --- Django Setup ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finwise_backend.settings')
django.setup()
# --- End Django Setup ---

from django.contrib.auth import get_user_model
from ai_engine.ai_utils.spend_utils import build_monthly_category_matrix

User = get_user_model()

# Save models in a subfolder of the 'ai_models' directory from Day 13
MODELS_DIR = os.path.join(BASE_DIR, 'ai_models', 'spend_models')
os.makedirs(MODELS_DIR, exist_ok=True)

def safe_name(s: str) -> str:
    """Cleans a category name to be a safe filename."""
    return "".join(c if c.isalnum() else "_" for c in s).lower()

def create_lag_features(series, window=3):
    """
    Creates features (X) and target (y) for time series prediction.
    X = [spend_month_1, spend_month_2, spend_month_3]
    y = [spend_month_4]
    """
    vals = np.array(series, dtype=float)
    X, y = [], []
    if len(vals) <= window:
        return None, None # Not enough data

    for i in range(window, len(vals)):
        X.append(vals[i-window : i]) # The 3 previous months
        y.append(vals[i])           # The current month

    return np.array(X), np.array(y)

def train_global_category_model(category, X_all, y_all, window=3):
    """
    Trains and saves a single global model for a specific category.
    """
    if len(X_all) < 20: # Need at least 20 samples to train
        print(f"  -> Skipping '{category}': Not enough samples ({len(X_all)})")
        return None

    X_train, X_test, y_train, y_test = train_test_split(X_all, y_all, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)

    fname = f"global_cat_{safe_name(category)}.pkl"
    path = os.path.join(MODELS_DIR, fname)
    joblib.dump({'model': model, 'window': window, 'score': score, 'category': category}, path)
    return {'path': path, 'score': score}

def main(months_back=36, window=3):
    users = User.objects.all()
    print(f"--- Training Spending Models for {users.count()} users ---")

    # 1. Gather data from all users
    global_data = {}  # Format: { 'category_name': {'X': [], 'y': []} }

    for user in users:
        print(f"Processing data for: {user.username}")
        pivot = build_monthly_category_matrix(user, months_back=months_back)
        if pivot.empty:
            continue

        for category in pivot.columns:
            series = pivot[category].values
            if np.sum(series) == 0: # Skip if category is all zeros
                continue

            X, y = create_lag_features(series, window=window)

            if X is not None:
                if category not in global_data:
                    global_data[category] = {'X': [], 'y': []}
                global_data[category]['X'].append(X)
                global_data[category]['y'].append(y)

    # 2. Train one model for each category
    print(f"\n--- Found {len(global_data)} categories. Training global models... ---")
    global_trained = 0
    for category, parts in global_data.items():
        try:
            X_all = np.vstack(parts['X'])
            y_all = np.concatenate(parts['y'])

            res = train_global_category_model(category, X_all, y_all, window=window)
            if res:
                global_trained += 1
                print(f"  -> Trained global model for '{category}' (Score: {res['score']:.3f})")
        except Exception as e:
            print(f"  -> ERROR training '{category}': {e}")

    print(f"\n--- Training Finished. {global_trained} global models trained. ---")

if __name__ == "__main__":
    main()