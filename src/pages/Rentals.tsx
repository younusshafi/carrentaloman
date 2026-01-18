import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useRentalsData, RentalSession } from '@/hooks/useRentalsData';
import {
  Plus,
  Search,
  Car,
  User,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Eye,
  CalendarPlus,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Rentals() {
  const navigate = useNavigate();
  const { 
    activeRentals, 
    completedRentals, 
    timelineData,
    availableCars,
    availableRenters,
    weeklyRevenue,
    endingSoon,
    isLoading,
    isError 
  } = useRentalsData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const columns: Column<RentalSession>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">{row.car?.make} {row.car?.model}</p>
            <p className="text-sm text-muted-foreground">{row.car?.plate_number}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'renter',
      header: 'Renter',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="font-medium">{row.renter?.first_name} {row.renter?.last_name}</p>
            <p className="text-sm text-muted-foreground">{row.renter?.phone}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Rental Period',
      cell: (row) => (
        <div className="text-sm">
          <p>{new Date(row.start_date).toLocaleDateString()} - {row.end_date ? new Date(row.end_date).toLocaleDateString() : 'Ongoing'}</p>
          {row.end_date && (
            <p className="text-muted-foreground">
              {Math.ceil((new Date(row.end_date).getTime() - new Date(row.start_date).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'rent',
      header: 'Weekly Rent',
      cell: (row) => <span className="font-medium">${row.weekly_rent}</span>,
    },
    {
      key: 'bond',
      header: 'Bond',
      cell: (row) => <span className="text-sm">${row.bond_amount || 0}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      cell: (row) => <span className="font-semibold">${Number(row.total_amount || 0).toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
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
            <DropdownMenuItem onClick={() => navigate(`/rentals/${row.id}`)}>
              <Eye className="w-4 h-4 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DollarSign className="w-4 h-4 mr-2" /> Add Payment
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CalendarPlus className="w-4 h-4 mr-2" /> Extend Rental
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="w-4 h-4 mr-2" /> Download Contract
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="w-4 h-4 mr-2" /> Send Reminder
            </DropdownMenuItem>
            {row.status === 'active' && (
              <DropdownMenuItem className="text-destructive">
                <X className="w-4 h-4 mr-2" /> Close Rental
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Rental Operations" subtitle="Loading rentals...">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout title="Rental Operations" subtitle="Error loading data">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load rental data. Please try again.</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Rental Operations" subtitle="Manage rentals and bookings">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Calendar className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeRentals.length}</p>
                <p className="text-sm text-muted-foreground">Active Rentals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">${weeklyRevenue}</p>
                <p className="text-sm text-muted-foreground">Weekly Revenue</p>
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
                <p className="text-2xl font-bold">{endingSoon}</p>
                <p className="text-sm text-muted-foreground">Ending Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Car className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{availableCars.length}</p>
                <p className="text-sm text-muted-foreground">Available Cars</p>
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
            placeholder="Search rentals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent">
              <Plus className="w-4 h-4 mr-2" /> New Rental
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Rental</DialogTitle>
              <DialogDescription>Set up a new rental agreement</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Select Vehicle</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a car" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.make} {car.model} ({car.plate_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Select Renter</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a renter" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRenters.map((renter) => (
                      <SelectItem key={renter.id} value={renter.id}>
                        {renter.first_name} {renter.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Weekly Rent ($)</Label>
                <Input type="number" placeholder="450" />
              </div>
              <div className="space-y-2">
                <Label>Bond Amount ($)</Label>
                <Input type="number" placeholder="1000" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={() => setIsCreateDialogOpen(false)}>
                Create Rental
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="active">Active ({activeRentals.length})</TabsTrigger>
          <TabsTrigger value="history">History ({completedRentals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Rental Timeline</CardTitle>
              <CardDescription>Visual overview of active rentals</CardDescription>
            </CardHeader>
            <CardContent>
              {timelineData.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active rentals</p>
              ) : (
                <div className="space-y-4">
                  {timelineData.map((rental) => (
                    <div key={rental.id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center">
                            <Car className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{rental.car?.make} {rental.car?.model}</p>
                            <p className="text-sm text-muted-foreground">{rental.car?.plate_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{rental.renter?.first_name} {rental.renter?.last_name}</p>
                            <p className="text-sm text-muted-foreground">${rental.weekly_rent}/week</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/rentals/${rental.id}`)}>
                            View
                          </Button>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {new Date(rental.start_date).toLocaleDateString()}
                          </span>
                          <span className={`font-medium ${rental.daysRemaining <= 7 ? 'text-warning' : ''}`}>
                            {rental.daysRemaining > 0 ? `${rental.daysRemaining} days remaining` : 'Ending today'}
                          </span>
                          <span className="text-muted-foreground">
                            {rental.end_date ? new Date(rental.end_date).toLocaleDateString() : 'Ongoing'}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              rental.daysRemaining <= 7 ? 'bg-warning' : 'bg-info'
                            }`}
                            style={{ width: `${rental.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <DataTable
            columns={columns}
            data={activeRentals}
            onRowClick={(row) => navigate(`/rentals/${row.id}`)}
            emptyMessage="No active rentals"
          />
        </TabsContent>

        <TabsContent value="history">
          <DataTable
            columns={columns}
            data={completedRentals}
            onRowClick={(row) => navigate(`/rentals/${row.id}`)}
            emptyMessage="No completed rentals yet"
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
