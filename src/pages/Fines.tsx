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
import { Badge } from '@/components/ui/badge';
import { mockTrafficFines, mockCars, mockRenters } from '@/data/mockData';
import { TrafficFine } from '@/types';
import {
  Plus,
  Search,
  AlertTriangle,
  DollarSign,
  MapPin,
  Car,
  User,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Check,
  Calendar,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Fines() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const unpaidFines = mockTrafficFines.filter(f => !f.is_paid);
  const paidFines = mockTrafficFines.filter(f => f.is_paid);

  const totalUnpaid = unpaidFines.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid = paidFines.reduce((sum, f) => sum + f.amount, 0);

  // Find repeat offenders (renters with 2+ fines)
  const renterFineCount = mockTrafficFines.reduce((acc, fine) => {
    if (fine.renter_id) {
      acc[fine.renter_id] = (acc[fine.renter_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const repeatOffenders = Object.entries(renterFineCount)
    .filter(([_, count]) => count >= 2)
    .map(([renterId, count]) => {
      const renter = mockRenters.find(r => r.id === renterId);
      return { renter, count };
    });

  const columns: Column<TrafficFine>[] = [
    {
      key: 'date',
      header: 'Date',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{new Date(row.offence_date).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono">{row.car?.plate_number}</span>
        </div>
      ),
    },
    {
      key: 'renter',
      header: 'Renter',
      cell: (row) => {
        if (!row.renter) {
          return <span className="text-muted-foreground">Unassigned</span>;
        }
        const isRepeatOffender = renterFineCount[row.renter_id || ''] >= 2;
        return (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{row.renter.first_name} {row.renter.last_name}</span>
            {isRepeatOffender && (
              <Badge variant="destructive" className="text-xs">Repeat</Badge>
            )}
          </div>
        );
      },
    },
    {
      key: 'description',
      header: 'Offence',
      cell: (row) => (
        <div>
          <p className="font-medium text-sm">{row.description}</p>
          {row.location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {row.location}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (row) => (
        <span className="font-bold text-destructive">${row.amount}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => (
        <div>
          <StatusBadge status={row.is_paid ? 'paid' : 'unpaid'} />
          {row.is_paid && row.paid_by && (
            <p className="text-xs text-muted-foreground mt-1">
              Paid by {row.paid_by}
            </p>
          )}
        </div>
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
            {!row.is_paid && (
              <DropdownMenuItem className="text-success">
                <Check className="w-4 h-4 mr-2" /> Mark as Paid
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <MainLayout title="Traffic Fines" subtitle="Manage and track traffic offences">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unpaidFines.length}</p>
                <p className="text-sm text-muted-foreground">Unpaid Fines</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <DollarSign className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalUnpaid}</p>
                <p className="text-sm text-muted-foreground">Outstanding</p>
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
                <p className="text-2xl font-bold">${totalPaid}</p>
                <p className="text-sm text-muted-foreground">Total Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <User className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{repeatOffenders.length}</p>
                <p className="text-sm text-muted-foreground">Repeat Offenders</p>
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
            placeholder="Search fines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent">
              <Plus className="w-4 h-4 mr-2" /> Add Fine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Traffic Fine</DialogTitle>
              <DialogDescription>Record a new traffic offence</DialogDescription>
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
                <Label>Date of Offence</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="e.g., Speeding - 15km/h over limit" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fine Amount ($)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="e.g., Pacific Highway" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Evidence</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Upload PDF or image</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={() => setIsAddDialogOpen(false)}>
                Add Fine
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="unpaid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unpaid">
            Unpaid ({unpaidFines.length})
            {unpaidFines.length > 0 && (
              <Badge variant="destructive" className="ml-2">${totalUnpaid}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="paid">Paid ({paidFines.length})</TabsTrigger>
          <TabsTrigger value="by-vehicle">By Vehicle</TabsTrigger>
          <TabsTrigger value="by-renter">By Renter</TabsTrigger>
        </TabsList>

        <TabsContent value="unpaid">
          <DataTable
            columns={columns}
            data={unpaidFines}
            emptyMessage="No unpaid fines - great!"
          />
        </TabsContent>

        <TabsContent value="paid">
          <DataTable
            columns={columns}
            data={paidFines}
            emptyMessage="No paid fines recorded"
          />
        </TabsContent>

        <TabsContent value="by-vehicle">
          <Card>
            <CardHeader>
              <CardTitle>Fines by Vehicle</CardTitle>
              <CardDescription>Overview of fines per car</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCars.map((car) => {
                  const carFines = mockTrafficFines.filter(f => f.car_id === car.id);
                  const unpaid = carFines.filter(f => !f.is_paid);
                  if (carFines.length === 0) return null;
                  
                  return (
                    <div key={car.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Car className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{car.make} {car.model}</p>
                          <p className="text-sm text-muted-foreground font-mono">{car.plate_number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Fines</p>
                          <p className="font-medium">{carFines.length}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Unpaid</p>
                          <p className={`font-medium ${unpaid.length > 0 ? 'text-destructive' : 'text-success'}`}>
                            ${unpaid.reduce((sum, f) => sum + f.amount, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-renter">
          <Card>
            <CardHeader>
              <CardTitle>Fines by Renter</CardTitle>
              <CardDescription>Track renter fine history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRenters.map((renter) => {
                  const renterFines = mockTrafficFines.filter(f => f.renter_id === renter.id);
                  const unpaid = renterFines.filter(f => !f.is_paid);
                  const isRepeatOffender = renterFines.length >= 2;
                  if (renterFines.length === 0) return null;
                  
                  return (
                    <div key={renter.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isRepeatOffender ? 'bg-destructive/20' : 'bg-muted'
                        }`}>
                          <User className={`w-5 h-5 ${isRepeatOffender ? 'text-destructive' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{renter.first_name} {renter.last_name}</p>
                            {isRepeatOffender && (
                              <Badge variant="destructive" className="text-xs">Repeat Offender</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{renter.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Fines</p>
                          <p className="font-medium">{renterFines.length}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Outstanding</p>
                          <p className={`font-bold ${unpaid.length > 0 ? 'text-destructive' : 'text-success'}`}>
                            ${unpaid.reduce((sum, f) => sum + f.amount, 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
