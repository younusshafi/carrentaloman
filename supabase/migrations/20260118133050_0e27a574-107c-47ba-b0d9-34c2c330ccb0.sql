
-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =====================
-- CORE TABLES (No Dependencies)
-- =====================

-- Cars table
CREATE TABLE public.cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    body_type TEXT,
    color TEXT,
    plate_number TEXT NOT NULL UNIQUE,
    vin TEXT,
    tracker_device_type TEXT,
    tracker_imei TEXT,
    purchase_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    purchase_date DATE,
    weekly_rent DECIMAL(10,2),
    bond_amount DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'reserved', 'sold')),
    images TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Renters table
CREATE TABLE public.renters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    address TEXT,
    license_number TEXT,
    license_expiry DATE,
    license_document_url TEXT,
    is_blacklisted BOOLEAN NOT NULL DEFAULT false,
    blacklist_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- DEPENDENT TABLES (With Foreign Keys - Nullable for flexible import)
-- =====================

-- Rental sessions table
CREATE TABLE public.rental_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    renter_id UUID REFERENCES public.renters(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    weekly_rent DECIMAL(10,2) NOT NULL,
    bond_amount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'extended', 'cancelled')),
    signature_url TEXT,
    contract_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rental payments table
CREATE TABLE public.rental_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_session_id UUID REFERENCES public.rental_sessions(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('cash', 'bank_transfer', 'card', 'other')),
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Car expenses table
CREATE TABLE public.car_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    expense_type TEXT NOT NULL CHECK (expense_type IN ('service', 'tyres', 'oil', 'repairs', 'insurance', 'rego', 'fuel', 'cleaning', 'other')),
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Maintenance tickets table
CREATE TABLE public.maintenance_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to TEXT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Traffic fines table
CREATE TABLE public.traffic_fines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    renter_id UUID REFERENCES public.renters(id) ON DELETE SET NULL,
    offence_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    location TEXT,
    fine_number TEXT,
    is_paid BOOLEAN NOT NULL DEFAULT false,
    paid_date DATE,
    paid_by TEXT CHECK (paid_by IN ('renter', 'company', 'other')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insurance records table
CREATE TABLE public.insurance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    provider TEXT NOT NULL,
    policy_number TEXT NOT NULL,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    premium_amount DECIMAL(10,2),
    coverage_type TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Rego records table
CREATE TABLE public.rego_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    rego_number TEXT NOT NULL,
    state TEXT,
    expiry_date DATE NOT NULL,
    renewal_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================
-- ENABLE RLS ON ALL TABLES
-- =====================

ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rego_records ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS POLICIES - Authenticated users can read all, admins/managers can write
-- =====================

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Cars policies
CREATE POLICY "Authenticated users can view cars" ON public.cars
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can insert cars" ON public.cars
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can update cars" ON public.cars
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete cars" ON public.cars
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Renters policies
CREATE POLICY "Authenticated users can view renters" ON public.renters
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can insert renters" ON public.renters
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can update renters" ON public.renters
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete renters" ON public.renters
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Rental sessions policies
CREATE POLICY "Authenticated users can view rental_sessions" ON public.rental_sessions
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can insert rental_sessions" ON public.rental_sessions
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can update rental_sessions" ON public.rental_sessions
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete rental_sessions" ON public.rental_sessions
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Rental payments policies
CREATE POLICY "Authenticated users can view rental_payments" ON public.rental_payments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can insert rental_payments" ON public.rental_payments
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can update rental_payments" ON public.rental_payments
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete rental_payments" ON public.rental_payments
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Car expenses policies
CREATE POLICY "Authenticated users can view car_expenses" ON public.car_expenses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can insert car_expenses" ON public.car_expenses
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can update car_expenses" ON public.car_expenses
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete car_expenses" ON public.car_expenses
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Maintenance tickets policies
CREATE POLICY "Authenticated users can view maintenance_tickets" ON public.maintenance_tickets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can insert maintenance_tickets" ON public.maintenance_tickets
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can update maintenance_tickets" ON public.maintenance_tickets
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete maintenance_tickets" ON public.maintenance_tickets
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Traffic fines policies
CREATE POLICY "Authenticated users can view traffic_fines" ON public.traffic_fines
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can insert traffic_fines" ON public.traffic_fines
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can update traffic_fines" ON public.traffic_fines
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete traffic_fines" ON public.traffic_fines
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Insurance records policies
CREATE POLICY "Authenticated users can view insurance_records" ON public.insurance_records
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can insert insurance_records" ON public.insurance_records
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can update insurance_records" ON public.insurance_records
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete insurance_records" ON public.insurance_records
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Rego records policies
CREATE POLICY "Authenticated users can view rego_records" ON public.rego_records
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and managers can insert rego_records" ON public.rego_records
    FOR INSERT TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins and managers can update rego_records" ON public.rego_records
    FOR UPDATE TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete rego_records" ON public.rego_records
    FOR DELETE TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- =====================
-- TRIGGERS FOR updated_at
-- =====================

CREATE TRIGGER update_cars_updated_at
    BEFORE UPDATE ON public.cars
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_renters_updated_at
    BEFORE UPDATE ON public.renters
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rental_sessions_updated_at
    BEFORE UPDATE ON public.rental_sessions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_maintenance_tickets_updated_at
    BEFORE UPDATE ON public.maintenance_tickets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- INDEXES FOR PERFORMANCE
-- =====================

CREATE INDEX idx_cars_status ON public.cars(status);
CREATE INDEX idx_cars_plate_number ON public.cars(plate_number);
CREATE INDEX idx_renters_phone ON public.renters(phone);
CREATE INDEX idx_renters_blacklisted ON public.renters(is_blacklisted);
CREATE INDEX idx_rental_sessions_car_id ON public.rental_sessions(car_id);
CREATE INDEX idx_rental_sessions_renter_id ON public.rental_sessions(renter_id);
CREATE INDEX idx_rental_sessions_status ON public.rental_sessions(status);
CREATE INDEX idx_rental_payments_session_id ON public.rental_payments(rental_session_id);
CREATE INDEX idx_car_expenses_car_id ON public.car_expenses(car_id);
CREATE INDEX idx_maintenance_tickets_car_id ON public.maintenance_tickets(car_id);
CREATE INDEX idx_maintenance_tickets_status ON public.maintenance_tickets(status);
CREATE INDEX idx_traffic_fines_car_id ON public.traffic_fines(car_id);
CREATE INDEX idx_traffic_fines_renter_id ON public.traffic_fines(renter_id);
CREATE INDEX idx_insurance_records_car_id ON public.insurance_records(car_id);
CREATE INDEX idx_insurance_records_expiry ON public.insurance_records(expiry_date);
CREATE INDEX idx_rego_records_car_id ON public.rego_records(car_id);
CREATE INDEX idx_rego_records_expiry ON public.rego_records(expiry_date);
