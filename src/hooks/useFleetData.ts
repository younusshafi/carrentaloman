import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Car = Tables<'cars'>;

export function useFleetData() {
  const queryClient = useQueryClient();

  const carsQuery = useQuery({
    queryKey: ['cars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const addCarMutation = useMutation({
    mutationFn: async (car: TablesInsert<'cars'>) => {
      const { data, error } = await supabase
        .from('cars')
        .insert(car)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });

  const updateCarMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Car> & { id: string }) => {
      const { data, error } = await supabase
        .from('cars')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cars'] });
    },
  });

  return {
    cars: carsQuery.data || [],
    isLoading: carsQuery.isLoading,
    isError: carsQuery.isError,
    addCar: addCarMutation.mutateAsync,
    updateCar: updateCarMutation.mutateAsync,
    refetch: carsQuery.refetch,
  };
}

export function useCarDetail(carId: string | undefined) {
  const carQuery = useQuery({
    queryKey: ['car', carId],
    queryFn: async () => {
      if (!carId) return null;
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .eq('id', carId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!carId,
  });

  const rentalsQuery = useQuery({
    queryKey: ['car-rentals', carId],
    queryFn: async () => {
      if (!carId) return [];
      const { data, error } = await supabase
        .from('rental_sessions')
        .select(`*, renter:renters(*)`)
        .eq('car_id', carId)
        .order('start_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!carId,
  });

  const expensesQuery = useQuery({
    queryKey: ['car-expenses', carId],
    queryFn: async () => {
      if (!carId) return [];
      const { data, error } = await supabase
        .from('car_expenses')
        .select('*')
        .eq('car_id', carId)
        .order('expense_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!carId,
  });

  const maintenanceQuery = useQuery({
    queryKey: ['car-maintenance', carId],
    queryFn: async () => {
      if (!carId) return [];
      const { data, error } = await supabase
        .from('maintenance_tickets')
        .select('*')
        .eq('car_id', carId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!carId,
  });

  const finesQuery = useQuery({
    queryKey: ['car-fines', carId],
    queryFn: async () => {
      if (!carId) return [];
      const { data, error } = await supabase
        .from('traffic_fines')
        .select(`*, renter:renters(*)`)
        .eq('car_id', carId)
        .order('offence_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!carId,
  });

  const insuranceQuery = useQuery({
    queryKey: ['car-insurance', carId],
    queryFn: async () => {
      if (!carId) return null;
      const { data, error } = await supabase
        .from('insurance_records')
        .select('*')
        .eq('car_id', carId)
        .order('expiry_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!carId,
  });

  const regoQuery = useQuery({
    queryKey: ['car-rego', carId],
    queryFn: async () => {
      if (!carId) return null;
      const { data, error } = await supabase
        .from('rego_records')
        .select('*')
        .eq('car_id', carId)
        .order('expiry_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!carId,
  });

  const isLoading = carQuery.isLoading || rentalsQuery.isLoading || expensesQuery.isLoading;

  return {
    car: carQuery.data,
    rentals: rentalsQuery.data || [],
    expenses: expensesQuery.data || [],
    maintenanceTickets: maintenanceQuery.data || [],
    fines: finesQuery.data || [],
    insurance: insuranceQuery.data,
    rego: regoQuery.data,
    isLoading,
    isError: carQuery.isError,
  };
}
