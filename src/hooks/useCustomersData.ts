import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Renter = Tables<'renters'>;

export function useCustomersData() {
  const queryClient = useQueryClient();

  const rentersQuery = useQuery({
    queryKey: ['renters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('renters')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const rentalsQuery = useQuery({
    queryKey: ['rental-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_sessions')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const finesQuery = useQuery({
    queryKey: ['traffic-fines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const addRenterMutation = useMutation({
    mutationFn: async (renter: TablesInsert<'renters'>) => {
      const { data, error } = await supabase
        .from('renters')
        .insert(renter)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renters'] });
    },
  });

  const getRenterStats = (renterId: string) => {
    const rentals = rentalsQuery.data?.filter(r => r.renter_id === renterId) || [];
    const fines = finesQuery.data?.filter(f => f.renter_id === renterId) || [];
    const unpaidFines = fines.filter(f => !f.is_paid);
    const totalSpent = rentals.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

    return {
      totalRentals: rentals.length,
      activeRentals: rentals.filter(r => r.status === 'active').length,
      totalFines: fines.length,
      unpaidFines: unpaidFines.length,
      outstandingAmount: unpaidFines.reduce((sum, f) => sum + Number(f.amount), 0),
      totalSpent,
    };
  };

  const renters = rentersQuery.data || [];
  const rentals = rentalsQuery.data || [];

  return {
    renters,
    activeRenters: renters.filter(r => !r.is_blacklisted),
    blacklistedRenters: renters.filter(r => r.is_blacklisted),
    currentlyRenting: renters.filter(r => 
      rentals.some(s => s.renter_id === r.id && s.status === 'active')
    ).length,
    withUnpaidFines: renters.filter(r => {
      const stats = getRenterStats(r.id);
      return stats.unpaidFines > 0;
    }).length,
    getRenterStats,
    isLoading: rentersQuery.isLoading || rentalsQuery.isLoading || finesQuery.isLoading,
    isError: rentersQuery.isError,
    addRenter: addRenterMutation.mutateAsync,
    refetch: rentersQuery.refetch,
  };
}
