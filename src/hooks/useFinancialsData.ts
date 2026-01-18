import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type CarExpense = Tables<'car_expenses'>;

export function useFinancialsData() {
  const queryClient = useQueryClient();

  const expensesQuery = useQuery({
    queryKey: ['car-expenses-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_expenses')
        .select('*')
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const carsQuery = useQuery({
    queryKey: ['cars-for-financials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const rentalsQuery = useQuery({
    queryKey: ['rentals-for-financials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_sessions')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments-for-financials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_payments')
        .select('*')
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async (expense: TablesInsert<'car_expenses'>) => {
      const { data, error } = await supabase
        .from('car_expenses')
        .insert(expense)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-expenses-all'] });
    },
  });

  const expenses = expensesQuery.data || [];
  const cars = carsQuery.data || [];
  const rentals = rentalsQuery.data || [];
  const payments = paymentsQuery.data || [];

  // Calculate monthly stats
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyExpenses = expenses
    .filter(e => new Date(e.expense_date) >= startOfMonth)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const monthlyRevenue = payments
    .filter(p => new Date(p.payment_date) >= startOfMonth)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const netProfit = monthlyRevenue - monthlyExpenses;

  // Calculate car profitability
  const carProfitability = cars
    .filter(c => c.status !== 'sold')
    .map(car => {
      const carRentals = rentals.filter(r => r.car_id === car.id);
      const carExpenses = expenses.filter(e => e.car_id === car.id);
      const revenue = carRentals.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
      const expenseTotal = carExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      return {
        id: car.id,
        name: `${car.make} ${car.model}`,
        plate: car.plate_number,
        revenue,
        expenses: expenseTotal,
        profit: revenue - expenseTotal,
        roi: Number(car.purchase_price) > 0 
          ? (((revenue - expenseTotal) / Number(car.purchase_price)) * 100).toFixed(1) 
          : '0',
      };
    })
    .sort((a, b) => b.profit - a.profit);

  // Expense breakdown by type
  const expensesByType = expenses.reduce((acc, e) => {
    const type = e.expense_type || 'other';
    acc[type] = (acc[type] || 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const expenseBreakdown = Object.entries(expensesByType).map(([name, value], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    value,
    color: [
      'hsl(25, 95%, 53%)',
      'hsl(199, 89%, 48%)',
      'hsl(142, 76%, 36%)',
      'hsl(262, 83%, 58%)',
      'hsl(0, 84%, 60%)',
    ][index % 5],
  }));

  return {
    expenses,
    cars,
    payments,
    monthlyRevenue,
    monthlyExpenses,
    netProfit,
    carProfitability,
    expenseBreakdown,
    isLoading: expensesQuery.isLoading || carsQuery.isLoading,
    isError: expensesQuery.isError,
    addExpense: addExpenseMutation.mutateAsync,
    refetch: expensesQuery.refetch,
  };
}
