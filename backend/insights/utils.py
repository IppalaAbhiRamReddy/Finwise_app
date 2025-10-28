# backend/insights/utils.py
import pandas as pd
from datetime import date
from decimal import Decimal
from django.db.models import Sum
from transactions.models import Transaction

def build_monthly_agg_for_user(user, months_back=6):
    """
    Returns a pandas DataFrame with columns: ['month','income','expense']
    month is a datetime.date (first day of month)
    """
    # Query user's transactions for the last `months_back` months
    today = date.today()
    start_year = today.year
    start_month = today.month
    # Naive start date calculation: go back months_back months
    # For simplicity use year-month arithmetic
    start = pd.Timestamp(today.year, today.month, 1) - pd.DateOffset(months=months_back-1)
    start_date = start.date()

    qs = Transaction.objects.filter(user=user, date__gte=start_date).order_by('date')

    # Build DataFrame from queryset
    rows = []
    for t in qs:
        rows.append({
            'date': pd.to_datetime(t.date),
            'amount': float(t.amount),
            'type': t.type,
            'category': t.category,
        })
    if not rows:
        # Return empty df with months back zeros
        months = pd.date_range(start=start, periods=months_back, freq='MS')
        df = pd.DataFrame({'month': months, 'income': 0.0, 'expense': 0.0})
        df['month'] = df['month'].dt.date
        return df

    df = pd.DataFrame(rows)
    df['month'] = df['date'].dt.to_period('M').dt.to_timestamp()
    # Sum incomes and expenses per month
    income = df[df['type'] == 'income'].groupby('month')['amount'].sum()
    expense = df[df['type'] == 'expense'].groupby('month')['amount'].sum()

    months = pd.date_range(start=start, periods=months_back, freq='MS')
    out = []
    for m in months:
        m_date = m.date()
        inc = float(income.get(m, 0.0)) if m in income.index else 0.0
        exp = float(expense.get(m, 0.0)) if m in expense.index else 0.0
        out.append({'month': m_date, 'income': inc, 'expense': exp})
    result_df = pd.DataFrame(out)
    return result_df
