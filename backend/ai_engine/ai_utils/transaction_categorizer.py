import os
import joblib
import re
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from typing import Tuple, Dict

# --- CORRECTED PATHS ---
# Points to D:\finwise\backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Store models inside backend, consistent with Day 9
MODELS_DIR = os.path.join(BASE_DIR, 'ai_models')
os.makedirs(MODELS_DIR, exist_ok=True)
MODEL_PATH = os.path.join(MODELS_DIR, 'txn_cat_pipeline.pkl')
# --- END CORRECTION ---

# Simple rule-based mapping (keyword -> category) as quick fallback
RULES = {
    'uber': 'Transport',
    'ola': 'Transport',
    'taxi': 'Transport',
    'flight': 'Travel',
    'airline': 'Travel',
    'starbucks': 'Food & Beverage',
    'mcdonald': 'Food & Beverage',
    'dominos': 'Food & Beverage',
    'netflix': 'Entertainment',
    'amazon': 'Shopping',
    'flipkart': 'Shopping',
    'rent': 'Housing',
    'salary': 'Income',
    'payroll': 'Income',
    'electricity': 'Utilities',
    'phone': 'Utilities',
    'water': 'Utilities'
}

def normalize_text(s: str) -> str:
    s = s.lower()
    s = re.sub(r'[^a-z0-9\s]', ' ', s) # Remove punctuation
    s = re.sub(r'\s+', ' ', s).strip() # Remove extra spaces
    return s

def apply_rules(description: str) -> Tuple[str, float]:
    """
    Returns (category, confidence) if rule found, else (None, 0.0)
    Confidence is high for rules (0.95)
    """
    d = normalize_text(description)
    for k, cat in RULES.items():
        if k in d:
            return cat, 0.95
    return None, 0.0

def train(csv_path: str, text_col='description', label_col='category', test_size=0.2, random_state=42) -> Dict:
    """
    Train a simple TF-IDF + LogisticRegression pipeline on a CSV.
    Saves pipeline to MODEL_PATH.
    """
    df = pd.read_csv(csv_path)
    df = df[[text_col, label_col]].dropna()
    df[text_col] = df[text_col].astype(str).map(normalize_text)

    X = df[text_col].values
    y = df[label_col].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)

    # Create a pipeline: 1) Convert text to TF-IDF vectors, 2) Run Logistic Regression
    pipeline = make_pipeline(
        TfidfVectorizer(ngram_range=(1,2), min_df=1),
        LogisticRegression(max_iter=1000, class_weight='balanced', solver='liblinear')
    )

    pipeline.fit(X_train, y_train)
    preds = pipeline.predict(X_test)
    report = classification_report(y_test, preds, output_dict=True, zero_division=0)

    # Save pipeline
    joblib.dump({'pipeline': pipeline}, MODEL_PATH)
    return {'report': report}

def load_model():
    """
    Loads saved pipeline or returns None if not exists.
    """
    if os.path.exists(MODEL_PATH):
        pkg = joblib.load(MODEL_PATH)
        return pkg.get('pipeline') or pkg
    return None

def predict(description: str, top_k=3) -> Dict:
    """
    Predicts a category for a given transaction description.
    1. Tries rules first.
    2. Falls back to the ML model.
    """
    # 1) Try rules
    cat, conf = apply_rules(description)
    if cat:
        return {'category': cat, 'confidence': conf, 'candidates': [(cat, conf)]}

    # 2) Try ML model
    pipeline = load_model()
    if pipeline is None:
        return {'category': None, 'confidence': 0.0, 'candidates': []}

    norm_desc = normalize_text(description)

    try:
        # Get probabilities for all classes
        probs = pipeline.predict_proba([norm_desc])[0]
        classes = pipeline.classes_

        # Build (class, prob) list and sort it
        candidates = sorted(list(zip(classes, probs)), key=lambda x: x[1], reverse=True)[:top_k]
        top_cat, top_prob = candidates[0]

        return {
            'category': top_cat, 
            'confidence': float(top_prob), 
            'candidates': [(c, float(p)) for c, p in candidates]
        }
    except Exception as e:
        # Fallback if predict_proba fails (e.g., model trained on 1 class)
        print(f"Prediction error: {e}")
        label = pipeline.predict([norm_desc])[0]
        return {'category': label, 'confidence': 0.5, 'candidates': [(label, 0.5)]}