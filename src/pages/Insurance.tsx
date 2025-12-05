import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockInsuranceRecords, mockRegoRecords, mockCars } from '@/data/mockData';
import { InsuranceRecord, RegoRecord } from '@/types';
import {
  Shield,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  Car,
  Upload,
  Calendar,
  DollarSign,
  MoreHorizontal,
  Eye,
  RefreshCw,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Insurance() {
  const today = new Date();
  const in15Days = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
  const in45Days = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000);

  // Categorize insurance
  const expiredInsurance = mockInsuranceRecords.filter(r => new Date(r.expiry_date) < today);
  const criticalInsurance = mockInsuranceRecords.filter(r => {
    const expiry = new Date(r.expiry_date);
    return expiry >= today && expiry <= in15Days;
  });
  const warningInsurance = mockInsuranceRecords.filter(r => {
    const expiry = new Date(r.expiry_date);
    return expiry > in15Days && expiry <= in45Days;
  });
  const validInsurance = mockInsuranceRecords.filter(r => new Date(r.expiry_date) > in45Days);

  // Categorize rego
  const expiredRego = mockRegoRecords.filter(r => new Date(r.expiry_date) < today);
  const criticalRego = mockRegoRecords.filter(r => {
    const expiry = new Date(r.expiry_date);
    return expiry >= today && expiry <= in15Days;
  });
  const warningRego = mockRegoRecords.filter(r => {
    const expiry = new Date(r.expiry_date);
    return expiry > in15Days && expiry <= in45Days;
  });
  const validRego = mockRegoRecords.filter(r => new Date(r.expiry_date) > in45Days);

  const getDaysUntilExpiry = (date: string) => {
    const expiry = new Date(date);
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (date: string) => {
    const days = getDaysUntilExpiry(date);
    if (days < 0) return { label: 'Expired', className: 'bg-destructive/15 text-destructive' };
    if (days <= 15) return { label: `${days} days`, className: 'bg-destructive/15 text-destructive' };
    if (days <= 45) return { label: `${days} days`, className: 'bg-warning/15 text-warning' };
    return { label: `${days} days`, className: 'bg-success/15 text-success' };
  };

  const insuranceColumns: Column<InsuranceRecord>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (row) => {
        const car = mockCars.find(c => c.id === row.car_id);
        return (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{car?.make} {car?.model}</p>
              <p className="text-sm text-muted-foreground font-mono">{car?.plate_number}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'provider',
      header: 'Provider',
      cell: (row) => <span className="font-medium">{row.provider}</span>,
    },
    {
      key: 'policy',
      header: 'Policy Number',
      cell: (row) => <span className="font-mono text-sm">{row.policy_number}</span>,
    },
    {
      key: 'premium',
      header: 'Premium',
      cell: (row) => <span className="font-medium">${row.premium_amount}</span>,
    },
    {
      key: 'expiry',
      header: 'Expiry',
      cell: (row) => {
        const status = getExpiryStatus(row.expiry_date);
        return (
          <div className="space-y-1">
            <p className="text-sm">{new Date(row.expiry_date).toLocaleDateString()}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" /> View Document
            </DropdownMenuItem>
            <DropdownMenuItem>
              <RefreshCw className="w-4 h-4 mr-2" /> Renew
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const regoColumns: Column<RegoRecord>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (row) => {
        const car = mockCars.find(c => c.id === row.car_id);
        return (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{car?.make} {car?.model}</p>
              <p className="text-sm text-muted-foreground font-mono">{car?.plate_number}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'rego',
      header: 'Rego Number',
      cell: (row) => <span className="font-mono">{row.rego_number}</span>,
    },
    {
      key: 'state',
      header: 'State',
      cell: (row) => <span className="font-medium">{row.state}</span>,
    },
    {
      key: 'renewal',
      header: 'Renewal Cost',
      cell: (row) => <span className="font-medium">${row.renewal_amount}</span>,
    },
    {
      key: 'expiry',
      header: 'Expiry',
      cell: (row) => {
        const status = getExpiryStatus(row.expiry_date);
        return (
          <div className="space-y-1">
            <p className="text-sm">{new Date(row.expiry_date).toLocaleDateString()}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.className}`}>
              {status.label}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" /> View Document
            </DropdownMenuItem>
            <DropdownMenuItem>
              <RefreshCw className="w-4 h-4 mr-2" /> Renew
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <MainLayout title="Insurance & Registration" subtitle="Track expiries and renewals">
      {/* Expiry Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className={expiredInsurance.length + expiredRego.length > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expiredInsurance.length + expiredRego.length}</p>
                <p className="text-sm text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={criticalInsurance.length + criticalRego.length > 0 ? 'border-destructive/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Clock className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalInsurance.length + criticalRego.length}</p>
                <p className="text-sm text-muted-foreground">&lt;15 Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={warningInsurance.length + warningRego.length > 0 ? 'border-warning/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{warningInsurance.length + warningRego.length}</p>
                <p className="text-sm text-muted-foreground">&lt;45 Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{validInsurance.length + validRego.length}</p>
                <p className="text-sm text-muted-foreground">Valid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards for Critical Items */}
      {(criticalInsurance.length > 0 || criticalRego.length > 0 || expiredInsurance.length > 0 || expiredRego.length > 0) && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Urgent Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...expiredInsurance, ...criticalInsurance].map((ins) => {
                const car = mockCars.find(c => c.id === ins.car_id);
                const days = getDaysUntilExpiry(ins.expiry_date);
                return (
                  <div key={ins.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="font-medium">{car?.plate_number} - Insurance</p>
                        <p className="text-sm text-muted-foreground">{ins.provider}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${days < 0 ? 'text-destructive' : 'text-warning'}`}>
                        {days < 0 ? 'EXPIRED' : `${days} days`}
                      </p>
                      <Button size="xs" variant="destructive">Renew Now</Button>
                    </div>
                  </div>
                );
              })}
              {[...expiredRego, ...criticalRego].map((rego) => {
                const car = mockCars.find(c => c.id === rego.car_id);
                const days = getDaysUntilExpiry(rego.expiry_date);
                return (
                  <div key={rego.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="font-medium">{car?.plate_number} - Registration</p>
                        <p className="text-sm text-muted-foreground">{rego.state}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${days < 0 ? 'text-destructive' : 'text-warning'}`}>
                        {days < 0 ? 'EXPIRED' : `${days} days`}
                      </p>
                      <Button size="xs" variant="destructive">Renew Now</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="insurance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="insurance" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Insurance ({mockInsuranceRecords.length})
          </TabsTrigger>
          <TabsTrigger value="rego" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Registration ({mockRegoRecords.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insurance">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Insurance Records</CardTitle>
                <CardDescription>All vehicle insurance policies</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="accent">
                    <Upload className="w-4 h-4 mr-2" /> Add Insurance
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Insurance Record</DialogTitle>
                    <DialogDescription>Upload new insurance details</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Vehicle</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCars.map((car) => (
                            <SelectItem key={car.id} value={car.id}>
                              {car.make} {car.model} ({car.plate_number})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Input placeholder="e.g., NRMA Insurance" />
                    </div>
                    <div className="space-y-2">
                      <Label>Policy Number</Label>
                      <Input placeholder="e.g., POL-001234" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input type="date" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Premium Amount ($)</Label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Document</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Upload policy document</p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="accent">Add Insurance</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={insuranceColumns}
                data={mockInsuranceRecords}
                emptyMessage="No insurance records"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rego">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Registration Records</CardTitle>
                <CardDescription>All vehicle registrations</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="accent">
                    <Upload className="w-4 h-4 mr-2" /> Add Registration
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Registration Record</DialogTitle>
                    <DialogDescription>Upload new registration details</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Vehicle</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCars.map((car) => (
                            <SelectItem key={car.id} value={car.id}>
                              {car.make} {car.model} ({car.plate_number})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Rego Number</Label>
                        <Input placeholder="e.g., ABC-123" />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NSW">NSW</SelectItem>
                            <SelectItem value="VIC">VIC</SelectItem>
                            <SelectItem value="QLD">QLD</SelectItem>
                            <SelectItem value="WA">WA</SelectItem>
                            <SelectItem value="SA">SA</SelectItem>
                            <SelectItem value="TAS">TAS</SelectItem>
                            <SelectItem value="NT">NT</SelectItem>
                            <SelectItem value="ACT">ACT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Renewal Amount ($)</Label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Document</Label>
                      <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Upload rego document</p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="accent">Add Registration</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={regoColumns}
                data={mockRegoRecords}
                emptyMessage="No registration records"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
