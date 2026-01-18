import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type RentalSession = Tables<'rental_sessions'> & {
  car?: Tables<'cars'> | null;
  renter?: Tables<'renters'> | null;
};

export function useRentalsData() {
  const queryClient = useQueryClient();

  const rentalsQuery = useQuery({
    queryKey: ['rentals-with-relations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_sessions')
        .select(`
          *,
          car:cars(*),
          renter:renters(*)
        `)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return (data || []) as RentalSession[];
    },
  });

  const carsQuery = useQuery({
    queryKey: ['cars-for-rentals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'available');
      if (error) throw error;
      return data || [];
    },
  });

  const rentersQuery = useQuery({
    queryKey: ['renters-for-rentals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('renters')
        .select('*')
        .eq('is_blacklisted', false);
      if (error) throw error;
      return data || [];
    },
  });

  const createRentalMutation = useMutation({
    mutationFn: async (rental: TablesInsert<'rental_sessions'>) => {
      const { data, error } = await supabase
        .from('rental_sessions')
        .insert(rental)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals-with-relations'] });
      queryClient.invalidateQueries({ queryKey: ['cars-for-rentals'] });
    },
  });

  const rentals = rentalsQuery.data || [];
  const activeRentals = rentals.filter(r => r.status === 'active' || r.status === 'extended');
  const completedRentals = rentals.filter(r => r.status === 'completed' || r.status === 'cancelled');

  const timelineData = activeRentals.map(rental => {
    const startDate = new Date(rental.start_date);
    const endDate = rental.end_date ? new Date(rental.end_date) : new Date();
    const today = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
      ...rental,
      progress,
      daysRemaining,
      totalDays,
    };
  });

  return {
    rentals,
    activeRentals,
    completedRentals,
    timelineData,
    availableCars: carsQuery.data || [],
    availableRenters: rentersQuery.data || [],
    weeklyRevenue: activeRentals.reduce((sum, r) => sum + Number(r.weekly_rent || 0), 0),
    endingSoon: timelineData.filter(r => r.daysRemaining <= 7 && r.daysRemaining > 0).length,
    isLoading: rentalsQuery.isLoading,
    isError: rentalsQuery.isError,
    createRental: createRentalMutation.mutateAsync,
    refetch: rentalsQuery.refetch,
  };
}
