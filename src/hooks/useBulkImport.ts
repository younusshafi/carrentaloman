import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database as SqlDatabase } from 'sql.js';
import { getSQLiteTableData } from '@/utils/sqliteParser';
import { TableMapping, getImportOrder } from '@/config/sqliteTableMappings';
import { toast } from 'sonner';

export interface BulkImportProgress {
  currentTable: string;
  currentTableIndex: number;
  totalTables: number;
  rowsCompleted: number;
  rowsTotal: number;
  successfulTables: string[];
  failedTables: { table: string; error: string }[];
}

export interface BulkImportResult {
  success: boolean;
  message: string;
  details: {
    table: string;
    imported: number;
    failed: number;
  }[];
}

// Cache for storing ID mappings between SQLite and Supabase
interface IdCache {
  cars: Map<number, string>; // SQLite car_id -> Supabase UUID
  renters: Map<string, string>; // SQLite renter_name -> Supabase UUID
  rental_sessions: Map<number, string>; // SQLite session_id -> Supabase UUID
  rental_contracts: Map<number, string>; // SQLite contract_id -> Supabase UUID
  instalment_plans: Map<number, string>; // SQLite plan_id -> Supabase UUID
}

export function useBulkImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<BulkImportProgress>({
    currentTable: '',
    currentTableIndex: 0,
    totalTables: 0,
    rowsCompleted: 0,
    rowsTotal: 0,
    successfulTables: [],
    failedTables: [],
  });

  const transformRow = (
    row: Record<string, unknown>,
    mapping: TableMapping,
    idCache: IdCache
  ): Record<string, unknown> | null => {
    const transformed: Record<string, unknown> = {};

    for (const colMap of mapping.columnMappings) {
      const sourceValue = row[colMap.source];
      
      if (colMap.transform) {
        transformed[colMap.target] = colMap.transform(sourceValue, row);
      } else {
        transformed[colMap.target] = sourceValue ?? null;
      }
    }

    // Handle foreign key lookups based on source table
    if (mapping.requiresLookup) {
      // Tables that need car_id lookup
      if (['car_expenses', 'insurance_records', 'rego_records', 'car_tracker', 
           'car_financials_summary', 'instalment_plans'].includes(mapping.sourceTable)) {
        const carId = row['car_id'] as number;
        const supabaseCarId = idCache.cars.get(carId);
        if (!supabaseCarId && !mapping.isUpdate) {
          return null; // Skip if car not found (for inserts)
        }
        transformed['car_id'] = supabaseCarId || null;
      }

      // Tables that need renter_id lookup
      if (mapping.sourceTable === 'renter_instalments') {
        const renterId = row['renter_id'] as number;
        // Try to find by renter_id in the cache (we store by name, so this might not work directly)
        // For now, skip if we can't match
        transformed['renter_id'] = null;
      }

      // Rental sessions - need both car and renter lookup
      if (['car_rental_sessions', 'rental_contracts', 'renter_assignments'].includes(mapping.sourceTable)) {
        const carId = row['car_id'] as number;
        const supabaseCarId = idCache.cars.get(carId);
        transformed['car_id'] = supabaseCarId || null;

        // Look up renter by name
        const renterName = (row['renter_name'] as string) || '';
        if (renterName) {
          const renterId = idCache.renters.get(renterName.toLowerCase().trim());
          transformed['renter_id'] = renterId || null;
        }
      }

      // Rental payments - need session lookup
      if (mapping.sourceTable === 'car_rental_payments') {
        const sessionId = row['session_id'] as number;
        const supabaseSessionId = idCache.rental_sessions.get(sessionId);
        transformed['rental_session_id'] = supabaseSessionId || null;
      }

      // Rental km logs - need contract/session lookup
      if (mapping.sourceTable === 'rental_km_logs') {
        const contractId = row['contract_id'] as number;
        const supabaseSessionId = idCache.rental_contracts.get(contractId);
        transformed['rental_session_id'] = supabaseSessionId || null;
      }

      // Instalment payments - need plan lookup
      if (mapping.sourceTable === 'instalment_payments') {
        const planId = row['plan_id'] as number;
        const supabasePlanId = idCache.instalment_plans.get(planId);
        if (!supabasePlanId) return null;
        transformed['plan_id'] = supabasePlanId;
      }
    }

    return transformed;
  };

  const importTable = async (
    db: SqlDatabase,
    mapping: TableMapping,
    idCache: IdCache,
    onProgress: (completed: number) => void
  ): Promise<{ imported: number; failed: number }> => {
    const { rows } = getSQLiteTableData(db, mapping.sourceTable);
    
    if (rows.length === 0) {
      return { imported: 0, failed: 0 };
    }

    const BATCH_SIZE = 50;
    let imported = 0;
    let failed = 0;

    // Handle UPDATE operations (car_tracker, car_financials_summary)
    if (mapping.isUpdate) {
      for (const row of rows) {
        const carId = row['car_id'] as number;
        const supabaseCarId = idCache.cars.get(carId);
        if (!supabaseCarId) {
          failed++;
          continue;
        }

        const updateData: Record<string, unknown> = {};
        for (const colMap of mapping.columnMappings) {
          const value = colMap.transform 
            ? colMap.transform(row[colMap.source], row)
            : row[colMap.source];
          if (value !== null && value !== undefined) {
            updateData[colMap.target] = value;
          }
        }

        if (Object.keys(updateData).length === 0) {
          continue;
        }

        const { error } = await supabase
          .from('cars')
          .update(updateData as { body_type?: string; color?: string; tracker_device_type?: string; tracker_imei?: string; weekly_rent?: number; bond_amount?: number })
          .eq('id', supabaseCarId);

        if (error) {
          console.error('Update error:', error);
          failed++;
        } else {
          imported++;
        }
        onProgress(1);
      }
      return { imported, failed };
    }

    // Standard INSERT operations
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const dataToInsert: Record<string, unknown>[] = [];
      const originalRows: Record<string, unknown>[] = [];

      for (const row of batch) {
        const transformed = transformRow(row, mapping, idCache);
        if (transformed) {
          dataToInsert.push(transformed);
          originalRows.push(row);
        } else {
          failed++;
        }
      }

      if (dataToInsert.length === 0) {
        onProgress(batch.length);
        continue;
      }

      const { data, error } = await supabase
        .from(mapping.targetTable as 'cars')
        .insert(dataToInsert as never[])
        .select();

      if (error) {
        console.error(`Insert error for ${mapping.targetTable}:`, error);
        failed += dataToInsert.length;
      } else if (data) {
        imported += data.length;

        // Cache IDs for future lookups
        if (mapping.targetTable === 'cars') {
          originalRows.forEach((row, idx) => {
            if (data[idx]) {
              idCache.cars.set(row['car_id'] as number, data[idx].id);
            }
          });
        }

        if (mapping.targetTable === 'renters') {
          originalRows.forEach((row, idx) => {
            if (data[idx]) {
              const name = (row['name'] as string || '').toLowerCase().trim();
              idCache.renters.set(name, data[idx].id);
            }
          });
        }

        if (mapping.targetTable === 'rental_sessions') {
          originalRows.forEach((row, idx) => {
            if (data[idx]) {
              // Store by session_id or contract_id depending on source
              if (mapping.sourceTable === 'car_rental_sessions') {
                idCache.rental_sessions.set(row['session_id'] as number, data[idx].id);
              } else if (mapping.sourceTable === 'rental_contracts') {
                idCache.rental_contracts.set(row['contract_id'] as number, data[idx].id);
              }
            }
          });
        }

        if (mapping.targetTable === 'instalment_plans') {
          originalRows.forEach((row, idx) => {
            if (data[idx]) {
              idCache.instalment_plans.set(row['plan_id'] as number, data[idx].id);
            }
          });
        }
      }

      onProgress(batch.length);
    }

    return { imported, failed };
  };

  const bulkImport = useCallback(async (
    db: SqlDatabase,
    selectedMappings: TableMapping[]
  ): Promise<BulkImportResult> => {
    setIsImporting(true);

    const idCache: IdCache = {
      cars: new Map(),
      renters: new Map(),
      rental_sessions: new Map(),
      rental_contracts: new Map(),
      instalment_plans: new Map(),
    };
    
    const orderedTables = getImportOrder(selectedMappings.map(m => m.sourceTable));
    const orderedMappings = orderedTables
      .map(table => selectedMappings.find(m => m.sourceTable === table))
      .filter((m): m is TableMapping => m !== undefined);

    const totalRows = orderedMappings.reduce((sum, mapping) => {
      const { rows } = getSQLiteTableData(db, mapping.sourceTable);
      return sum + rows.length;
    }, 0);

    let completedRows = 0;

    setProgress({
      currentTable: '',
      currentTableIndex: 0,
      totalTables: orderedMappings.length,
      rowsCompleted: 0,
      rowsTotal: totalRows,
      successfulTables: [],
      failedTables: [],
    });

    const details: BulkImportResult['details'] = [];
    const successfulTables: string[] = [];
    const failedTables: { table: string; error: string }[] = [];

    for (let i = 0; i < orderedMappings.length; i++) {
      const mapping = orderedMappings[i];
      
      setProgress(prev => ({
        ...prev,
        currentTable: mapping.sourceTable,
        currentTableIndex: i + 1,
      }));

      try {
        const result = await importTable(db, mapping, idCache, (completed) => {
          completedRows += completed;
          setProgress(prev => ({
            ...prev,
            rowsCompleted: completedRows,
          }));
        });
        
        details.push({
          table: mapping.sourceTable,
          imported: result.imported,
          failed: result.failed,
        });

        if (result.failed === 0 || result.imported > 0) {
          successfulTables.push(mapping.sourceTable);
        }
        
        if (result.failed > 0 && result.imported === 0) {
          failedTables.push({
            table: mapping.sourceTable,
            error: `All ${result.failed} rows failed to import`,
          });
        }

        setProgress(prev => ({
          ...prev,
          successfulTables: [...successfulTables],
          failedTables: [...failedTables],
        }));

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        failedTables.push({ table: mapping.sourceTable, error: errorMsg });
        
        details.push({
          table: mapping.sourceTable,
          imported: 0,
          failed: -1,
        });
      }
    }

    setIsImporting(false);

    const totalImported = details.reduce((sum, d) => sum + d.imported, 0);
    const totalFailed = details.reduce((sum, d) => sum + (d.failed > 0 ? d.failed : 0), 0);

    return {
      success: failedTables.length === 0,
      message: `Imported ${totalImported} records across ${successfulTables.length} tables. ${totalFailed > 0 ? `${totalFailed} records failed.` : ''}`,
      details,
    };
  }, []);

  return {
    bulkImport,
    isImporting,
    progress,
  };
}
