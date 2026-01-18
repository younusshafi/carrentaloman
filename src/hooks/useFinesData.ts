import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type TrafficFine = Tables<'traffic_fines'> & {
  car?: Tables<'cars'> | null;
  renter?: Tables<'renters'> | null;
};

export function useFinesData() {
  const queryClient = useQueryClient();

  const finesQuery = useQuery({
    queryKey: ['fines-with-relations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .select(`
          *,
          car:cars(id, plate_number, make, model),
          renter:renters(id, first_name, last_name, phone)
        `)
        .order('offence_date', { ascending: false });
      if (error) throw error;
      return (data || []) as TrafficFine[];
    },
  });

  const carsQuery = useQuery({
    queryKey: ['cars-for-fines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('id, plate_number, make, model');
      if (error) throw error;
      return data || [];
    },
  });

  const rentersQuery = useQuery({
    queryKey: ['renters-for-fines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('renters')
        .select('id, first_name, last_name, phone');
      if (error) throw error;
      return data || [];
    },
  });

  const addFineMutation = useMutation({
    mutationFn: async (fine: TablesInsert<'traffic_fines'>) => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .insert(fine)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines-with-relations'] });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: async ({ id, paid_by }: { id: string; paid_by: string }) => {
      const { data, error } = await supabase
        .from('traffic_fines')
        .update({ 
          is_paid: true, 
          paid_date: new Date().toISOString().split('T')[0],
          paid_by 
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fines-with-relations'] });
    },
  });

  const fines = finesQuery.data || [];
  const unpaidFines = fines.filter(f => !f.is_paid);
  const paidFines = fines.filter(f => f.is_paid);

  // Find repeat offenders
  const renterFineCount = fines.reduce((acc, fine) => {
    if (fine.renter_id) {
      acc[fine.renter_id] = (acc[fine.renter_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const repeatOffenders = Object.entries(renterFineCount)
    .filter(([_, count]) => count >= 2)
    .map(([renterId, count]) => {
      const renter = rentersQuery.data?.find(r => r.id === renterId);
      return { renter, count };
    });

  return {
    fines,
    unpaidFines,
    paidFines,
    totalUnpaid: unpaidFines.reduce((sum, f) => sum + Number(f.amount), 0),
    totalPaid: paidFines.reduce((sum, f) => sum + Number(f.amount), 0),
    repeatOffenders,
    renterFineCount,
    cars: carsQuery.data || [],
    renters: rentersQuery.data || [],
    isLoading: finesQuery.isLoading,
    isError: finesQuery.isError,
    addFine: addFineMutation.mutateAsync,
    markPaid: markPaidMutation.mutateAsync,
    refetch: finesQuery.refetch,
  };
}
