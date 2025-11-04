import os
import pandas as pd
import sys
import django

# --- Django Setup ---
# Points to D:\finwise\backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'finwise_backend.settings')
django.setup()
# --- End Django Setup ---

from ai_engine.ai_utils.transaction_categorizer import train, MODEL_PATH

# Use the app's directory for the data file
APP_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(APP_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)
SAMPLE_CSV = os.path.join(DATA_DIR, 'sample_txn_categories.csv')

# If sample CSV doesn't exist, create a small seed dataset
if not os.path.exists(SAMPLE_CSV):
    print(f"No sample CSV found. Creating one at {SAMPLE_CSV}...")
    sample = [
        ("Salary October", "Income"),
        ("Salary Nov", "Income"), 
        ("Monthly Rent", "Housing"),
        ("House Rent payment", "Housing"), 
        ("Uber ride home", "Transport"),
        ("Ola cab", "Transport"),
        ("Starbucks latte", "Food & Beverage"),
        ("Dominos order", "Food & Beverage"),
        ("Zomato food", "Food & Beverage"), 
        ("Netflix subscription", "Entertainment"),
        ("Movie tickets", "Entertainment"), 
        ("Amazon purchase: headphones", "Shopping"),
        ("Flipkart - shoes", "Shopping"),
        ("Electricity bill", "Utilities"),
        ("Water bill", "Utilities"),
        ("Mobile Phone bill", "Utilities"), 
        ("Flight booking - NSE", "Travel"),
        ("Train ticket", "Travel"), 
        ("Grocery at BigBasket", "Groceries"),
        ("Grocery at LocalStore", "Groceries"),
    ]
    df = pd.DataFrame(sample, columns=['description', 'category'])
    df.to_csv(SAMPLE_CSV, index=False)
    print("Created sample CSV.")

print(f"\n--- Training classifier using: {SAMPLE_CSV} ---")
metrics = train(SAMPLE_CSV, test_size=0.5)
print("\n--- Training complete. ---")
print("Model saved at:", MODEL_PATH)
print("\n--- Classification Report (Test Set) ---")

# Pretty-print the report
report = metrics.get('report', {})
if 'accuracy' in report:
    print(f"\nAccuracy: {report['accuracy']:.2f}")

for label, scores in report.items():
    if isinstance(scores, dict):
        print(f"\nCategory: {label}")
        print(f"  Precision: {scores.get('precision', 0):.2f}")
        print(f"  Recall:    {scores.get('recall', 0):.2f}")
        print(f"  F1-Score:  {scores.get('f1-score', 0):.2f}")