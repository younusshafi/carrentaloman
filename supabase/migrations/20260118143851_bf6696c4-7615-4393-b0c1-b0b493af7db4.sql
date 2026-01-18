-- Create instalment_plans table for car purchase payment plans
CREATE TABLE public.instalment_plans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create instalment_payments table for tracking payments on instalment plans
CREATE TABLE public.instalment_payments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID REFERENCES public.instalment_plans(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create renter_instalments table for renter payment tracking
CREATE TABLE public.renter_instalments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    renter_id UUID REFERENCES public.renters(id) ON DELETE CASCADE,
    instalment_date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rental_km_logs table for tracking odometer readings
CREATE TABLE public.rental_km_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rental_session_id UUID REFERENCES public.rental_sessions(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    odometer INTEGER NOT NULL,
    amount NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.instalment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instalment_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renter_instalments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_km_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for instalment_plans
CREATE POLICY "Authenticated users can view instalment_plans" 
ON public.instalment_plans FOR SELECT USING (true);

CREATE POLICY "Admins and managers can insert instalment_plans" 
ON public.instalment_plans FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins and managers can update instalment_plans" 
ON public.instalment_plans FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete instalment_plans" 
ON public.instalment_plans FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for instalment_payments
CREATE POLICY "Authenticated users can view instalment_payments" 
ON public.instalment_payments FOR SELECT USING (true);

CREATE POLICY "Admins and managers can insert instalment_payments" 
ON public.instalment_payments FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins and managers can update instalment_payments" 
ON public.instalment_payments FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete instalment_payments" 
ON public.instalment_payments FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for renter_instalments
CREATE POLICY "Authenticated users can view renter_instalments" 
ON public.renter_instalments FOR SELECT USING (true);

CREATE POLICY "Admins and managers can insert renter_instalments" 
ON public.renter_instalments FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins and managers can update renter_instalments" 
ON public.renter_instalments FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete renter_instalments" 
ON public.renter_instalments FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for rental_km_logs
CREATE POLICY "Authenticated users can view rental_km_logs" 
ON public.rental_km_logs FOR SELECT USING (true);

CREATE POLICY "Admins and managers can insert rental_km_logs" 
ON public.rental_km_logs FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins and managers can update rental_km_logs" 
ON public.rental_km_logs FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role));

CREATE POLICY "Admins can delete rental_km_logs" 
ON public.rental_km_logs FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_instalment_plans_updated_at
BEFORE UPDATE ON public.instalment_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();