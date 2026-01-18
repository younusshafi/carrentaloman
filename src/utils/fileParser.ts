import * as XLSX from 'xlsx';

export interface ParsedData {
  headers: string[];
  rows: Record<string, unknown>[];
  fileName: string;
}

export async function parseFile(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          raw: false,
          dateNF: 'yyyy-mm-dd',
        }) as unknown[][];
        
        if (jsonData.length < 2) {
          reject(new Error('File must contain at least a header row and one data row'));
          return;
        }
        
        // Extract headers from first row
        const headers = (jsonData[0] as string[]).map(h => String(h || '').trim());
        
        // Convert remaining rows to objects
        const rows = jsonData.slice(1).map((row: unknown[]) => {
          const obj: Record<string, unknown> = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] !== undefined ? row[index] : '';
          });
          return obj;
        }).filter(row => {
          // Filter out completely empty rows
          return Object.values(row).some(v => v !== '' && v !== null && v !== undefined);
        });
        
        resolve({
          headers,
          rows,
          fileName: file.name,
        });
      } catch (error) {
        reject(new Error('Failed to parse file. Please ensure it is a valid Excel or CSV file.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsBinaryString(file);
  });
}

export function downloadTemplate(headers: string[], sampleRow: string[], fileName: string): void {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  XLSX.writeFile(workbook, `${fileName}_template.xlsx`);
}

export function parseValue(value: unknown, type: 'string' | 'number' | 'date' | 'boolean'): unknown {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const strValue = String(value).trim();
  
  switch (type) {
    case 'number':
      const num = parseFloat(strValue.replace(/[,$]/g, ''));
      return isNaN(num) ? null : num;
      
    case 'date':
      // Handle various date formats
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      const date = new Date(strValue);
      if (isNaN(date.getTime())) {
        // Try parsing dd/mm/yyyy format
        const parts = strValue.split(/[\/\-]/);
        if (parts.length === 3) {
          const [day, month, year] = parts.map(Number);
          const parsedDate = new Date(year, month - 1, day);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString().split('T')[0];
          }
        }
        return null;
      }
      return date.toISOString().split('T')[0];
      
    case 'boolean':
      const lower = strValue.toLowerCase();
      if (['true', 'yes', '1', 'y'].includes(lower)) return true;
      if (['false', 'no', '0', 'n'].includes(lower)) return false;
      return false;
      
    default:
      return strValue;
  }
}
