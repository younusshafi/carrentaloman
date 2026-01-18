import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;

export interface SQLiteTable {
  name: string;
  columns: SQLiteColumn[];
  rowCount: number;
}

export interface SQLiteColumn {
  name: string;
  type: string;
}

export interface SQLiteData {
  tables: SQLiteTable[];
  db: Database;
  fileName: string;
}

// Validate table names to prevent SQL injection
// Allows alphanumeric characters, underscores, and spaces (common in SQLite)
function validateTableName(name: string): string {
  // Check for valid SQLite identifier pattern
  // Allows letters, numbers, underscores, and spaces (which SQLite supports)
  if (!/^[a-zA-Z_][a-zA-Z0-9_ ]*$/.test(name)) {
    throw new Error(`Invalid table name: ${name}. Table names must start with a letter or underscore and contain only alphanumeric characters, underscores, or spaces.`);
  }
  // Additional check for maximum reasonable length
  if (name.length > 128) {
    throw new Error(`Table name too long: ${name}. Maximum length is 128 characters.`);
  }
  return name;
}

async function initSQL(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  
  SQL = await initSqlJs({
    // Load sql.js wasm file from CDN
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });
  
  return SQL;
}

export async function parseSQLiteFile(file: File): Promise<SQLiteData> {
  const sql = await initSQL();
  
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  
  const db = new sql.Database(uint8Array);
  
  // Get all table names
  const tablesResult = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  );
  
  if (tablesResult.length === 0) {
    throw new Error('No tables found in the SQLite database');
  }
  
  const tableNames = tablesResult[0].values.map((row) => row[0] as string);
  
  const tables: SQLiteTable[] = [];
  
  for (const tableName of tableNames) {
    // Validate table name before using in query
    const safeName = validateTableName(tableName);
    
    // Get column info using PRAGMA
    const columnsResult = db.exec(`PRAGMA table_info("${safeName}")`);
    
    const columns: SQLiteColumn[] = columnsResult.length > 0
      ? columnsResult[0].values.map((row) => ({
          name: row[1] as string,
          type: (row[2] as string) || 'TEXT',
        }))
      : [];
    
    // Get row count
    const countResult = db.exec(`SELECT COUNT(*) FROM "${safeName}"`);
    const rowCount = countResult.length > 0 ? (countResult[0].values[0][0] as number) : 0;
    
    tables.push({
      name: safeName,
      columns,
      rowCount,
    });
  }
  
  return {
    tables,
    db,
    fileName: file.name,
  };
}

export function getSQLiteTableData(
  db: Database,
  tableName: string,
  limit?: number
): { headers: string[]; rows: Record<string, unknown>[] } {
  // Validate table name before using in query
  const safeName = validateTableName(tableName);
  
  // Validate limit parameter
  const safeLimit = limit !== undefined ? Math.max(0, Math.floor(Number(limit))) : undefined;
  
  const query = safeLimit !== undefined
    ? `SELECT * FROM "${safeName}" LIMIT ${safeLimit}`
    : `SELECT * FROM "${safeName}"`;
  
  const result = db.exec(query);
  
  if (result.length === 0) {
    return { headers: [], rows: [] };
  }
  
  const headers = result[0].columns;
  const rows = result[0].values.map((row) => {
    const obj: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return { headers, rows };
}

export function closeSQLiteDatabase(db: Database): void {
  db.close();
}

// Map SQLite types to our import types
export function mapSQLiteType(sqliteType: string): 'string' | 'number' | 'date' | 'boolean' {
  const type = sqliteType.toUpperCase();
  
  if (type.includes('INT') || type.includes('REAL') || type.includes('FLOAT') || type.includes('DOUBLE') || type.includes('NUMERIC') || type.includes('DECIMAL')) {
    return 'number';
  }
  
  if (type.includes('DATE') || type.includes('TIME')) {
    return 'date';
  }
  
  if (type.includes('BOOL')) {
    return 'boolean';
  }
  
  return 'string';
}
