// Configuration for data import - defines all importable tables and their schemas

export interface ColumnConfig {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  unique?: boolean;
  defaultValue?: string | number | boolean | null;
  validation?: (value: unknown) => string | null; // Returns error message or null
}

export interface TableConfig {
  name: string;
  label: string;
  description: string;
  columns: ColumnConfig[];
}

export const importableTables: TableConfig[] = [
  {
    name: 'cars',
    label: 'Cars (Fleet)',
    description: 'Import vehicle data including make, model, year, and pricing',
    columns: [
      { name: 'make', label: 'Make', type: 'string', required: true },
      { name: 'model', label: 'Model', type: 'string', required: true },
      { name: 'year', label: 'Year', type: 'number', required: true, validation: (v) => {
        const year = Number(v);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
          return 'Year must be between 1900 and next year';
        }
        return null;
      }},
      { name: 'plate_number', label: 'Plate Number', type: 'string', required: true, unique: true },
      { name: 'vin', label: 'VIN', type: 'string', required: false },
      { name: 'color', label: 'Color', type: 'string', required: false },
      { name: 'body_type', label: 'Body Type', type: 'string', required: false },
      { name: 'purchase_price', label: 'Purchase Price', type: 'number', required: false },
      { name: 'purchase_date', label: 'Purchase Date', type: 'date', required: false },
      { name: 'weekly_rent', label: 'Weekly Rent', type: 'number', required: false },
      { name: 'bond_amount', label: 'Bond Amount', type: 'number', required: false },
      { name: 'status', label: 'Status', type: 'string', required: false, defaultValue: 'available' },
      { name: 'tracker_imei', label: 'Tracker IMEI', type: 'string', required: false },
      { name: 'tracker_device_type', label: 'Tracker Device Type', type: 'string', required: false },
      { name: 'notes', label: 'Notes', type: 'string', required: false },
    ]
  },
  {
    name: 'renters',
    label: 'Renters (Customers)',
    description: 'Import customer/renter information',
    columns: [
      { name: 'first_name', label: 'First Name', type: 'string', required: true },
      { name: 'last_name', label: 'Last Name', type: 'string', required: true },
      { name: 'phone', label: 'Phone', type: 'string', required: true },
      { name: 'email', label: 'Email', type: 'string', required: false },
      { name: 'address', label: 'Address', type: 'string', required: false },
      { name: 'license_number', label: 'License Number', type: 'string', required: false },
      { name: 'license_expiry', label: 'License Expiry', type: 'date', required: false },
      { name: 'is_blacklisted', label: 'Is Blacklisted', type: 'boolean', required: false, defaultValue: false },
      { name: 'blacklist_reason', label: 'Blacklist Reason', type: 'string', required: false },
      { name: 'notes', label: 'Notes', type: 'string', required: false },
    ]
  },
  {
    name: 'insurance_records',
    label: 'Insurance Records',
    description: 'Import insurance policy information',
    columns: [
      { name: 'provider', label: 'Provider', type: 'string', required: true },
      { name: 'policy_number', label: 'Policy Number', type: 'string', required: true },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
      { name: 'coverage_type', label: 'Coverage Type', type: 'string', required: false },
      { name: 'premium_amount', label: 'Premium Amount', type: 'number', required: false },
      { name: 'notes', label: 'Notes', type: 'string', required: false },
    ]
  },
  {
    name: 'rego_records',
    label: 'Registration Records',
    description: 'Import vehicle registration data',
    columns: [
      { name: 'rego_number', label: 'Registration Number', type: 'string', required: true },
      { name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true },
      { name: 'state', label: 'State', type: 'string', required: false },
      { name: 'renewal_amount', label: 'Renewal Amount', type: 'number', required: false },
    ]
  },
  {
    name: 'maintenance_tickets',
    label: 'Maintenance Tickets',
    description: 'Import maintenance and repair records',
    columns: [
      { name: 'title', label: 'Title', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string', required: false },
      { name: 'priority', label: 'Priority', type: 'string', required: false, defaultValue: 'medium' },
      { name: 'status', label: 'Status', type: 'string', required: false, defaultValue: 'open' },
      { name: 'estimated_cost', label: 'Estimated Cost', type: 'number', required: false },
      { name: 'actual_cost', label: 'Actual Cost', type: 'number', required: false },
      { name: 'assigned_to', label: 'Assigned To', type: 'string', required: false },
    ]
  },
  {
    name: 'traffic_fines',
    label: 'Traffic Fines',
    description: 'Import traffic violation records',
    columns: [
      { name: 'description', label: 'Description', type: 'string', required: true },
      { name: 'offence_date', label: 'Offence Date', type: 'date', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'fine_number', label: 'Fine Number', type: 'string', required: false },
      { name: 'location', label: 'Location', type: 'string', required: false },
      { name: 'is_paid', label: 'Is Paid', type: 'boolean', required: false, defaultValue: false },
      { name: 'paid_date', label: 'Paid Date', type: 'date', required: false },
      { name: 'paid_by', label: 'Paid By', type: 'string', required: false },
    ]
  },
  {
    name: 'car_expenses',
    label: 'Car Expenses',
    description: 'Import expense records for vehicles',
    columns: [
      { name: 'expense_type', label: 'Expense Type', type: 'string', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'expense_date', label: 'Expense Date', type: 'date', required: true },
      { name: 'description', label: 'Description', type: 'string', required: false },
      { name: 'receipt_url', label: 'Receipt URL', type: 'string', required: false },
    ]
  },
];

export function getTableConfig(tableName: string): TableConfig | undefined {
  return importableTables.find(t => t.name === tableName);
}

export function generateTemplate(tableName: string): string[][] {
  const config = getTableConfig(tableName);
  if (!config) return [];
  
  const headers = config.columns.map(col => col.label);
  const sampleRow = config.columns.map(col => {
    switch (col.type) {
      case 'number': return '0';
      case 'date': return '2024-01-01';
      case 'boolean': return 'false';
      default: return col.required ? 'Required' : '';
    }
  });
  
  return [headers, sampleRow];
}
