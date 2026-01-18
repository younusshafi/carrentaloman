import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type InsuranceRecord = Tables<'insurance_records'> & {
  car?: { plate_number: string; make: string; model: string } | null;
};

export type RegoRecord = Tables<'rego_records'> & {
  car?: { plate_number: string; make: string; model: string } | null;
};

export function useInsuranceData() {
  const queryClient = useQueryClient();
  const today = new Date();
  const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
  const in45Days = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);

  const insuranceQuery = useQuery({
    queryKey: ['insurance-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('insurance_records')
        .select(`
          *,
          car:cars(plate_number, make, model)
        `)
        .order('expiry_date', { ascending: true });
      if (error) throw error;
      return (data || []) as InsuranceRecord[];
    },
  });

  const regoQuery = useQuery({
    queryKey: ['rego-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rego_records')
        .select(`
          *,
          car:cars(plate_number, make, model)
        `)
        .order('expiry_date', { ascending: true });
      if (error) throw error;
      return (data || []) as RegoRecord[];
    },
  });

  const carsQuery = useQuery({
    queryKey: ['cars-for-insurance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('id, plate_number, make, model');
      if (error) throw error;
      return data || [];
    },
  });

  const addInsuranceMutation = useMutation({
    mutationFn: async (record: TablesInsert<'insurance_records'>) => {
      const { data, error } = await supabase
        .from('insurance_records')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-records'] });
    },
  });

  const addRegoMutation = useMutation({
    mutationFn: async (record: TablesInsert<'rego_records'>) => {
      const { data, error } = await supabase
        .from('rego_records')
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rego-records'] });
    },
  });

  const insuranceRecords = insuranceQuery.data || [];
  const regoRecords = regoQuery.data || [];

  // Categorize insurance
  const expiredInsurance = insuranceRecords.filter(r => new Date(r.expiry_date) < today);
  const criticalInsurance = insuranceRecords.filter(r => {
    const expiry = new Date(r.expiry_date);
    return expiry >= today && expiry <= in15Days;
  });
  const warningInsurance = insuranceRecords.filter(r => {
    const expiry = new Date(r.expiry_date);
    return expiry > in15Days && expiry <= in45Days;
  });
  const validInsurance = insuranceRecords.filter(r => new Date(r.expiry_date) > in45Days);

  // Categorize rego
  const expiredRego = regoRecords.filter(r => new Date(r.expiry_date) < today);
  const criticalRego = regoRecords.filter(r => {
    const expiry = new Date(r.expiry_date);
    return expiry >= today && expiry <= in15Days;
  });
  const warningRego = regoRecords.filter(r => {
    const expiry = new Date(r.expiry_date);
    return expiry > in15Days && expiry <= in45Days;
  });
  const validRego = regoRecords.filter(r => new Date(r.expiry_date) > in45Days);

  const getDaysUntilExpiry = (date: string) => {
    const expiry = new Date(date);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (date: string) => {
    const days = getDaysUntilExpiry(date);
    if (days < 0) return { label: 'Expired', className: 'bg-destructive/15 text-destructive' };
    if (days <= 15) return { label: `${days} days`, className: 'bg-destructive/15 text-destructive' };
    if (days <= 45) return { label: `${days} days`, className: 'bg-warning/15 text-warning' };
    return { label: `${days} days`, className: 'bg-success/15 text-success' };
  };

  return {
    insuranceRecords,
    regoRecords,
    expiredInsurance,
    criticalInsurance,
    warningInsurance,
    validInsurance,
    expiredRego,
    criticalRego,
    warningRego,
    validRego,
    cars: carsQuery.data || [],
    getDaysUntilExpiry,
    getExpiryStatus,
    isLoading: insuranceQuery.isLoading || regoQuery.isLoading,
    isError: insuranceQuery.isError || regoQuery.isError,
    addInsurance: addInsuranceMutation.mutateAsync,
    addRego: addRegoMutation.mutateAsync,
    refetch: () => {
      insuranceQuery.refetch();
      regoQuery.refetch();
    },
  };
}
