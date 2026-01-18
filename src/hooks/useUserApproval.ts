import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserApproval() {
  const { user } = useAuth();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkApproval() {
      if (!user) {
        setIsApproved(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_approved')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking approval status:', error);
          setIsApproved(false);
        } else {
          setIsApproved(data?.is_approved ?? false);
        }
      } catch (err) {
        console.error('Error checking approval status:', err);
        setIsApproved(false);
      } finally {
        setLoading(false);
      }
    }

    checkApproval();
  }, [user]);

  return { isApproved, loading };
}
