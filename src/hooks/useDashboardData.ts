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

  // Fetch rental payments for revenue calculation
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

  // Compute stats from live data
  const cars = carsQuery.data || [];
  const activeRentals = rentalsQuery.data || [];
  const allRentals = allRentalsQuery.data || [];
  const payments = paymentsQuery.data || [];
  const expenses = expensesQuery.data || [];

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
                    finesQuery.isLoading || insuranceQuery.isLoading || regoQuery.isLoading;

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
    isLoading,
    isError,
  };
}
