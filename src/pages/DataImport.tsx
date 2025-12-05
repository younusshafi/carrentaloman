import { useState } from 'react';
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
} from 'lucide-react';

type ImportStep = 'upload' | 'preview' | 'mapping' | 'validation' | 'migrate';

// Mock imported data
const mockPreviewData = [
  { row: 1, make: 'Toyota', model: 'Camry', year: '2022', plate: 'ABC-123', price: '32000', status: 'Valid' },
  { row: 2, make: 'Honda', model: 'Civic', year: '2023', plate: 'XYZ-456', price: '28000', status: 'Valid' },
  { row: 3, make: 'Mazda', model: 'CX-5', year: '2021', plate: 'DEF-789', price: '35000', status: 'Valid' },
  { row: 4, make: 'Ford', model: 'Ranger', year: '2020', plate: '', price: '45000', status: 'Warning' },
  { row: 5, make: 'Kia', model: '', year: '2022', plate: 'MNO-678', price: '38000', status: 'Error' },
];

const mockColumnMappings = [
  { source: 'Vehicle Make', target: 'make' },
  { source: 'Vehicle Model', target: 'model' },
  { source: 'Year', target: 'year' },
  { source: 'Registration', target: 'plate_number' },
  { source: 'Purchase Price', target: 'purchase_price' },
  { source: 'Color', target: 'color' },
];

const targetColumns = [
  { value: 'make', label: 'Make' },
  { value: 'model', label: 'Model' },
  { value: 'year', label: 'Year' },
  { value: 'plate_number', label: 'Plate Number' },
  { value: 'purchase_price', label: 'Purchase Price' },
  { value: 'color', label: 'Color' },
  { value: 'body_type', label: 'Body Type' },
  { value: 'status', label: 'Status' },
  { value: 'skip', label: '-- Skip Column --' },
];

export default function DataImport() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [mappings, setMappings] = useState(mockColumnMappings);
  const [migrationProgress, setMigrationProgress] = useState(0);

  const steps = [
    { key: 'upload', label: 'Upload', icon: Upload },
    { key: 'preview', label: 'Preview', icon: FileSpreadsheet },
    { key: 'mapping', label: 'Mapping', icon: ArrowRight },
    { key: 'validation', label: 'Validation', icon: CheckCircle },
    { key: 'migrate', label: 'Migrate', icon: Database },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const validationResults = {
    total: mockPreviewData.length,
    valid: mockPreviewData.filter(d => d.status === 'Valid').length,
    warnings: mockPreviewData.filter(d => d.status === 'Warning').length,
    errors: mockPreviewData.filter(d => d.status === 'Error').length,
  };

  const handleFileUpload = () => {
    setUploadedFile('fleet_data.xlsx');
    setCurrentStep('preview');
  };

  const handleStartMigration = () => {
    setCurrentStep('migrate');
    // Simulate migration progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setMigrationProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 500);
  };

  return (
    <MainLayout title="Data Migration" subtitle="Import data from Excel files">
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

      {/* Step Content */}
      {currentStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Excel File</CardTitle>
            <CardDescription>Upload your fleet data spreadsheet</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
              onClick={handleFileUpload}
            >
              <FileUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Drop your Excel file here</h3>
              <p className="text-muted-foreground mb-4">or click to browse</p>
              <p className="text-sm text-muted-foreground">Supports .xlsx, .xls, .csv files up to 10MB</p>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'preview' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Showing first 5 rows from {uploadedFile}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('upload')}>
                Back
              </Button>
              <Button variant="accent" onClick={() => setCurrentStep('mapping')}>
                Continue to Mapping
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Make</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Plate</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPreviewData.map((row) => (
                    <TableRow key={row.row}>
                      <TableCell className="font-mono text-muted-foreground">{row.row}</TableCell>
                      <TableCell>{row.make}</TableCell>
                      <TableCell>{row.model || <span className="text-destructive">Missing</span>}</TableCell>
                      <TableCell>{row.year}</TableCell>
                      <TableCell>{row.plate || <span className="text-warning">Empty</span>}</TableCell>
                      <TableCell>${row.price}</TableCell>
                      <TableCell>
                        {row.status === 'Valid' && (
                          <Badge className="bg-success/15 text-success">Valid</Badge>
                        )}
                        {row.status === 'Warning' && (
                          <Badge className="bg-warning/15 text-warning">Warning</Badge>
                        )}
                        {row.status === 'Error' && (
                          <Badge className="bg-destructive/15 text-destructive">Error</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'mapping' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Column Mapping</CardTitle>
              <CardDescription>Map Excel columns to database fields</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('preview')}>
                Back
              </Button>
              <Button variant="accent" onClick={() => setCurrentStep('validation')}>
                Validate Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mappings.map((mapping, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Source Column</Label>
                    <p className="font-medium">{mapping.source}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Target Field</Label>
                    <Select
                      value={mapping.target}
                      onValueChange={(value) => {
                        const newMappings = [...mappings];
                        newMappings[index].target = value;
                        setMappings(newMappings);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {targetColumns.map((col) => (
                          <SelectItem key={col.value} value={col.value}>
                            {col.label}
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
                  disabled={validationResults.errors > 0}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Migrate to Supabase
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
                        <p className="text-2xl font-bold">{validationResults.total}</p>
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
                        <p className="text-2xl font-bold text-success">{validationResults.valid}</p>
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
                        <p className="text-2xl font-bold text-warning">{validationResults.warnings}</p>
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
                        <p className="text-2xl font-bold text-destructive">{validationResults.errors}</p>
                        <p className="text-sm text-muted-foreground">Errors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {validationResults.errors > 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Cannot proceed with migration</p>
                        <p className="text-sm text-muted-foreground">
                          Please fix the {validationResults.errors} error(s) in your data before continuing.
                          Row 5 is missing required field: Model
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {validationResults.warnings > 0 && (
                <Card className="border-warning/50 bg-warning/5 mt-4">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                      <div>
                        <p className="font-medium text-warning">Warnings detected</p>
                        <p className="text-sm text-muted-foreground">
                          {validationResults.warnings} row(s) have missing optional fields.
                          Row 4 is missing plate number (will be imported with empty value).
                        </p>
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
            <CardTitle>Migrating to Supabase</CardTitle>
            <CardDescription>Importing your data into the database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{migrationProgress}%</span>
                </div>
                <Progress value={migrationProgress} className="h-3" />
              </div>

              {migrationProgress < 100 ? (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Importing records... Please don't close this page.</span>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Migration Complete!</h3>
                  <p className="text-muted-foreground mb-6">
                    Successfully imported {validationResults.valid} records into your database.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="outline" onClick={() => {
                      setCurrentStep('upload');
                      setUploadedFile(null);
                      setMigrationProgress(0);
                    }}>
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
