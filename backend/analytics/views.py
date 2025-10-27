from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Q
from django.db.models.functions import TruncMonth
from datetime import date, timedelta
from decimal import Decimal

# --- 1. Import the cache ---
from django.core.cache import cache

from transactions.models import Transaction

# (Helper function 'get_analytics_queryset' stays the same)
def get_analytics_queryset(request):
    user_id = request.query_params.get('user_id', None)
    qs = Transaction.objects.all()
    if user_id:
        if not request.user.role == 'admin':
            return None
        qs = qs.filter(user__id=user_id)
    else:
        qs = qs.filter(user=request.user)
    return qs


class MonthlySpendingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        
        # --- 2. Create a unique cache key ---
        # This key is specific to this user and this view
        user_id = request.user.id
        cache_key = f'monthly_spending_user_{user_id}'

        # --- 3. Try to get data from cache ---
        cached_data = cache.get(cache_key)
        if cached_data:
            # If data is found, return it immediately
            return Response({'months': cached_data})

        # --- 4. If not in cache, run the expensive query ---
        # (This is all your original logic)
        qs = get_analytics_queryset(request)
        if qs is None:
            return Response({'detail': 'Forbidden'}, status=403)
        
        months = int(request.query_params.get('months', 6))
        today = date.today()
        end_month = today.replace(day=1)
        start_month = (end_month - timedelta(days=(months - 1) * 31)).replace(day=1)
        qs = qs.filter(date__gte=start_month, date__lte=today)
        
        incomes = qs.filter(type='income') \
            .annotate(month=TruncMonth('date')) \
            .values('month') \
            .annotate(total=Sum('amount')) \
            .order_by('month')
        expenses = qs.filter(type='expense') \
            .annotate(month=TruncMonth('date')) \
            .values('month') \
            .annotate(total=Sum('amount')) \
            .order_by('month')

        months_list = []
        cur = start_month
        while cur <= end_month:
            months_list.append(cur)
            if cur.month == 12:
                cur = cur.replace(year=cur.year + 1, month=1)
            else:
                cur = cur.replace(month=cur.month + 1)

        income_map = {item['month']: item['total'] or Decimal('0') for item in incomes}
        expense_map = {item['month']: item['total'] or Decimal('0') for item in expenses}

        data = []
        for m in months_list:
            inc = income_map.get(m, Decimal('0'))
            exp = expense_map.get(m, Decimal('0'))
            data.append({
                'month': m.isoformat(),
                'income': str(inc),
                'expense': str(exp),
            })

        # --- 5. Save the final result to the cache ---
        # We'll save it for 15 minutes (900 seconds)
        cache.set(cache_key, data, timeout=(60 * 15))

        return Response({'months': data})

# (CategorySpendingView stays the same)
class CategorySpendingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = get_analytics_queryset(request)
        if qs is None:
            return Response({'detail': 'Forbidden'}, status=403)
        start = request.query_params.get('start', None)
        end = request.query_params.get('end', None)
        if start:
            qs = qs.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        cat = qs.filter(type='expense').values('category').annotate(total=Sum('amount')).order_by('-total')
        data = [{'category': c['category'], 'total': str(c['total'] or '0.00')} for c in cat]
        return Response({'categories': data})

# (SavingsVsExpenseView stays the same)
class SavingsVsExpenseView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = get_analytics_queryset(request)
        if qs is None:
            return Response({'detail': 'Forbidden'}, status=403)
        total_income = qs.filter(type='income').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_expense = qs.filter(type='expense').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        savings = total_income - total_expense
        return Response({
            'total_income': str(total_income),
            'total_expense': str(total_expense),
            'savings': str(savings)
        })