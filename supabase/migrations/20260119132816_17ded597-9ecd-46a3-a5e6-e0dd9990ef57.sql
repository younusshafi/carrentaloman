-- =====================================================
-- FIX ALL ERROR AND WARN LEVEL SECURITY ISSUES
-- Restrict sensitive data access to admin/manager only
-- =====================================================

-- =====================================================
-- 1. FIX: profiles table - Phone numbers exposed
-- Users can view own profile; admins/managers can view all
-- =====================================================
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile or admins/managers view all" 
ON public.profiles FOR SELECT TO authenticated
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'manager'::app_role)
);

-- =====================================================
-- 2. FIX: rental_sessions - Contract/financial data exposed
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view rental_sessions" ON public.rental_sessions;

CREATE POLICY "Admins and managers can view rental_sessions" 
ON public.rental_sessions FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 3. FIX: car_expenses - Expense amounts exposed
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view car_expenses" ON public.car_expenses;

CREATE POLICY "Admins and managers can view car_expenses" 
ON public.car_expenses FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 4. FIX: traffic_fines - Fine records exposed
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view traffic_fines" ON public.traffic_fines;

CREATE POLICY "Admins and managers can view traffic_fines" 
ON public.traffic_fines FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 5. FIX: insurance_records - Policy numbers/premiums exposed
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view insurance_records" ON public.insurance_records;

CREATE POLICY "Admins and managers can view insurance_records" 
ON public.insurance_records FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 6. FIX: instalment_plans - Customer payment plans exposed
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view instalment_plans" ON public.instalment_plans;

CREATE POLICY "Admins and managers can view instalment_plans" 
ON public.instalment_plans FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 7. FIX: instalment_payments - Payment installments exposed
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view instalment_payments" ON public.instalment_payments;

CREATE POLICY "Admins and managers can view instalment_payments" 
ON public.instalment_payments FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

-- =====================================================
-- 8. FIX: renter_instalments - Renter payment schedules exposed
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view renter_instalments" ON public.renter_instalments;

CREATE POLICY "Admins and managers can view renter_instalments" 
ON public.renter_instalments FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));