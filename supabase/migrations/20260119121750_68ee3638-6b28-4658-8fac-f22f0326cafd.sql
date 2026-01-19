-- =====================================================
-- FIX ERROR-LEVEL SECURITY ISSUES
-- =====================================================

-- =====================================================
-- 1. FIX: renters_table_pii_exposure
-- Restrict renters table SELECT to admin/manager only
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view renters" ON public.renters;

CREATE POLICY "Admins and managers can view renters" 
ON public.renters FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 2. FIX: rental_payments_financial_exposure
-- Restrict rental_payments table SELECT to admin/manager only
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view rental_payments" ON public.rental_payments;

CREATE POLICY "Admins and managers can view rental_payments" 
ON public.rental_payments FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 3. FIX: cars_inventory_exposure
-- Restrict cars table SELECT to admin/manager only
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view cars" ON public.cars;

CREATE POLICY "Admins and managers can view cars" 
ON public.cars FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 4. FIX: profile_self_approval (privilege escalation)
-- Prevent users from modifying approval-related fields
-- =====================================================

-- Create a trigger function to prevent self-approval
CREATE OR REPLACE FUNCTION public.prevent_self_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- If approval fields are being modified
  IF (NEW.is_approved IS DISTINCT FROM OLD.is_approved 
      OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
      OR NEW.approved_by IS DISTINCT FROM OLD.approved_by) THEN
    -- Only admins can modify approval fields
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RAISE EXCEPTION 'Only admins can modify approval status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS enforce_approval_restriction ON public.profiles;

-- Create trigger to enforce approval restrictions
CREATE TRIGGER enforce_approval_restriction
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_approval();