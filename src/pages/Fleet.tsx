import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { mockCars } from '@/data/mockData';
import { Car as CarType, CarStatus } from '@/types';
import {
  Car,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  DollarSign,
  Grid,
  List,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Fleet() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CarStatus | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredCars = mockCars.filter((car) => {
    const matchesSearch =
      car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.plate_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || car.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const columns: Column<CarType>[] = [
    {
      key: 'vehicle',
      header: 'Vehicle',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {row.images[0] ? (
              <img src={row.images[0]} alt={`${row.make} ${row.model}`} className="w-full h-full object-cover" />
            ) : (
              <Car className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium">{row.make} {row.model}</p>
            <p className="text-sm text-muted-foreground">{row.year} • {row.color}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'plate',
      header: 'Plate Number',
      cell: (row) => (
        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{row.plate_number}</span>
      ),
    },
    {
      key: 'type',
      header: 'Body Type',
      cell: (row) => <span className="text-sm">{row.body_type}</span>,
    },
    {
      key: 'purchase',
      header: 'Purchase Price',
      cell: (row) => (
        <span className="font-medium">${row.purchase_price.toLocaleString()}</span>
      ),
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
            <DropdownMenuItem onClick={() => navigate(`/fleet/${row.id}`)}>
              <Eye className="w-4 h-4 mr-2" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            {row.status !== 'sold' && (
              <DropdownMenuItem>
                <DollarSign className="w-4 h-4 mr-2" /> Mark as Sold
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const statusCounts = {
    all: mockCars.length,
    available: mockCars.filter(c => c.status === 'available').length,
    rented: mockCars.filter(c => c.status === 'rented').length,
    maintenance: mockCars.filter(c => c.status === 'maintenance').length,
    reserved: mockCars.filter(c => c.status === 'reserved').length,
    sold: mockCars.filter(c => c.status === 'sold').length,
  };

  return (
    <MainLayout title="Fleet Management" subtitle="Manage your vehicle inventory">
      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'available', 'rented', 'maintenance', 'reserved', 'sold'] as const).map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
            className="capitalize"
          >
            {status === 'all' ? 'All' : status} ({statusCounts[status]})
          </Button>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by make, model, or plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-r-none"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-l-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="accent">
                <Plus className="w-4 h-4 mr-2" /> Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>Enter the vehicle details below</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" placeholder="e.g., Toyota" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="e.g., Camry" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder="e.g., 2023" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body_type">Body Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="ute">Ute</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" placeholder="e.g., Silver" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate">Plate Number</Label>
                  <Input id="plate" placeholder="e.g., ABC-123" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase_price">Purchase Price</Label>
                  <Input id="purchase_price" type="number" placeholder="e.g., 32000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input id="purchase_date" type="date" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="accent" onClick={() => setIsAddDialogOpen(false)}>
                  Add Vehicle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <DataTable
          columns={columns}
          data={filteredCars}
          onRowClick={(row) => navigate(`/fleet/${row.id}`)}
          emptyMessage="No vehicles found matching your criteria"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCars.map((car) => (
            <Card
              key={car.id}
              className="cursor-pointer card-hover"
              onClick={() => navigate(`/fleet/${car.id}`)}
            >
              <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden rounded-t-lg">
                {car.images[0] ? (
                  <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                ) : (
                  <Car className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{car.make} {car.model}</h3>
                    <p className="text-sm text-muted-foreground">{car.year} • {car.color}</p>
                  </div>
                  <StatusBadge status={car.status} />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{car.plate_number}</span>
                  <span className="text-sm font-medium">${car.purchase_price.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
