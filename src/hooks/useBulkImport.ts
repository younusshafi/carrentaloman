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

  const idCache: IdCache = {
    cars: new Map(),
    renters: new Map(),
    rental_sessions: new Map(),
  };

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

    // Handle foreign key lookups
    if (mapping.requiresLookup) {
      if (mapping.sourceTable === 'car_expenses' || 
          mapping.sourceTable === 'insurance_records' ||
          mapping.sourceTable === 'rego_records' ||
          mapping.sourceTable === 'car_tracker') {
        const carId = row['car_id'] as number;
        const supabaseCarId = idCache.cars.get(carId);
        if (!supabaseCarId && mapping.sourceTable !== 'car_tracker') {
          return null; // Skip if car not found
        }
        transformed['car_id'] = supabaseCarId || null;
      }

      if (mapping.sourceTable === 'car_rental_sessions') {
        const carId = row['car_id'] as number;
        const supabaseCarId = idCache.cars.get(carId);
        transformed['car_id'] = supabaseCarId || null;

        // Look up renter by name
        const renterName = row['renter_name'] as string;
        if (renterName) {
          const renterId = idCache.renters.get(renterName.toLowerCase());
          transformed['renter_id'] = renterId || null;
        }
      }

      if (mapping.sourceTable === 'car_rental_payments') {
        const sessionId = row['session_id'] as number;
        const supabaseSessionId = idCache.rental_sessions.get(sessionId);
        transformed['rental_session_id'] = supabaseSessionId || null;
      }
    }

    return transformed;
  };

  const importTable = async (
    db: SqlDatabase,
    mapping: TableMapping,
    idCache: IdCache
  ): Promise<{ imported: number; failed: number }> => {
    const { rows } = getSQLiteTableData(db, mapping.sourceTable);
    
    if (rows.length === 0) {
      return { imported: 0, failed: 0 };
    }

    const BATCH_SIZE = 50;
    let imported = 0;
    let failed = 0;

    // Special handling for car_tracker - we UPDATE cars instead of INSERT
    if (mapping.sourceTable === 'car_tracker') {
      for (const row of rows) {
        const transformed = transformRow(row, mapping, idCache);
        if (!transformed || !transformed.car_id) continue;

        const { error } = await supabase
          .from('cars')
          .update({
            body_type: transformed.body_type as string | null,
            color: transformed.color as string | null,
            tracker_device_type: transformed.tracker_device_type as string | null,
            tracker_imei: transformed.tracker_imei as string | null,
          })
          .eq('id', transformed.car_id as string);

        if (error) {
          console.error('Update error:', error);
          failed++;
        } else {
          imported++;
        }
      }
      return { imported, failed };
    }

    // Standard insert for other tables
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const dataToInsert: Record<string, unknown>[] = [];

      for (const row of batch) {
        const transformed = transformRow(row, mapping, idCache);
        if (transformed) {
          dataToInsert.push(transformed);
        } else {
          failed++;
        }
      }

      if (dataToInsert.length === 0) continue;

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
          batch.forEach((row, idx) => {
            if (data[idx]) {
              idCache.cars.set(row['car_id'] as number, data[idx].id);
            }
          });
        }

        if (mapping.targetTable === 'renters') {
          batch.forEach((row, idx) => {
            if (data[idx]) {
              const name = (row['name'] as string || '').toLowerCase();
              idCache.renters.set(name, data[idx].id);
            }
          });
        }

        if (mapping.targetTable === 'rental_sessions') {
          batch.forEach((row, idx) => {
            if (data[idx]) {
              idCache.rental_sessions.set(row['session_id'] as number, data[idx].id);
            }
          });
        }
      }

      setProgress(prev => ({
        ...prev,
        rowsCompleted: prev.rowsCompleted + dataToInsert.length,
      }));
    }

    return { imported, failed };
  };

  const bulkImport = useCallback(async (
    db: SqlDatabase,
    selectedMappings: TableMapping[]
  ): Promise<BulkImportResult> => {
    setIsImporting(true);
    
    const orderedTables = getImportOrder(selectedMappings.map(m => m.sourceTable));
    const orderedMappings = orderedTables
      .map(table => selectedMappings.find(m => m.sourceTable === table))
      .filter((m): m is TableMapping => m !== undefined);

    const totalRows = orderedMappings.reduce((sum, mapping) => {
      const { rows } = getSQLiteTableData(db, mapping.sourceTable);
      return sum + rows.length;
    }, 0);

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
        const result = await importTable(db, mapping, idCache);
        
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
