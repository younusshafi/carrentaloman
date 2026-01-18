import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useInsuranceData, InsuranceRecord, RegoRecord } from '@/hooks/useInsuranceData';
import { Shield, FileText, AlertTriangle, Clock, CheckCircle, Car, Upload, MoreHorizontal, Eye, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Insurance() {
  const { insuranceRecords, regoRecords, expiredInsurance, criticalInsurance, warningInsurance, validInsurance, expiredRego, criticalRego, warningRego, validRego, cars, getDaysUntilExpiry, getExpiryStatus, isLoading, isError } = useInsuranceData();

  const insuranceColumns: Column<InsuranceRecord>[] = [
    { key: 'vehicle', header: 'Vehicle', cell: (row) => (<div className="flex items-center gap-2"><Car className="w-4 h-4 text-muted-foreground" /><div><p className="font-medium">{row.car?.make} {row.car?.model}</p><p className="text-sm text-muted-foreground font-mono">{row.car?.plate_number}</p></div></div>) },
    { key: 'provider', header: 'Provider', cell: (row) => <span className="font-medium">{row.provider}</span> },
    { key: 'policy', header: 'Policy Number', cell: (row) => <span className="font-mono text-sm">{row.policy_number}</span> },
    { key: 'premium', header: 'Premium', cell: (row) => <span className="font-medium">${row.premium_amount}</span> },
    { key: 'expiry', header: 'Expiry', cell: (row) => { const status = getExpiryStatus(row.expiry_date); return (<div className="space-y-1"><p className="text-sm">{new Date(row.expiry_date).toLocaleDateString()}</p><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.className}`}>{status.label}</span></div>); } },
    { key: 'actions', header: '', className: 'w-12', cell: () => (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem><DropdownMenuItem><RefreshCw className="w-4 h-4 mr-2" /> Renew</DropdownMenuItem></DropdownMenuContent></DropdownMenu>) },
  ];

  const regoColumns: Column<RegoRecord>[] = [
    { key: 'vehicle', header: 'Vehicle', cell: (row) => (<div className="flex items-center gap-2"><Car className="w-4 h-4 text-muted-foreground" /><div><p className="font-medium">{row.car?.make} {row.car?.model}</p><p className="text-sm text-muted-foreground font-mono">{row.car?.plate_number}</p></div></div>) },
    { key: 'rego', header: 'Rego Number', cell: (row) => <span className="font-mono">{row.rego_number}</span> },
    { key: 'state', header: 'State', cell: (row) => <span className="font-medium">{row.state}</span> },
    { key: 'renewal', header: 'Renewal Cost', cell: (row) => <span className="font-medium">${row.renewal_amount}</span> },
    { key: 'expiry', header: 'Expiry', cell: (row) => { const status = getExpiryStatus(row.expiry_date); return (<div className="space-y-1"><p className="text-sm">{new Date(row.expiry_date).toLocaleDateString()}</p><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.className}`}>{status.label}</span></div>); } },
    { key: 'actions', header: '', className: 'w-12', cell: () => (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem><DropdownMenuItem><RefreshCw className="w-4 h-4 mr-2" /> Renew</DropdownMenuItem></DropdownMenuContent></DropdownMenu>) },
  ];

  if (isLoading) return <MainLayout title="Insurance & Registration" subtitle="Loading..."><Skeleton className="h-64" /></MainLayout>;
  if (isError) return <MainLayout title="Insurance & Registration" subtitle="Error"><Card><CardContent className="p-6"><p className="text-destructive">Failed to load data.</p></CardContent></Card></MainLayout>;

  return (
    <MainLayout title="Insurance & Registration" subtitle="Track expiries and renewals">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className={expiredInsurance.length + expiredRego.length > 0 ? 'border-destructive/50' : ''}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="w-5 h-5 text-destructive" /></div><div><p className="text-2xl font-bold">{expiredInsurance.length + expiredRego.length}</p><p className="text-sm text-muted-foreground">Expired</p></div></div></CardContent></Card>
        <Card className={criticalInsurance.length + criticalRego.length > 0 ? 'border-destructive/50' : ''}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-destructive/10"><Clock className="w-5 h-5 text-destructive" /></div><div><p className="text-2xl font-bold">{criticalInsurance.length + criticalRego.length}</p><p className="text-sm text-muted-foreground">&lt;15 Days</p></div></div></CardContent></Card>
        <Card className={warningInsurance.length + warningRego.length > 0 ? 'border-warning/50' : ''}><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-warning/10"><Clock className="w-5 h-5 text-warning" /></div><div><p className="text-2xl font-bold">{warningInsurance.length + warningRego.length}</p><p className="text-sm text-muted-foreground">&lt;45 Days</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-success/10"><CheckCircle className="w-5 h-5 text-success" /></div><div><p className="text-2xl font-bold">{validInsurance.length + validRego.length}</p><p className="text-sm text-muted-foreground">Valid</p></div></div></CardContent></Card>
      </div>
      <Tabs defaultValue="insurance" className="space-y-4">
        <TabsList><TabsTrigger value="insurance" className="flex items-center gap-2"><Shield className="w-4 h-4" />Insurance ({insuranceRecords.length})</TabsTrigger><TabsTrigger value="rego" className="flex items-center gap-2"><FileText className="w-4 h-4" />Registration ({regoRecords.length})</TabsTrigger></TabsList>
        <TabsContent value="insurance"><Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Insurance Records</CardTitle><CardDescription>All vehicle insurance policies</CardDescription></div><Button variant="accent"><Upload className="w-4 h-4 mr-2" /> Add Insurance</Button></CardHeader><CardContent><DataTable columns={insuranceColumns} data={insuranceRecords} emptyMessage="No insurance records" /></CardContent></Card></TabsContent>
        <TabsContent value="rego"><Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Registration Records</CardTitle><CardDescription>All vehicle registrations</CardDescription></div><Button variant="accent"><Upload className="w-4 h-4 mr-2" /> Add Registration</Button></CardHeader><CardContent><DataTable columns={regoColumns} data={regoRecords} emptyMessage="No registration records" /></CardContent></Card></TabsContent>
      </Tabs>
    </MainLayout>
  );
}
