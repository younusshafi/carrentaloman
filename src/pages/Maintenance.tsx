import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useMaintenanceData, MaintenanceTicket } from '@/hooks/useMaintenanceData';
import { Plus, Search, Wrench, Clock, CheckCircle, AlertTriangle, Car, MoreHorizontal, Eye, Edit, Play, XCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type MaintenanceStatus = 'open' | 'in_progress' | 'completed' | 'all';

export default function Maintenance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus>('all');
  const { tickets, openTickets, inProgressTickets, completedTickets, totalCost, cars, isLoading, isError } = useMaintenanceData();

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) || ticket.car?.plate_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<MaintenanceTicket>[] = [
    { key: 'ticket', header: 'Ticket', cell: (row) => (<div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-lg flex items-center justify-center ${row.priority === 'urgent' ? 'bg-destructive/20' : row.priority === 'high' ? 'bg-warning/20' : 'bg-muted'}`}><Wrench className={`w-5 h-5 ${row.priority === 'urgent' ? 'text-destructive' : row.priority === 'high' ? 'text-warning' : 'text-muted-foreground'}`} /></div><div><p className="font-medium">{row.title}</p><p className="text-sm text-muted-foreground line-clamp-1">{row.description}</p></div></div>) },
    { key: 'vehicle', header: 'Vehicle', cell: (row) => (<div className="flex items-center gap-2"><Car className="w-4 h-4 text-muted-foreground" /><span>{row.car?.plate_number}</span></div>) },
    { key: 'priority', header: 'Priority', cell: (row) => <StatusBadge status={row.priority} /> },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { key: 'cost', header: 'Cost', cell: (row) => <span className="font-medium">{row.actual_cost ? `$${row.actual_cost}` : row.estimated_cost ? `Est. $${row.estimated_cost}` : '-'}</span> },
    { key: 'actions', header: '', className: 'w-12', cell: (row) => (<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>{row.status === 'open' && <DropdownMenuItem><Play className="w-4 h-4 mr-2" /> Start</DropdownMenuItem>}{row.status === 'in_progress' && <DropdownMenuItem className="text-success"><CheckCircle className="w-4 h-4 mr-2" /> Complete</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu>) },
  ];

  if (isLoading) return <MainLayout title="Maintenance" subtitle="Loading..."><Skeleton className="h-64" /></MainLayout>;
  if (isError) return <MainLayout title="Maintenance" subtitle="Error"><Card><CardContent className="p-6"><p className="text-destructive">Failed to load data.</p></CardContent></Card></MainLayout>;

  return (
    <MainLayout title="Maintenance Management" subtitle="Track service and repairs">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-destructive/10"><AlertTriangle className="w-5 h-5 text-destructive" /></div><div><p className="text-2xl font-bold">{openTickets.length}</p><p className="text-sm text-muted-foreground">Open Tickets</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-warning/10"><Clock className="w-5 h-5 text-warning" /></div><div><p className="text-2xl font-bold">{inProgressTickets.length}</p><p className="text-sm text-muted-foreground">In Progress</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-success/10"><CheckCircle className="w-5 h-5 text-success" /></div><div><p className="text-2xl font-bold">{completedTickets.length}</p><p className="text-sm text-muted-foreground">Completed</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-accent/10"><Wrench className="w-5 h-5 text-accent" /></div><div><p className="text-2xl font-bold">${totalCost.toLocaleString()}</p><p className="text-sm text-muted-foreground">Total Spent</p></div></div></CardContent></Card>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MaintenanceStatus)}><SelectTrigger className="w-40"><SelectValue placeholder="Filter status" /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select>
        <Button variant="accent"><Plus className="w-4 h-4 mr-2" /> Create Ticket</Button>
      </div>
      <Card><CardHeader><CardTitle>All Tickets</CardTitle></CardHeader><CardContent><DataTable columns={columns} data={filteredTickets} emptyMessage="No maintenance tickets found" /></CardContent></Card>
    </MainLayout>
  );
}
