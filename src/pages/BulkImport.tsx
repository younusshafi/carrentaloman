import React, { useState, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  FileUp,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  RefreshCw,
  HardDrive,
  Layers,
  Trash2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { parseSQLiteFile, getSQLiteTableData, closeSQLiteDatabase, SQLiteData, SQLiteTable } from '@/utils/sqliteParser';
import { useBulkImport, ValidationResult, ValidationIssue } from '@/hooks/useBulkImport';
import { sqliteTableMappings, getTableMapping, TableMapping } from '@/config/sqliteTableMappings';

type ImportStep = 'upload' | 'select-tables' | 'preview' | 'validate' | 'import' | 'complete';

export default function BulkImport() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [sqliteData, setSqliteData] = useState<SQLiteData | null>(null);
  const [selectedTables, setSelectedTables] = useState<Set<string>>(new Set());
  const [previewTable, setPreviewTable] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { bulkImport, validateData, clearAllData, isImporting, isValidating, isClearing, progress } = useBulkImport();
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    details: { table: string; imported: number; failed: number }[];
  } | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const steps = [
    { key: 'upload', label: 'Upload', icon: Upload },
    { key: 'select-tables', label: 'Select Tables', icon: Layers },
    { key: 'preview', label: 'Preview', icon: Database },
    { key: 'validate', label: 'Validate', icon: ShieldCheck },
    { key: 'import', label: 'Import', icon: ArrowRight },
    { key: 'complete', label: 'Complete', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  // Get available mappings for tables in the SQLite database
  const availableMappings = sqliteData?.tables
    .map(t => getTableMapping(t.name))
    .filter((m): m is TableMapping => m !== undefined) || [];

  // Get SQLite tables that have mappings
  const mappedTables = sqliteData?.tables.filter(t => 
    sqliteTableMappings.some(m => m.sourceTable === t.name)
  ) || [];

  // Get SQLite tables that don't have mappings
  const unmappedTables = sqliteData?.tables.filter(t => 
    !sqliteTableMappings.some(m => m.sourceTable === t.name)
  ) || [];

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.sqlite', '.db', '.sqlite3'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(ext)) {
      toast.error('Please upload a SQLite database file (.sqlite, .db, .sqlite3)');
      return;
    }

    try {
      toast.loading('Loading SQLite database...', { id: 'sqlite-load' });
      const data = await parseSQLiteFile(file);
      setSqliteData(data);
      
      // Auto-select all available mapped tables
      const autoSelected = new Set(
        data.tables
          .filter(t => sqliteTableMappings.some(m => m.sourceTable === t.name))
          .map(t => t.name)
      );
      setSelectedTables(autoSelected);
      
      toast.dismiss('sqlite-load');
      toast.success(`Loaded database with ${data.tables.length} tables`);
      setCurrentStep('select-tables');
    } catch (error) {
      toast.dismiss('sqlite-load');
      toast.error(error instanceof Error ? error.message : 'Failed to load SQLite database');
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    const syntheticEvent = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    
    await handleFileSelect(syntheticEvent);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const toggleTable = (tableName: string) => {
    const newSelected = new Set(selectedTables);
    if (newSelected.has(tableName)) {
      newSelected.delete(tableName);
    } else {
      newSelected.add(tableName);
    }
    setSelectedTables(newSelected);
  };

  const selectAll = () => {
    setSelectedTables(new Set(mappedTables.map(t => t.name)));
  };

  const deselectAll = () => {
    setSelectedTables(new Set());
  };

  const handlePreview = (tableName: string) => {
    setPreviewTable(tableName);
    setCurrentStep('preview');
  };

  const handleValidate = async () => {
    if (!sqliteData || selectedTables.size === 0) return;
    
    setCurrentStep('validate');
    
    const mappingsToValidate = Array.from(selectedTables)
      .map(t => getTableMapping(t))
      .filter((m): m is TableMapping => m !== undefined);

    const result = await validateData(sqliteData.db, mappingsToValidate);
    setValidationResult(result);
  };

  const handleStartImport = async () => {
    if (!sqliteData || selectedTables.size === 0) return;
    
    setCurrentStep('import');
    
    const mappingsToImport = Array.from(selectedTables)
      .map(t => getTableMapping(t))
      .filter((m): m is TableMapping => m !== undefined);

    const result = await bulkImport(sqliteData.db, mappingsToImport);
    setImportResult(result);
    setCurrentStep('complete');
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.warning(result.message);
    }
  };

  const handleClearData = async () => {
    const result = await clearAllData();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleReset = () => {
    if (sqliteData) {
      closeSQLiteDatabase(sqliteData.db);
    }
    setSqliteData(null);
    setSelectedTables(new Set());
    setPreviewTable('');
    setImportResult(null);
    setValidationResult(null);
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getIssueIcon = (severity: ValidationIssue['severity']) => {
    switch (severity) {
      case 'error':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'info':
        return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPreviewData = () => {
    if (!sqliteData || !previewTable) return null;
    return getSQLiteTableData(sqliteData.db, previewTable, 10);
  };

  return (
    <MainLayout title="Bulk Database Import" subtitle="Import your entire SQLite database at once">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((step, index) => (
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
            {index < steps.length - 1 && (
              <div className={`w-12 sm:w-24 h-0.5 mx-2 ${
                index < currentStepIndex ? 'bg-accent' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Upload Step */}
      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Upload SQLite Database
            </CardTitle>
            <CardDescription>
              Upload your complete SQLite database file to import all data at once
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".sqlite,.db,.sqlite3"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all hover:border-accent hover:bg-accent/5"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <FileUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drop your SQLite database here</h3>
              <p className="text-muted-foreground mb-4">or click to browse</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">.sqlite</Badge>
                <Badge variant="secondary">.db</Badge>
                <Badge variant="secondary">.sqlite3</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                The system will automatically detect and map compatible tables
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Select Tables Step */}
      {currentStep === 'select-tables' && sqliteData && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Select Tables to Import
                </CardTitle>
                <CardDescription>
                  {sqliteData.fileName} contains {sqliteData.tables.length} tables. 
                  {mappedTables.length} can be imported.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isClearing}>
                      {isClearing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Clear All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete ALL data from the database including cars, renters, 
                        rental sessions, payments, and all related records. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearData}>
                        Yes, Clear All Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" onClick={handleReset}>
                  Back
                </Button>
                <Button 
                  variant="accent" 
                  onClick={handleValidate}
                  disabled={selectedTables.size === 0 || isValidating}
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Validate & Import
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>

              {mappedTables.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Compatible Tables ({mappedTables.length})
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {mappedTables.map((table) => {
                      const mapping = getTableMapping(table.name);
                      return (
                        <Card 
                          key={table.name}
                          className={`cursor-pointer transition-all ${
                            selectedTables.has(table.name) 
                              ? 'border-accent bg-accent/5' 
                              : 'hover:border-muted-foreground'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={selectedTables.has(table.name)}
                                onCheckedChange={() => toggleTable(table.name)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium truncate">{table.name}</h4>
                                  <Badge variant="outline" className="ml-2 shrink-0">
                                    {table.rowCount} rows
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                  <ArrowRight className="w-3 h-3" />
                                  <span>{mapping?.targetTable}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {mapping?.description}
                                </p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-2 h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreview(table.name);
                                  }}
                                >
                                  Preview Data
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {unmappedTables.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Unsupported Tables ({unmappedTables.length})
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    These tables don't have a mapping to the target database and cannot be imported automatically.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {unmappedTables.map((table) => (
                      <Badge key={table.name} variant="secondary">
                        {table.name} ({table.rowCount} rows)
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Step */}
      {currentStep === 'preview' && sqliteData && previewTable && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Preview: {previewTable}
              </CardTitle>
              <CardDescription>
                Showing first 10 rows from {previewTable}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setCurrentStep('select-tables')}>
              Back to Selection
            </Button>
          </CardHeader>
          <CardContent>
            {(() => {
              const data = getPreviewData();
              if (!data || data.headers.length === 0) {
                return <p className="text-muted-foreground">No data to preview</p>;
              }
              return (
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">#</TableHead>
                        {data.headers.map((header, i) => (
                          <TableHead key={i}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          <TableCell className="font-mono text-muted-foreground">
                            {rowIndex + 1}
                          </TableCell>
                          {data.headers.map((header, colIndex) => (
                            <TableCell key={colIndex}>
                              {row[header] !== null && row[header] !== undefined
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
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Validation Step */}
      {currentStep === 'validate' && validationResult && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Validation Results
              </CardTitle>
              <CardDescription>
                {validationResult.isValid 
                  ? `All ${validationResult.totalRows} rows passed validation` 
                  : `Found ${validationResult.issues.filter(i => i.severity === 'error').length} errors and ${validationResult.issues.filter(i => i.severity === 'warning').length} warnings`
                }
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('select-tables')}>
                Back
              </Button>
              <Button 
                variant="accent" 
                onClick={handleStartImport}
                disabled={!validationResult.isValid && validationResult.issues.some(i => i.severity === 'error')}
              >
                {validationResult.isValid ? (
                  <>Proceed with Import</>
                ) : validationResult.issues.some(i => i.severity === 'error') ? (
                  <>Fix Errors First</>
                ) : (
                  <>Proceed with Warnings</>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{validationResult.totalRows}</div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{validationResult.tableStats.length}</div>
                  <div className="text-sm text-muted-foreground">Tables</div>
                </CardContent>
              </Card>
              <Card className={`${validationResult.issues.filter(i => i.severity === 'error').length > 0 ? 'bg-destructive/10 border-destructive' : 'bg-muted/30'}`}>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${validationResult.issues.filter(i => i.severity === 'error').length > 0 ? 'text-destructive' : ''}`}>
                    {validationResult.issues.filter(i => i.severity === 'error').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </CardContent>
              </Card>
              <Card className={`${validationResult.issues.filter(i => i.severity === 'warning').length > 0 ? 'bg-warning/10 border-warning' : 'bg-muted/30'}`}>
                <CardContent className="p-4 text-center">
                  <div className={`text-2xl font-bold ${validationResult.issues.filter(i => i.severity === 'warning').length > 0 ? 'text-warning' : ''}`}>
                    {validationResult.issues.filter(i => i.severity === 'warning').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Warnings</div>
                </CardContent>
              </Card>
            </div>

            {/* Table Stats */}
            <div>
              <h3 className="text-sm font-medium mb-3">Table Breakdown</h3>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Table</TableHead>
                      <TableHead className="text-right">Rows</TableHead>
                      <TableHead className="text-right">Errors</TableHead>
                      <TableHead className="text-right">Warnings</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validationResult.tableStats.map((stat) => (
                      <TableRow key={stat.table}>
                        <TableCell className="font-medium">{stat.table}</TableCell>
                        <TableCell className="text-right">{stat.rows}</TableCell>
                        <TableCell className="text-right">
                          {stat.errors > 0 && (
                            <Badge variant="destructive">{stat.errors}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {stat.warnings > 0 && (
                            <Badge className="bg-warning text-warning-foreground">{stat.warnings}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {stat.errors === 0 && stat.warnings === 0 ? (
                            <Badge className="bg-success text-success-foreground">Ready</Badge>
                          ) : stat.errors > 0 ? (
                            <Badge variant="destructive">Has Errors</Badge>
                          ) : (
                            <Badge className="bg-warning text-warning-foreground">Has Warnings</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Issue Details */}
            {validationResult.issues.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Issue Details (showing first 50)</h3>
                <div className="rounded-lg border overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Row</TableHead>
                        <TableHead>Column</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Issue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.issues.slice(0, 50).map((issue, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{getIssueIcon(issue.severity)}</TableCell>
                          <TableCell className="font-mono text-sm">{issue.table}</TableCell>
                          <TableCell className="font-mono text-sm">{issue.row}</TableCell>
                          <TableCell className="font-mono text-sm">{issue.column}</TableCell>
                          <TableCell className="font-mono text-sm max-w-[150px] truncate">
                            {issue.value !== null && issue.value !== undefined 
                              ? String(issue.value) 
                              : <span className="text-muted-foreground">NULL</span>
                            }
                          </TableCell>
                          <TableCell className="text-sm">{issue.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {validationResult.issues.length > 50 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    ...and {validationResult.issues.length - 50} more issues
                  </p>
                )}
              </div>
            )}

            {/* Success Message */}
            {validationResult.isValid && (
              <div className="bg-success/10 border border-success rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-success" />
                <div>
                  <h4 className="font-medium text-success">All data is valid!</h4>
                  <p className="text-sm text-muted-foreground">
                    You can proceed with the import. All {validationResult.totalRows} rows will be imported.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Step */}
      {currentStep === 'import' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Importing Data...
            </CardTitle>
            <CardDescription>
              Importing {progress.totalTables} tables. Please don't close this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    Table {progress.currentTableIndex} of {progress.totalTables}: {progress.currentTable}
                  </span>
                  <span>
                    {progress.rowsTotal > 0 
                      ? Math.round((progress.rowsCompleted / progress.rowsTotal) * 100) 
                      : 0}%
                  </span>
                </div>
                <Progress 
                  value={progress.rowsTotal > 0 ? (progress.rowsCompleted / progress.rowsTotal) * 100 : 0}
                  className="h-3"
                />
              </div>

              {progress.successfulTables.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {progress.successfulTables.map(table => (
                    <Badge key={table} className="bg-success/20 text-success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {table}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {currentStep === 'complete' && importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {importResult.success ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-warning" />
              )}
              Import {importResult.success ? 'Complete' : 'Finished with Issues'}
            </CardTitle>
            <CardDescription>{importResult.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Table</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead className="text-right">Imported</TableHead>
                    <TableHead className="text-right">Failed</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importResult.details.map((detail) => {
                    const mapping = getTableMapping(detail.table);
                    return (
                      <TableRow key={detail.table}>
                        <TableCell className="font-medium">{detail.table}</TableCell>
                        <TableCell>{mapping?.targetTable || '-'}</TableCell>
                        <TableCell className="text-right">{detail.imported}</TableCell>
                        <TableCell className="text-right">
                          {detail.failed > 0 ? detail.failed : '-'}
                        </TableCell>
                        <TableCell>
                          {detail.failed === 0 || detail.failed === -1 ? (
                            detail.imported > 0 ? (
                              <Badge className="bg-success/20 text-success">Success</Badge>
                            ) : (
                              <Badge variant="secondary">No data</Badge>
                            )
                          ) : (
                            <Badge className="bg-destructive/20 text-destructive">
                              Partial
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex gap-4 justify-center pt-4">
                <Button variant="outline" onClick={handleReset}>
                  Import Another Database
                </Button>
                <Button variant="accent" onClick={() => window.location.href = '/fleet'}>
                  View Fleet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
