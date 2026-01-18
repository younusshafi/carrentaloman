import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  fleet: {
    total: number;
    available: number;
    rented: number;
    maintenance: number;
    reserved: number;
  };
  financial: {
    monthlyRevenue: number;
    outstandingPayments: number;
    netProfit: number;
  };
  operations: {
    activeRentals: number;
    upcomingReturns: number;
  };
}

export function useDashboardData() {
  // Fetch all cars
  const carsQuery = useQuery({
    queryKey: ['dashboard-cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch active rental sessions with car and renter info
  const rentalsQuery = useQuery({
    queryKey: ['dashboard-rentals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_sessions')
        .select(`
          *,
          car:cars(*),
          renter:renters(*)
        `)
        .eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all rental sessions for stats
  const allRentalsQuery = useQuery({
    queryKey: ['dashboard-all-rentals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_sessions')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch maintenance tickets
  const maintenanceQuery = useQuery({
    queryKey: ['dashboard-maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tickets')
        .select(`
          *,
          car:cars(plate_number, make, model)
        `)
        .neq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch traffic fines
  const finesQuery = useQuery({
    queryKey: ['dashboard-fines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select(`
          *,
          car:cars(plate_number, make, model)
        `)
        .eq('is_paid', false)
        .order('offence_date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch insurance records expiring soon (next 45 days)
  const insuranceQuery = useQuery({
    queryKey: ['dashboard-insurance'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const in45Days = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('insurance_records')
        .select(`
          *,
          car:cars(plate_number, make, model)
        `)
        .gte('expiry_date', today)
        .lte('expiry_date', in45Days)
        .order('expiry_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch rego records expiring soon (next 45 days)
  const regoQuery = useQuery({
    queryKey: ['dashboard-rego'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const in45Days = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('rego_records')
        .select(`
          *,
          car:cars(plate_number, make, model)
        `)
        .gte('expiry_date', today)
        .lte('expiry_date', in45Days)
        .order('expiry_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch rental payments for revenue calculation (current month)
  const paymentsQuery = useQuery({
    queryKey: ['dashboard-payments'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('rental_payments')
        .select('*')
        .gte('payment_date', startOfMonth.toISOString().split('T')[0]);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch car expenses for this month
  const expensesQuery = useQuery({
    queryKey: ['dashboard-expenses'],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('car_expenses')
        .select('*')
        .gte('expense_date', startOfMonth.toISOString().split('T')[0]);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch last 6 months of payments for chart
  const historicalPaymentsQuery = useQuery({
    queryKey: ['dashboard-historical-payments'],
    queryFn: async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setDate(1);
      
      const { data, error } = await supabase
        .from('rental_payments')
        .select('amount, payment_date')
        .gte('payment_date', sixMonthsAgo.toISOString().split('T')[0]);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch last 6 months of expenses for chart
  const historicalExpensesQuery = useQuery({
    queryKey: ['dashboard-historical-expenses'],
    queryFn: async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setDate(1);
      
      const { data, error } = await supabase
        .from('car_expenses')
        .select('amount, expense_date')
        .gte('expense_date', sixMonthsAgo.toISOString().split('T')[0]);
      if (error) throw error;
      return data || [];
    },
  });

  // Compute stats from live data
  const cars = carsQuery.data || [];
  const activeRentals = rentalsQuery.data || [];
  const allRentals = allRentalsQuery.data || [];
  const payments = paymentsQuery.data || [];
  const expenses = expensesQuery.data || [];
  const historicalPayments = historicalPaymentsQuery.data || [];
  const historicalExpenses = historicalExpensesQuery.data || [];

  // Compute monthly revenue/expense chart data
  const getMonthKey = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const getMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Get last 6 months
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  }

  // Aggregate payments by month
  const revenueByMonth = new Map<string, number>();
  historicalPayments.forEach(p => {
    const key = getMonthKey(p.payment_date);
    revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + Number(p.amount || 0));
  });

  // Aggregate expenses by month
  const expensesByMonth = new Map<string, number>();
  historicalExpenses.forEach(e => {
    const key = getMonthKey(e.expense_date);
    expensesByMonth.set(key, (expensesByMonth.get(key) || 0) + Number(e.amount || 0));
  });

  // Build chart data
  const revenueChartData = months.map(monthKey => ({
    month: getMonthLabel(monthKey),
    revenue: Math.round(revenueByMonth.get(monthKey) || 0),
    expenses: Math.round(expensesByMonth.get(monthKey) || 0),
  }));

  const stats: DashboardStats = {
    fleet: {
      total: cars.length,
      available: cars.filter(c => c.status === 'available').length,
      rented: cars.filter(c => c.status === 'rented').length,
      maintenance: cars.filter(c => c.status === 'maintenance').length,
      reserved: cars.filter(c => c.status === 'reserved').length,
    },
    financial: {
      monthlyRevenue: payments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      outstandingPayments: 0, // Would need more complex calculation
      netProfit: payments.reduce((sum, p) => sum + Number(p.amount || 0), 0) - 
                 expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    },
    operations: {
      activeRentals: activeRentals.length,
      upcomingReturns: allRentals.filter(r => {
        if (r.status !== 'active' || !r.end_date) return false;
        const endDate = new Date(r.end_date);
        const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        return endDate <= in7Days;
      }).length,
    },
  };

  const isLoading = carsQuery.isLoading || rentalsQuery.isLoading || maintenanceQuery.isLoading || 
                    finesQuery.isLoading || insuranceQuery.isLoading || regoQuery.isLoading ||
                    historicalPaymentsQuery.isLoading || historicalExpensesQuery.isLoading;

  const isError = carsQuery.isError || rentalsQuery.isError || maintenanceQuery.isError || 
                  finesQuery.isError || insuranceQuery.isError || regoQuery.isError;

  return {
    stats,
    cars,
    activeRentals,
    maintenanceTickets: maintenanceQuery.data || [],
    unpaidFines: finesQuery.data || [],
    expiringInsurance: insuranceQuery.data || [],
    expiringRego: regoQuery.data || [],
    revenueChartData,
    isLoading,
    isError,
  };
}
