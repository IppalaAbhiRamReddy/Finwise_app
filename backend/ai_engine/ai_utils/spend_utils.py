# backend/ai_engine/ai_utils/spend_utils.py
import pandas as pd
from datetime import date
from transactions.models import Transaction

def build_monthly_category_matrix(user, months_back=36):
    """
    Returns a pandas DataFrame indexed by month-start (datetime.date) 
    with columns for each category, and values = total expense.
    """
    # 1. Define the full date range
    end = pd.Timestamp(date.today()).normalize()
    start = (end - pd.DateOffset(months=months_back - 1)).replace(day=1)
    start_date = start.date()

    # 2. Get all transactions for the user in that period
    qs = Transaction.objects.filter(
        user=user, 
        type='expense', # We only care about expenses
        date__gte=start_date
    ).order_by('date')

    if not qs.exists():
        # Return an empty dataframe if no transactions
        months_index = pd.date_range(start=start, periods=months_back, freq='MS')
        return pd.DataFrame(index=months_index)

    # 3. Convert queryset to DataFrame
    rows = [
        {
            'date': pd.to_datetime(t.date),
            'category': t.category.strip() or 'Uncategorized',
            'amount': float(t.amount)
        } for t in qs
    ]
    df = pd.DataFrame(rows)

    # Set 'date' as the index for time-series operations
    df = df.set_index('date')

    # 4. Create the pivot table
    # This groups by month ('M') and category, summing the amounts
    pivot = df.pivot_table(
        index=pd.Grouper(freq='MS'), # 'MS' = Month Start
        columns='category', 
        values='amount', 
        aggfunc='sum'
    ).fillna(0.0)

    # 5. Ensure all months are present
    # Create a full date range and re-index the pivot table
    # This fills in '0' for months with no spending
    full_month_range = pd.date_range(start=start, end=end, freq='MS')
    pivot = pivot.reindex(full_month_range, fill_value=0.0)

    # Convert the index from Datetime to Date for consistency
    pivot.index = pivot.index.date
    return pivot