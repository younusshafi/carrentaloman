import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TableConfig, ColumnConfig } from '@/config/importConfig';
import { parseValue } from '@/utils/fileParser';
import { toast } from 'sonner';

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
}

export interface ValidationResult {
  row: number;
  status: 'valid' | 'warning' | 'error';
  errors: string[];
  warnings: string[];
  data: Record<string, unknown>;
}

export interface ImportProgress {
  total: number;
  completed: number;
  successful: number;
  failed: number;
}

export function useDataImport() {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    completed: 0,
    successful: 0,
    failed: 0,
  });

  const autoMapColumns = useCallback((
    sourceHeaders: string[],
    tableConfig: TableConfig
  ): ColumnMapping[] => {
    return sourceHeaders.map(sourceHeader => {
      const normalizedSource = sourceHeader.toLowerCase().replace(/[_\s-]/g, '');
      
      // Find best matching target column
      let bestMatch = '';
      let bestScore = 0;
      
      for (const column of tableConfig.columns) {
        const normalizedTarget = column.name.toLowerCase().replace(/[_\s-]/g, '');
        const normalizedLabel = column.label.toLowerCase().replace(/[_\s-]/g, '');
        
        // Exact match with name or label
        if (normalizedSource === normalizedTarget || normalizedSource === normalizedLabel) {
          bestMatch = column.name;
          bestScore = 100;
          break;
        }
        
        // Partial match
        if (normalizedSource.includes(normalizedTarget) || normalizedTarget.includes(normalizedSource)) {
          const score = Math.min(normalizedSource.length, normalizedTarget.length);
          if (score > bestScore) {
            bestMatch = column.name;
            bestScore = score;
          }
        }
        
        // Check label partial match
        if (normalizedSource.includes(normalizedLabel) || normalizedLabel.includes(normalizedSource)) {
          const score = Math.min(normalizedSource.length, normalizedLabel.length);
          if (score > bestScore) {
            bestMatch = column.name;
            bestScore = score;
          }
        }
      }
      
      return {
        sourceColumn: sourceHeader,
        targetColumn: bestScore > 2 ? bestMatch : '',
      };
    });
  }, []);

  const validateData = useCallback((
    rows: Record<string, unknown>[],
    mappings: ColumnMapping[],
    tableConfig: TableConfig
  ): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const seenUniqueValues: Record<string, Set<string>> = {};
    
    // Initialize sets for unique columns
    tableConfig.columns.forEach(col => {
      if (col.unique) {
        seenUniqueValues[col.name] = new Set();
      }
    });
    
    rows.forEach((row, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];
      const transformedData: Record<string, unknown> = {};
      
      // Process each mapped column
      mappings.forEach(mapping => {
        if (!mapping.targetColumn) return;
        
        const column = tableConfig.columns.find(c => c.name === mapping.targetColumn);
        if (!column) return;
        
        const rawValue = row[mapping.sourceColumn];
        const parsedValue = parseValue(rawValue, column.type);
        
        // Check required fields
        if (column.required && (parsedValue === null || parsedValue === '')) {
          errors.push(`${column.label} is required`);
        }
        
        // Check unique fields
        if (column.unique && parsedValue !== null && parsedValue !== '') {
          const strValue = String(parsedValue);
          if (seenUniqueValues[column.name].has(strValue)) {
            errors.push(`Duplicate ${column.label}: ${strValue}`);
          } else {
            seenUniqueValues[column.name].add(strValue);
          }
        }
        
        // Run custom validation
        if (column.validation && parsedValue !== null) {
          const validationError = column.validation(parsedValue);
          if (validationError) {
            errors.push(validationError);
          }
        }
        
        // Check for empty optional fields
        if (!column.required && (parsedValue === null || parsedValue === '') && rawValue !== undefined && rawValue !== '') {
          warnings.push(`${column.label} could not be parsed`);
        }
        
        transformedData[column.name] = parsedValue ?? column.defaultValue ?? null;
      });
      
      // Check for unmapped required columns
      tableConfig.columns.forEach(col => {
        if (col.required && !mappings.some(m => m.targetColumn === col.name)) {
          errors.push(`Required column ${col.label} is not mapped`);
        }
      });
      
      results.push({
        row: index + 1,
        status: errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'valid',
        errors,
        warnings,
        data: transformedData,
      });
    });
    
    return results;
  }, []);

  const importData = useCallback(async (
    validationResults: ValidationResult[],
    tableName: string,
    tableConfig: TableConfig
  ): Promise<{ success: boolean; message: string }> => {
    setIsImporting(true);
    
    const validRows = validationResults.filter(r => r.status !== 'error');
    
    setProgress({
      total: validRows.length,
      completed: 0,
      successful: 0,
      failed: 0,
    });
    
    const BATCH_SIZE = 50;
    let successful = 0;
    let failed = 0;
    
    try {
      for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
        const batch = validRows.slice(i, i + BATCH_SIZE);
        const dataToInsert = batch.map(r => {
          // Filter out null values for required fields and apply defaults
          const cleanData: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(r.data)) {
            const column = tableConfig.columns.find(c => c.name === key);
            if (value !== null || column?.defaultValue !== undefined) {
              cleanData[key] = value ?? column?.defaultValue ?? null;
            }
          }
          return cleanData;
        });
        
        // Using type assertion for dynamic table names
        const { error } = await supabase
          .from(tableName as 'cars')
          .insert(dataToInsert as never[]);
        
        if (error) {
          console.error('Batch insert error:', error);
          failed += batch.length;
          toast.error(`Failed to insert batch: ${error.message}`);
        } else {
          successful += batch.length;
        }
        
        setProgress({
          total: validRows.length,
          completed: Math.min(i + BATCH_SIZE, validRows.length),
          successful,
          failed,
        });
      }
      
      setIsImporting(false);
      
      if (failed === 0) {
        return {
          success: true,
          message: `Successfully imported ${successful} records`,
        };
      } else {
        return {
          success: false,
          message: `Imported ${successful} records. ${failed} records failed.`,
        };
      }
    } catch (error) {
      setIsImporting(false);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        message: `Import failed: ${message}`,
      };
    }
  }, []);

  return {
    autoMapColumns,
    validateData,
    importData,
    isImporting,
    progress,
  };
}
