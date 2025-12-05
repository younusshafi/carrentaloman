import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { mockMaintenanceTickets, mockCars } from '@/data/mockData';
import { MaintenanceTicket, MaintenanceStatus } from '@/types';
import {
  Plus,
  Search,
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  Car,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Play,
  XCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Maintenance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all');

  const openTickets = mockMaintenanceTickets.filter(t => t.status === 'open');
  const inProgressTickets = mockMaintenanceTickets.filter(t => t.status === 'in_progress');
  const completedTickets = mockMaintenanceTickets.filter(t => t.status === 'completed');

  const filteredTickets = mockMaintenanceTickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.car?.plate_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCost = mockMaintenanceTickets
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.actual_cost || 0), 0);

  const columns: Column<MaintenanceTicket>[] = [
    {
      key: 'ticket',
      header: 'Ticket',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            row.priority === 'urgent' ? 'bg-destructive/20' :
            row.priority === 'high' ? 'bg-warning/20' :
            row.priority === 'medium' ? 'bg-info/20' :
            'bg-muted'
          }`}>
            <Wrench className={`w-5 h-5 ${
              row.priority === 'urgent' ? 'text-destructive' :
              row.priority === 'high' ? 'text-warning' :
              row.priority === 'medium' ? 'text-info' :
              'text-muted-foreground'
            }`} />
          </div>
          <div>
            <p className="font-medium">{row.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-muted-foreground" />
          <span>{row.car?.plate_number}</span>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      cell: (row) => <StatusBadge status={row.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'cost',
      header: 'Cost',
      cell: (row) => (
        <span className="font-medium">
          {row.actual_cost
            ? `$${row.actual_cost}`
            : row.estimated_cost
            ? `Est. $${row.estimated_cost}`
            : '-'}
        </span>
      ),
    },
    {
      key: 'assigned',
      header: 'Assigned To',
      cell: (row) => (
        <span className="text-sm">{row.assigned_to || 'Unassigned'}</span>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'w-12',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="w-4 h-4 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            {row.status === 'open' && (
              <DropdownMenuItem>
                <Play className="w-4 h-4 mr-2" /> Start Work
              </DropdownMenuItem>
            )}
            {row.status === 'in_progress' && (
              <DropdownMenuItem className="text-success">
                <CheckCircle className="w-4 h-4 mr-2" /> Mark Complete
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive">
              <XCircle className="w-4 h-4 mr-2" /> Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <MainLayout title="Maintenance Management" subtitle="Track service and repairs">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openTickets.length}</p>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressTickets.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
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
                <p className="text-2xl font-bold">{completedTickets.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Wrench className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MaintenanceStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent">
              <Plus className="w-4 h-4 mr-2" /> Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Maintenance Ticket</DialogTitle>
              <DialogDescription>Log a new maintenance issue</DialogDescription>
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
                <Label>Title</Label>
                <Input placeholder="e.g., Brake Pad Replacement" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe the issue..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Estimated Cost ($)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Input placeholder="e.g., Workshop A" />
              </div>
              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload images or videos</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={() => setIsCreateDialogOpen(false)}>
                Create Ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban-style Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              Open ({openTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {openTickets.map((ticket) => (
              <div key={ticket.id} className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{ticket.title}</p>
                  <StatusBadge status={ticket.priority} />
                </div>
                <p className="text-xs text-muted-foreground">{ticket.car?.plate_number}</p>
              </div>
            ))}
            {openTickets.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No open tickets</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning" />
              In Progress ({inProgressTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inProgressTickets.map((ticket) => (
              <div key={ticket.id} className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{ticket.title}</p>
                  <StatusBadge status={ticket.priority} />
                </div>
                <p className="text-xs text-muted-foreground">{ticket.car?.plate_number}</p>
              </div>
            ))}
            {inProgressTickets.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No tickets in progress</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              Completed ({completedTickets.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedTickets.slice(0, 3).map((ticket) => (
              <div key={ticket.id} className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm">{ticket.title}</p>
                  <span className="text-xs font-medium text-success">${ticket.actual_cost}</span>
                </div>
                <p className="text-xs text-muted-foreground">{ticket.car?.plate_number}</p>
              </div>
            ))}
            {completedTickets.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No completed tickets</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>Complete maintenance history</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredTickets}
            emptyMessage="No maintenance tickets found"
          />
        </CardContent>
      </Card>
    </MainLayout>
  );
}
