import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: AppRole | null;
  display_name: string | null;
  is_approved: boolean;
  approved_at: string | null;
}

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<UserWithRole[]> => {
      // Fetch profiles (which have user_id linked to auth.users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, created_at, is_approved, approved_at');

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Create a map of user_id to role
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      // Combine the data
      const usersWithRoles = profiles?.map(profile => ({
        id: profile.user_id,
        email: '',
        created_at: profile.created_at,
        role: roleMap.get(profile.user_id) || null,
        display_name: profile.display_name,
        is_approved: profile.is_approved,
        approved_at: profile.approved_at,
      })) || [];

      return usersWithRoles;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole | null }) => {
      if (role === null) {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        // Check if user already has a role
        const { data: existing } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (existing) {
          // Update existing role
          const { error } = await supabase
            .from('user_roles')
            .update({ role })
            .eq('user_id', userId);
          if (error) throw error;
        } else {
          // Insert new role
          const { error } = await supabase
            .from('user_roles')
            .insert({ user_id: userId, role });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    },
  });

  const approveUserMutation = useMutation({
    mutationFn: async ({ userId, approve }: { userId: string; approve: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_approved: approve,
          approved_at: approve ? new Date().toISOString() : null,
        })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(approve ? 'User approved successfully' : 'User approval revoked');
    },
    onError: (error) => {
      console.error('Error updating approval:', error);
      toast.error('Failed to update user approval');
    },
  });

  return {
    users,
    isLoading,
    error,
    updateRole: updateRoleMutation.mutate,
    isUpdating: updateRoleMutation.isPending,
    approveUser: approveUserMutation.mutate,
    isApproving: approveUserMutation.isPending,
  };
}
