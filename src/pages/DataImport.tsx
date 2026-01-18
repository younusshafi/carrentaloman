import React, { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  FileUp,
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  RefreshCw,
  Download,
  HardDrive,
} from 'lucide-react';
import { toast } from 'sonner';
import { importableTables, getTableConfig, generateTemplate, TableConfig } from '@/config/importConfig';
import { parseFile, downloadTemplate, ParsedData, isSQLiteFile } from '@/utils/fileParser';
import { useDataImport, ColumnMapping, ValidationResult } from '@/hooks/useDataImport';
import { parseSQLiteFile, getSQLiteTableData, closeSQLiteDatabase, SQLiteData, SQLiteTable } from '@/utils/sqliteParser';
import { Database as SqlDatabase } from 'sql.js';

type ImportStep = 'upload' | 'source-table' | 'preview' | 'mapping' | 'validation' | 'migrate';

export default function DataImport() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importComplete, setImportComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // SQLite specific state
  const [sqliteData, setSqliteData] = useState<SQLiteData | null>(null);
  const [selectedSourceTable, setSelectedSourceTable] = useState<string>('');
  
  const { autoMapColumns, validateData, importData, isImporting, progress } = useDataImport();

  const steps = [
    { key: 'upload', label: 'Upload', icon: Upload },
    { key: 'source-table', label: 'Source', icon: HardDrive, sqliteOnly: true },
    { key: 'preview', label: 'Preview', icon: FileSpreadsheet },
    { key: 'mapping', label: 'Mapping', icon: ArrowRight },
    { key: 'validation', label: 'Validation', icon: CheckCircle },
    { key: 'migrate', label: 'Migrate', icon: Database },
  ];

  // Filter steps based on file type
  const visibleSteps = sqliteData 
    ? steps 
    : steps.filter(s => !s.sqliteOnly);

  const currentStepIndex = visibleSteps.findIndex(s => s.key === currentStep);
  const tableConfig = selectedTable ? getTableConfig(selectedTable) : undefined;

  const validationSummary = {
    total: validationResults.length,
    valid: validationResults.filter(r => r.status === 'valid').length,
    warnings: validationResults.filter(r => r.status === 'warning').length,
    errors: validationResults.filter(r => r.status === 'error').length,
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }

    try {
      // Check if it's a SQLite file
      if (isSQLiteFile(file)) {
        toast.loading('Loading SQLite database...', { id: 'sqlite-load' });
        const data = await parseSQLiteFile(file);
        setSqliteData(data);
        toast.dismiss('sqlite-load');
        toast.success(`Loaded SQLite database with ${data.tables.length} table(s)`);
        setCurrentStep('source-table');
      } else {
        const data = await parseFile(file);
        setParsedData(data);
        
        // Auto-map columns
        const config = getTableConfig(selectedTable);
        if (config) {
          const autoMappings = autoMapColumns(data.headers, config);
          setMappings(autoMappings);
        }
        
        toast.success(`Loaded ${data.rows.length} rows from ${file.name}`);
        setCurrentStep('preview');
      }
    } catch (error) {
      toast.dismiss('sqlite-load');
      toast.error(error instanceof Error ? error.message : 'Failed to parse file');
    }
  };

  const handleSourceTableSelect = (tableName: string) => {
    if (!sqliteData || !tableName) return;
    
    setSelectedSourceTable(tableName);
    
    // Get data from selected SQLite table
    const { headers, rows } = getSQLiteTableData(sqliteData.db, tableName);
    
    const data: ParsedData = {
      headers,
      rows,
      fileName: `${sqliteData.fileName} → ${tableName}`,
      isSQLite: true,
    };
    
    setParsedData(data);
    
    // Auto-map columns
    const config = getTableConfig(selectedTable);
    if (config) {
      const autoMappings = autoMapColumns(headers, config);
      setMappings(autoMappings);
    }
    
    toast.success(`Loaded ${rows.length} rows from table "${tableName}"`);
    setCurrentStep('preview');
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }

    // Create a synthetic event to reuse handleFileSelect logic
    const syntheticEvent = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    await handleFileSelect(syntheticEvent);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleValidate = () => {
    if (!parsedData || !tableConfig) return;
    
    const results = validateData(parsedData.rows, mappings, tableConfig);
    setValidationResults(results);
    setCurrentStep('validation');
  };

  const handleStartMigration = async () => {
    if (!tableConfig) return;
    
    setCurrentStep('migrate');
    setImportComplete(false);
    
    const result = await importData(validationResults, selectedTable, tableConfig);
    
    setImportComplete(true);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleDownloadTemplate = () => {
    if (!selectedTable || !tableConfig) {
      toast.error('Please select a table first');
      return;
    }
    
    const [headers, sampleRow] = generateTemplate(selectedTable);
    downloadTemplate(headers, sampleRow, selectedTable);
    toast.success('Template downloaded');
  };

  const handleReset = () => {
    // Close SQLite database if open
    if (sqliteData) {
      closeSQLiteDatabase(sqliteData.db);
    }
    
    setCurrentStep('upload');
    setParsedData(null);
    setMappings([]);
    setValidationResults([]);
    setImportComplete(false);
    setSqliteData(null);
    setSelectedSourceTable('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateMapping = (index: number, targetColumn: string) => {
    const newMappings = [...mappings];
    newMappings[index].targetColumn = targetColumn;
    setMappings(newMappings);
  };

  const getSelectedSourceTableInfo = (): SQLiteTable | undefined => {
    return sqliteData?.tables.find(t => t.name === selectedSourceTable);
  };

  return (
    <MainLayout title="Data Migration" subtitle="Import data from Excel, CSV, or SQLite files">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-4">
        {visibleSteps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className={`flex items-center gap-2 ${
              index <= currentStepIndex ? 'text-accent' : 'text-muted-foreground'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                index < currentStepIndex ? 'bg-accent text-accent-foreground' :
                index === currentStepIndex ? 'bg-accent/20 text-accent border-2 border-accent' :
                'bg-muted text-muted-foreground'
              }`}>
                {index < currentStepIndex ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`font-medium hidden sm:inline ${
                index <= currentStepIndex ? '' : 'text-muted-foreground'
              }`}>{step.label}</span>
            </div>
            {index < visibleSteps.length - 1 && (
              <div className={`w-12 sm:w-24 h-0.5 mx-2 ${
                index < currentStepIndex ? 'bg-accent' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 'upload' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Target Table</CardTitle>
              <CardDescription>Choose which database table to import data into</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Target Table</Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a table..." />
                    </SelectTrigger>
                    <SelectContent>
                      {importableTables.map((table) => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {tableConfig && (
                    <p className="text-sm text-muted-foreground mt-2">{tableConfig.description}</p>
                  )}
                </div>
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadTemplate}
                    disabled={!selectedTable}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>Upload your Excel, CSV, or SQLite database file</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,.sqlite,.db,.sqlite3"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  selectedTable 
                    ? 'cursor-pointer hover:border-accent hover:bg-accent/5' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => selectedTable && fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <FileUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {selectedTable ? 'Drop your file here' : 'Select a table first'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {selectedTable ? 'or click to browse' : 'Choose a target table above to enable upload'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">.xlsx</Badge>
                  <Badge variant="secondary">.xls</Badge>
                  <Badge variant="secondary">.csv</Badge>
                  <Badge variant="secondary">.sqlite</Badge>
                  <Badge variant="secondary">.db</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-3">Files up to 10MB</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SQLite Source Table Selection */}
      {currentStep === 'source-table' && sqliteData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Select Source Table
              </CardTitle>
              <CardDescription>
                Choose a table from {sqliteData.fileName} to import
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleReset}>
              Back
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sqliteData.tables.map((table) => (
                <Card 
                  key={table.name}
                  className={`cursor-pointer transition-all hover:border-accent hover:shadow-md ${
                    selectedSourceTable === table.name ? 'border-accent bg-accent/5' : ''
                  }`}
                  onClick={() => handleSourceTableSelect(table.name)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-accent" />
                        <h4 className="font-semibold">{table.name}</h4>
                      </div>
                      <Badge variant="outline">{table.rowCount} rows</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Columns:</p>
                      <div className="flex flex-wrap gap-1">
                        {table.columns.slice(0, 5).map((col) => (
                          <Badge key={col.name} variant="secondary" className="text-xs">
                            {col.name}
                          </Badge>
                        ))}
                        {table.columns.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{table.columns.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'preview' && parsedData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {parsedData.isSQLite && <HardDrive className="w-5 h-5" />}
                Data Preview
              </CardTitle>
              <CardDescription>
                Showing first 10 rows from {parsedData.fileName} ({parsedData.rows.length} total rows)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                if (sqliteData) {
                  setCurrentStep('source-table');
                } else {
                  handleReset();
                }
              }}>
                Back
              </Button>
              <Button variant="accent" onClick={() => setCurrentStep('mapping')}>
                Continue to Mapping
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">#</TableHead>
                    {parsedData.headers.map((header, i) => (
                      <TableHead key={i}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.rows.slice(0, 10).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="font-mono text-muted-foreground">{rowIndex + 1}</TableCell>
                      {parsedData.headers.map((header, colIndex) => (
                        <TableCell key={colIndex}>
                          {row[header] !== null && row[header] !== undefined && row[header] !== '' 
                            ? String(row[header])
                            : <span className="text-muted-foreground/50">—</span>
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'mapping' && tableConfig && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Column Mapping</CardTitle>
              <CardDescription>Map your file columns to database fields</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('preview')}>
                Back
              </Button>
              <Button variant="accent" onClick={handleValidate}>
                Validate Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Required fields: </span>
                {tableConfig.columns.filter(c => c.required).map(c => c.label).join(', ')}
              </p>
            </div>
            <div className="space-y-4">
              {mappings.map((mapping, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Source Column</Label>
                    <p className="font-medium">{mapping.sourceColumn}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Target Field</Label>
                    <Select
                      value={mapping.targetColumn}
                      onValueChange={(value) => updateMapping(index, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Skip Column --</SelectItem>
                        {tableConfig.columns.map((col) => (
                          <SelectItem key={col.name} value={col.name}>
                            {col.label} {col.required && '*'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'validation' && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Validation Results</CardTitle>
                <CardDescription>Review data quality before migration</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentStep('mapping')}>
                  Back
                </Button>
                <Button
                  variant="accent"
                  onClick={handleStartMigration}
                  disabled={validationSummary.errors > 0}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Migrate {validationSummary.valid + validationSummary.warnings} Records
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{validationSummary.total}</p>
                        <p className="text-sm text-muted-foreground">Total Rows</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-success" />
                      <div>
                        <p className="text-2xl font-bold text-success">{validationSummary.valid}</p>
                        <p className="text-sm text-muted-foreground">Valid</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-warning" />
                      <div>
                        <p className="text-2xl font-bold text-warning">{validationSummary.warnings}</p>
                        <p className="text-sm text-muted-foreground">Warnings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-8 h-8 text-destructive" />
                      <div>
                        <p className="text-2xl font-bold text-destructive">{validationSummary.errors}</p>
                        <p className="text-sm text-muted-foreground">Errors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {validationSummary.errors > 0 && (
                <Card className="border-destructive/50 bg-destructive/5 mb-4">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Cannot proceed with migration</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          Please fix the {validationSummary.errors} error(s) in your data before continuing:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc ml-4 max-h-40 overflow-y-auto">
                          {validationResults
                            .filter(r => r.status === 'error')
                            .slice(0, 10)
                            .map((r, i) => (
                              <li key={i}>
                                Row {r.row}: {r.errors.join(', ')}
                              </li>
                            ))}
                          {validationResults.filter(r => r.status === 'error').length > 10 && (
                            <li>... and {validationResults.filter(r => r.status === 'error').length - 10} more errors</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {validationSummary.warnings > 0 && (
                <Card className="border-warning/50 bg-warning/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <p className="font-medium text-warning">Warnings detected</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {validationSummary.warnings} row(s) have warnings but will still be imported:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc ml-4 max-h-40 overflow-y-auto">
                          {validationResults
                            .filter(r => r.status === 'warning')
                            .slice(0, 5)
                            .map((r, i) => (
                              <li key={i}>
                                Row {r.row}: {r.warnings.join(', ')}
                              </li>
                            ))}
                          {validationResults.filter(r => r.status === 'warning').length > 5 && (
                            <li>... and {validationResults.filter(r => r.status === 'warning').length - 5} more warnings</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 'migrate' && (
        <Card>
          <CardHeader>
            <CardTitle>Migrating to Database</CardTitle>
            <CardDescription>Importing your data into {tableConfig?.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%</span>
                </div>
                <Progress 
                  value={progress.total > 0 ? (progress.completed / progress.total) * 100 : 0} 
                  className="h-3" 
                />
              </div>

              {!importComplete ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Importing records... Please don't close this page. ({progress.completed}/{progress.total})</span>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Migration Complete!</h3>
                  <p className="text-muted-foreground mb-2">
                    Successfully imported {progress.successful} records into {tableConfig?.label}.
                  </p>
                  {progress.failed > 0 && (
                    <p className="text-destructive mb-4">
                      {progress.failed} records failed to import.
                    </p>
                  )}
                  <div className="flex gap-4 justify-center mt-6">
                    <Button variant="outline" onClick={handleReset}>
                      Import More Data
                    </Button>
                    <Button variant="accent" onClick={() => window.location.href = '/fleet'}>
                      View Fleet
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
