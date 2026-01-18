import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useFinesData, TrafficFine } from '@/hooks/useFinesData';
import { Plus, Search, AlertTriangle, DollarSign, MapPin, Car, User, Calendar, MoreHorizontal, Eye, Edit, Check } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Fines() {
  const [searchQuery, setSearchQuery] = useState('');
  const { fines, unpaidFines, paidFines, totalUnpaid, totalPaid, repeatOffenders, renterFineCount, cars, renters, isLoading, isError } = useFinesData();

  const columns: Column<TrafficFine>[] = [
    { key: 'date', header: 'Date', cell: (row) => (<div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span>{new Date(row.offence_date).toLocaleDateString()}</span></div>) },
    { key: 'vehicle', header: 'Vehicle', cell: (row) => (<div className="flex items-center gap-2"><Car className="w-4 h-4 text-muted-foreground" /><span className="font-mono">{row.car?.plate_number}</span></div>) },
    { key: 'renter', header: 'Renter', cell: (row) => { if (!row.renter) return <span className="text-muted-foreground">Unassigned</span>; const isRepeat = renterFineCount[row.renter_id || ''] >= 2; return (<div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" /><span>{row.renter.first_name} {row.renter.last_name}</span>{isRepeat && <Badge variant="destructive" className="text-xs">Repeat</Badge>}</div>); } },
    { key: 'description', header: 'Offence', cell: (row) => (<div><p className="font-medium text-sm">{row.description}</p>{row.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {row.location}</p>}</div>) },
    { key: 'amount', header: 'Amount', cell: (row) => <span className="font-bold text-destructive">${row.amount}</span> },
    { key: 'status', header: 'Status', cell: (row) => (<div><StatusBadge status={row.is_paid ? 'paid' : 'unpaid'} />{row.is_paid && row.paid_by && <p className="text-xs text-muted-foreground mt-1">Paid by {row.paid_by}</p>}</div>) },
    { key: 'actions', header: '', className: 'w-12', cell: (row) => (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View Details</DropdownMenuItem><DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>{!row.is_paid && <DropdownMenuItem className="text-success"><Check className="w-4 h-4 mr-2" /> Mark as Paid</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>) },
  ];

  if (isLoading) return <MainLayout title="Traffic Fines" subtitle="Loading..."><Skeleton className="h-64" /></MainLayout>;
  if (isError) return <MainLayout title="Traffic Fines" subtitle="Error"><Card><CardContent className="p-6"><p className="text-destructive">Failed to load data.</p></CardContent></Card></MainLayout>;

  return (
    <MainLayout title="Traffic Fines" subtitle="Manage and track traffic offences">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="w-5 h-5 text-destructive" /></div><div><p className="text-2xl font-bold">{unpaidFines.length}</p><p className="text-sm text-muted-foreground">Unpaid Fines</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-destructive/10"><DollarSign className="w-5 h-5 text-destructive" /></div><div><p className="text-2xl font-bold">${totalUnpaid}</p><p className="text-sm text-muted-foreground">Outstanding</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-success/10"><DollarSign className="w-5 h-5 text-success" /></div><div><p className="text-2xl font-bold">${totalPaid}</p><p className="text-sm text-muted-foreground">Total Paid</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-warning/10"><User className="w-5 h-5 text-warning" /></div><div><p className="text-2xl font-bold">{repeatOffenders.length}</p><p className="text-sm text-muted-foreground">Repeat Offenders</p></div></div></CardContent></Card>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search fines..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
        <Button variant="accent"><Plus className="w-4 h-4 mr-2" /> Add Fine</Button>
      </div>
      <Tabs defaultValue="unpaid" className="space-y-4">
        <TabsList><TabsTrigger value="unpaid">Unpaid ({unpaidFines.length}){unpaidFines.length > 0 && <Badge variant="destructive" className="ml-2">${totalUnpaid}</Badge>}</TabsTrigger><TabsTrigger value="paid">Paid ({paidFines.length})</TabsTrigger></TabsList>
        <TabsContent value="unpaid"><DataTable columns={columns} data={unpaidFines} emptyMessage="No unpaid fines - great!" /></TabsContent>
        <TabsContent value="paid"><DataTable columns={columns} data={paidFines} emptyMessage="No paid fines recorded" /></TabsContent>
      </Tabs>
    </MainLayout>
  );
}
