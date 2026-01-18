import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

export type MaintenanceTicket = Tables<'maintenance_tickets'> & {
  car?: { plate_number: string; make: string; model: string } | null;
};

export function useMaintenanceData() {
  const queryClient = useQueryClient();

  const ticketsQuery = useQuery({
    queryKey: ['maintenance-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_tickets')
        .select(`
          *,
          car:cars(plate_number, make, model)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as MaintenanceTicket[];
    },
  });

  const carsQuery = useQuery({
    queryKey: ['cars-for-maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cars')
        .select('id, plate_number, make, model');
      if (error) throw error;
      return data || [];
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (ticket: TablesInsert<'maintenance_tickets'>) => {
      const { data, error } = await supabase
        .from('maintenance_tickets')
        .insert(ticket)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Tables<'maintenance_tickets'>> & { id: string }) => {
      const { data, error } = await supabase
        .from('maintenance_tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-tickets'] });
    },
  });

  const tickets = ticketsQuery.data || [];
  const openTickets = tickets.filter(t => t.status === 'open');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
  const completedTickets = tickets.filter(t => t.status === 'completed');

  const totalCost = completedTickets.reduce((sum, t) => sum + Number(t.actual_cost || 0), 0);

  return {
    tickets,
    openTickets,
    inProgressTickets,
    completedTickets,
    totalCost,
    cars: carsQuery.data || [],
    isLoading: ticketsQuery.isLoading,
    isError: ticketsQuery.isError,
    createTicket: createTicketMutation.mutateAsync,
    updateTicket: updateTicketMutation.mutateAsync,
    refetch: ticketsQuery.refetch,
  };
}
