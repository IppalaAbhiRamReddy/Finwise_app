# backend/insights/train_insights.py
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from django.contrib.auth import get_user_model
import django
import sys

# Set up Django environment when running script directly
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finwise_backend.settings')
django.setup()

from insights.utils import build_monthly_agg_for_user
from transactions.models import Transaction

User = get_user_model()

MODELS_DIR = os.path.join(BASE_DIR, 'insights_models')
os.makedirs(MODELS_DIR, exist_ok=True)

def create_features_from_series(series_values, window=3):
    """
    Given a numeric series (list/ndarray) of monthly expenses, produce features:
    - last N months values (lag features)
    - moving average, std
    Returns X (n_samples x n_features), y (n_samples)
    We'll create samples where target is expense at next month.
    """
    vals = np.array(series_values, dtype=float)
    X = []
    y = []
    for i in range(window, len(vals)):
        lag_vals = vals[i-window:i]  # previous `window` months
        feat = list(lag_vals) + [lag_vals.mean(), lag_vals.std()]
        X.append(feat)
        y.append(vals[i])
    return np.array(X), np.array(y)

def train_user_model(user, min_months=12, window=3):
    df = build_monthly_agg_for_user(user, months_back=24)
    # We'll predict 'expense' next month
    expenses = df['expense'].values
    if np.count_nonzero(expenses) == 0:
        return False  # nothing to learn
    if len(expenses) < min_months:
        return False
    X, y = create_features_from_series(expenses, window=window)
    if len(X) < 10:
        return False
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    # Save model
    model_path = os.path.join(MODELS_DIR, f'user_{user.id}_rf.pkl')
    joblib.dump({'model': model, 'window': window, 'score': score}, model_path)
    print(f"Saved model for user {user.username} -> {model_path} (R2: {score:.3f})")
    return True

def train_global_model(window=3):
    # Build dataset by stacking users' series where possible
    X_all = []
    y_all = []
    for user in User.objects.all():
        df = build_monthly_agg_for_user(user, months_back=36)
        expenses = df['expense'].values
        if len(expenses) < window + 6:
            continue
        X, y = create_features_from_series(expenses, window=window)
        if len(X) > 0:
            X_all.append(X)
            y_all.append(y)
    if not X_all:
        print("Not enough data for global model")
        return False
    X_all = np.vstack(X_all)
    y_all = np.concatenate(y_all)
    model = RandomForestRegressor(n_estimators=200, random_state=42)
    X_train, X_test, y_train, y_test = train_test_split(X_all, y_all, test_size=0.2, random_state=42)
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    model_path = os.path.join(MODELS_DIR, 'global_rf.pkl')
    joblib.dump({'model': model, 'window': window, 'score': score}, model_path)
    print(f"Saved global model -> {model_path} (R2: {score:.3f})")
    return True

def main():
    users = User.objects.all()
    print(f"Training models for {users.count()} users...")
    trained = 0
    for user in users:
        ok = train_user_model(user)
        if ok:
            trained += 1
    print(f"Trained {trained} user models")
    # always train global model
    train_global_model()

if __name__ == "__main__":
    main()
