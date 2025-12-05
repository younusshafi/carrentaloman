// Car/Vehicle Types
export type CarStatus = 'available' | 'rented' | 'maintenance' | 'reserved' | 'sold';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  body_type: string;
  color: string;
  plate_number: string;
  secondary_plate?: string;
  tracker_device_type?: string;
  tracker_imei?: string;
  purchase_price: number;
  selling_price?: number;
  purchase_date: string;
  status: CarStatus;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface CarExpense {
  id: string;
  car_id: string;
  type: 'service' | 'tyres' | 'oil' | 'repairs' | 'insurance' | 'rego' | 'mechanical_issue' | 'other';
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface InsuranceRecord {
  id: string;
  car_id: string;
  provider: string;
  policy_number: string;
  start_date: string;
  expiry_date: string;
  premium_amount: number;
  document_url?: string;
  created_at: string;
}

export interface RegoRecord {
  id: string;
  car_id: string;
  rego_number: string;
  state: string;
  expiry_date: string;
  renewal_amount: number;
  document_url?: string;
  created_at: string;
}

// Renter Types
export interface Renter {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  license_number: string;
  license_expiry: string;
  license_document_url?: string;
  id_document_url?: string;
  is_blacklisted: boolean;
  blacklist_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Rental Session Types
export type RentalStatus = 'active' | 'completed' | 'extended' | 'cancelled';

export interface RentalSession {
  id: string;
  car_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  weekly_rent: number;
  bond_amount: number;
  total_amount: number;
  status: RentalStatus;
  signature_url?: string;
  contract_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  car?: Car;
  renter?: Renter;
}

export interface RentalPayment {
  id: string;
  rental_session_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'card' | 'other';
  reference?: string;
  notes?: string;
  created_at: string;
}

export interface KmLog {
  id: string;
  rental_session_id: string;
  odometer_reading: number;
  logged_at: string;
  notes?: string;
}

// Maintenance Types
export type MaintenanceStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceTicket {
  id: string;
  car_id: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  estimated_cost?: number;
  actual_cost?: number;
  images: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  car?: Car;
}

// Traffic Fine Types
export interface TrafficFine {
  id: string;
  car_id: string;
  renter_id?: string;
  offence_date: string;
  description: string;
  amount: number;
  location?: string;
  evidence_url?: string;
  is_paid: boolean;
  paid_date?: string;
  paid_by?: 'renter' | 'company';
  created_at: string;
  car?: Car;
  renter?: Renter;
}

// Financial Summary Types
export interface CarFinancialSummary {
  car_id: string;
  total_rental_revenue: number;
  total_expenses: number;
  net_income: number;
  total_days_rented: number;
  average_weekly_rent: number;
  roi_percentage: number;
}

export interface FleetSummary {
  total_cars: number;
  available_cars: number;
  rented_cars: number;
  maintenance_cars: number;
  reserved_cars: number;
  sold_cars: number;
}

export interface FinancialSummary {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  outstanding_payments: number;
  outstanding_fines: number;
}

// WhatsApp/Lead Types
export interface WhatsAppLead {
  id: string;
  phone: string;
  name?: string;
  message: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  car_interested_id?: string;
  created_at: string;
}

// User/Admin Types
export type UserRole = 'admin' | 'staff' | 'finance' | 'owner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}
