-- =====================================================
-- FIX REMAINING WARN-LEVEL TABLE POLICIES
-- Restrict SELECT access to admin/manager only
-- =====================================================

-- =====================================================
-- 1. FIX: maintenance_tickets - Operational data exposed
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view maintenance_tickets" ON public.maintenance_tickets;

CREATE POLICY "Admins and managers can view maintenance_tickets" 
ON public.maintenance_tickets FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 2. FIX: rego_records - Registration data exposed
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view rego_records" ON public.rego_records;

CREATE POLICY "Admins and managers can view rego_records" 
ON public.rego_records FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 3. FIX: rental_km_logs - KM log data exposed
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view rental_km_logs" ON public.rental_km_logs;

CREATE POLICY "Admins and managers can view rental_km_logs" 
ON public.rental_km_logs FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));