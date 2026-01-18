// Mapping between SQLite source tables and Supabase target tables
// Also includes column mappings for data transformation

export interface ColumnTransform {
  source: string;
  target: string;
  transform?: (value: unknown, row: Record<string, unknown>) => unknown;
}

export interface TableMapping {
  sourceTable: string;
  targetTable: string;
  description: string;
  columnMappings: ColumnTransform[];
  // Tables that must be imported first (for foreign key relationships)
  dependsOn?: string[];
  // If true, this table needs special handling for foreign key lookups
  requiresLookup?: boolean;
  // If true, this is an UPDATE operation rather than INSERT
  isUpdate?: boolean;
}

// Define mappings from SQLite tables to Supabase tables
export const sqliteTableMappings: TableMapping[] = [
  // === CORE TABLES (no dependencies) ===
  {
    sourceTable: 'cars',
    targetTable: 'cars',
    description: 'Vehicle fleet data',
    columnMappings: [
      { source: 'year', target: 'year' },
      { source: 'make', target: 'make' },
      { source: 'model', target: 'model' },
      { source: 'colour', target: 'color' },
      { source: 'plate', target: 'plate_number' },
      { source: 'selling_price', target: 'selling_price' },
      { source: 'purchase_price', target: 'purchase_price' },
      { source: 'purchase_date', target: 'purchase_date' },
    ],
  },
  {
    sourceTable: 'renters',
    targetTable: 'renters',
    description: 'Customer/renter data',
    columnMappings: [
      { 
        source: 'name', 
        target: 'first_name',
        transform: (value) => {
          const name = String(value || '');
          const parts = name.trim().split(' ');
          return parts[0] || 'Unknown';
        }
      },
      { 
        source: 'name', 
        target: 'last_name',
        transform: (value) => {
          const name = String(value || '');
          const parts = name.trim().split(' ');
          return parts.slice(1).join(' ') || 'Unknown';
        }
      },
      { 
        source: 'renter_id', 
        target: 'phone',
        transform: () => '0000000000' // Placeholder as SQLite doesn't have phone
      },
    ],
  },

  // === TABLES DEPENDING ON CARS ===
  {
    sourceTable: 'car_tracker',
    targetTable: 'cars',
    description: 'Vehicle tracker info (updates cars)',
    dependsOn: ['cars'],
    requiresLookup: true,
    isUpdate: true,
    columnMappings: [
      { source: 'body_type', target: 'body_type' },
      { source: 'colour', target: 'color' },
      { source: 'tracker_type', target: 'tracker_device_type' },
      { source: 'tracker_id', target: 'tracker_imei' },
    ],
  },
  {
    sourceTable: 'car_financials_summary',
    targetTable: 'cars',
    description: 'Financial summary (updates cars)',
    dependsOn: ['cars'],
    requiresLookup: true,
    isUpdate: true,
    columnMappings: [
      { source: 'weekly_rent', target: 'weekly_rent' },
      { source: 'fixed_price', target: 'bond_amount' },
    ],
  },
  {
    sourceTable: 'car_expenses',
    targetTable: 'car_expenses',
    description: 'Vehicle expense records',
    dependsOn: ['cars'],
    requiresLookup: true,
    columnMappings: [
      { source: 'date', target: 'expense_date' },
      { source: 'category', target: 'expense_type' },
      { source: 'description', target: 'description' },
      { source: 'amount', target: 'amount' },
    ],
  },
  {
    sourceTable: 'insurance_records',
    targetTable: 'insurance_records',
    description: 'Insurance policy records',
    dependsOn: ['cars'],
    requiresLookup: true,
    columnMappings: [
      { source: 'insurance_due', target: 'expiry_date' },
      { source: 'policy_number', target: 'policy_number' },
      { source: 'company', target: 'provider' },
      { 
        source: 'insurance_due', 
        target: 'start_date',
        transform: (value) => {
          if (!value) return null;
          const expiry = new Date(String(value));
          expiry.setFullYear(expiry.getFullYear() - 1);
          return expiry.toISOString().split('T')[0];
        }
      },
    ],
  },
  {
    sourceTable: 'rego_records',
    targetTable: 'rego_records',
    description: 'Vehicle registration records',
    dependsOn: ['cars'],
    requiresLookup: true,
    columnMappings: [
      { source: 'rego_due', target: 'expiry_date' },
      { 
        source: 'car_id', 
        target: 'rego_number',
        transform: () => 'PENDING'
      },
    ],
  },
  {
    sourceTable: 'instalment_plans',
    targetTable: 'instalment_plans',
    description: 'Car purchase instalment plans',
    dependsOn: ['cars'],
    requiresLookup: true,
    columnMappings: [
      { source: 'customer_name', target: 'customer_name' },
      { source: 'total_amount', target: 'total_amount' },
      { source: 'notes', target: 'notes' },
    ],
  },

  // === TABLES DEPENDING ON RENTERS ===
  {
    sourceTable: 'renter_instalments',
    targetTable: 'renter_instalments',
    description: 'Renter payment tracking',
    dependsOn: ['renters'],
    requiresLookup: true,
    columnMappings: [
      { source: 'instalment_date', target: 'instalment_date' },
      { source: 'amount', target: 'amount' },
      { source: 'status', target: 'status' },
      { source: 'notes', target: 'notes' },
    ],
  },

  // === TABLES DEPENDING ON CARS AND RENTERS ===
  {
    sourceTable: 'car_rental_sessions',
    targetTable: 'rental_sessions',
    description: 'Rental session records',
    dependsOn: ['cars', 'renters'],
    requiresLookup: true,
    columnMappings: [
      { source: 'pickup_date', target: 'start_date' },
      { source: 'return_date', target: 'end_date' },
      { source: 'bond', target: 'bond_amount' },
      { source: 'weekly_rent', target: 'weekly_rent' },
      { source: 'notes', target: 'notes' },
    ],
  },
  {
    sourceTable: 'rental_contracts',
    targetTable: 'rental_sessions',
    description: 'Rental contracts (as sessions)',
    dependsOn: ['cars', 'renters'],
    requiresLookup: true,
    columnMappings: [
      { source: 'start_date', target: 'start_date' },
      { source: 'end_date', target: 'end_date' },
      { source: 'bond_amount', target: 'bond_amount' },
      { source: 'rent_amount', target: 'weekly_rent' },
      { source: 'notes', target: 'notes' },
    ],
  },
  {
    sourceTable: 'renter_assignments',
    targetTable: 'rental_sessions',
    description: 'Renter assignments (as sessions)',
    dependsOn: ['cars', 'renters'],
    requiresLookup: true,
    columnMappings: [
      { source: 'assignment_date', target: 'start_date' },
      { source: 'notes', target: 'notes' },
      { 
        source: 'assignment_date', 
        target: 'weekly_rent',
        transform: () => 0 // Placeholder
      },
    ],
  },

  // === TABLES DEPENDING ON RENTAL SESSIONS ===
  {
    sourceTable: 'car_rental_payments',
    targetTable: 'rental_payments',
    description: 'Rental payment records',
    dependsOn: ['car_rental_sessions'],
    requiresLookup: true,
    columnMappings: [
      { source: 'date', target: 'payment_date' },
      { 
        source: 'amount', 
        target: 'amount',
        transform: (value) => {
          const num = Number(value);
          return isNaN(num) || value === null ? 0 : num;
        }
      },
      { source: 'comment', target: 'notes' },
    ],
  },
  {
    sourceTable: 'rental_km_logs',
    targetTable: 'rental_km_logs',
    description: 'Odometer/km tracking logs',
    dependsOn: ['rental_contracts'],
    requiresLookup: true,
    columnMappings: [
      { source: 'log_date', target: 'log_date' },
      { source: 'odometer', target: 'odometer' },
      { source: 'amount', target: 'amount' },
    ],
  },

  // === TABLES DEPENDING ON INSTALMENT PLANS ===
  {
    sourceTable: 'instalment_payments',
    targetTable: 'instalment_payments',
    description: 'Instalment payment records',
    dependsOn: ['instalment_plans'],
    requiresLookup: true,
    columnMappings: [
      { source: 'payment_date', target: 'payment_date' },
      { source: 'amount', target: 'amount' },
      { source: 'status', target: 'status' },
    ],
  },
];

// Get mapping for a specific source table
export function getTableMapping(sourceTable: string): TableMapping | undefined {
  return sqliteTableMappings.find(m => m.sourceTable === sourceTable);
}

// Get all available source tables
export function getAvailableSourceTables(): string[] {
  return sqliteTableMappings.map(m => m.sourceTable);
}

// Get import order based on dependencies
export function getImportOrder(selectedTables: string[]): string[] {
  const ordered: string[] = [];
  const remaining = new Set(selectedTables);
  
  while (remaining.size > 0) {
    let added = false;
    
    for (const table of remaining) {
      const mapping = getTableMapping(table);
      const deps = mapping?.dependsOn || [];
      
      // Check if all dependencies are already in ordered list
      const depsResolved = deps.every(dep => {
        // Dependency is resolved if it's in ordered list OR not in selected tables
        return ordered.includes(dep) || !remaining.has(dep);
      });
      
      if (depsResolved) {
        ordered.push(table);
        remaining.delete(table);
        added = true;
      }
    }
    
    // If no table was added, there's a circular dependency or missing dep
    if (!added && remaining.size > 0) {
      // Just add remaining tables in any order
      ordered.push(...remaining);
      break;
    }
  }
  
  return ordered;
}
