import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomersData, Renter } from '@/hooks/useCustomersData';
import {
  Plus,
  Search,
  User,
  AlertTriangle,
  Calendar,
  Ban,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Customers() {
  const navigate = useNavigate();
  const { 
    renters, 
    activeRenters, 
    blacklistedRenters, 
    currentlyRenting,
    withUnpaidFines,
    getRenterStats, 
    isLoading,
    isError 
  } = useCustomersData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredRenters = renters.filter((renter) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      renter.first_name.toLowerCase().includes(searchLower) ||
      renter.last_name.toLowerCase().includes(searchLower) ||
      (renter.email?.toLowerCase().includes(searchLower) || false) ||
      renter.phone.includes(searchQuery)
    );
  });

  const columns: Column<Renter>[] = [
    {
      key: 'name',
      header: 'Customer',
      cell: (row) => {
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-accent/20 text-accent">
                {row.first_name[0]}{row.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{row.first_name} {row.last_name}</p>
                {row.is_blacklisted && (
                  <Badge variant="destructive" className="text-xs">Blacklisted</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{row.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (row) => (
        <span className="text-sm">{row.phone}</span>
      ),
    },
    {
      key: 'license',
      header: 'License',
      cell: (row) => {
        const isExpired = row.license_expiry ? new Date(row.license_expiry) < new Date() : false;
        const isExpiringSoon = row.license_expiry && !isExpired && new Date(row.license_expiry) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return (
          <div>
            <p className="font-mono text-sm">{row.license_number || 'N/A'}</p>
            {row.license_expiry && (
              <p className={`text-xs ${isExpired ? 'text-destructive' : isExpiringSoon ? 'text-warning' : 'text-muted-foreground'}`}>
                Exp: {new Date(row.license_expiry).toLocaleDateString()}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: 'rentals',
      header: 'Rentals',
      cell: (row) => {
        const stats = getRenterStats(row.id);
        return (
          <div className="text-sm">
            <p className="font-medium">{stats.totalRentals} total</p>
            {stats.activeRentals > 0 && (
              <p className="text-info">{stats.activeRentals} active</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'fines',
      header: 'Fines',
      cell: (row) => {
        const stats = getRenterStats(row.id);
        return (
          <div className="text-sm">
            {stats.unpaidFines > 0 ? (
              <div className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="w-3 h-3" />
                <span>{stats.unpaidFines} unpaid (${stats.outstandingAmount})</span>
              </div>
            ) : stats.totalFines > 0 ? (
              <span className="text-muted-foreground">{stats.totalFines} (all paid)</span>
            ) : (
              <span className="text-muted-foreground">None</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'spent',
      header: 'Total Spent',
      cell: (row) => {
        const stats = getRenterStats(row.id);
        return <span className="font-medium">${stats.totalSpent.toLocaleString()}</span>;
      },
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
            <DropdownMenuItem onClick={() => navigate(`/customers/${row.id}`)}>
              <Eye className="w-4 h-4 mr-2" /> View Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="w-4 h-4 mr-2" /> View Documents
            </DropdownMenuItem>
            {!row.is_blacklisted ? (
              <DropdownMenuItem className="text-destructive">
                <Ban className="w-4 h-4 mr-2" /> Blacklist
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-success">
                <User className="w-4 h-4 mr-2" /> Remove from Blacklist
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Customer Database" subtitle="Loading customers...">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout title="Customer Database" subtitle="Error loading data">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load customer data. Please try again.</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Customer Database" subtitle="Manage renters and their information">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <User className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{renters.length}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Calendar className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentlyRenting}</p>
                <p className="text-sm text-muted-foreground">Currently Renting</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Ban className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{blacklistedRenters.length}</p>
                <p className="text-sm text-muted-foreground">Blacklisted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{withUnpaidFines}</p>
                <p className="text-sm text-muted-foreground">With Unpaid Fines</p>
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
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent">
              <Plus className="w-4 h-4 mr-2" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>Enter the customer details below</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Smith" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="+61 400 123 456" />
              </div>
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input placeholder="DL12345678" />
              </div>
              <div className="space-y-2">
                <Label>License Expiry</Label>
                <Input type="date" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Address</Label>
                <Input placeholder="123 Main St, Sydney NSW 2000" />
              </div>
              <div className="space-y-2">
                <Label>License Document</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>ID Document</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={() => setIsAddDialogOpen(false)}>
                Add Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Customers ({renters.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeRenters.length})</TabsTrigger>
          <TabsTrigger value="blacklisted">
            Blacklisted ({blacklistedRenters.length})
            {blacklistedRenters.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {blacklistedRenters.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={searchQuery ? filteredRenters : renters}
            onRowClick={(row) => navigate(`/customers/${row.id}`)}
            emptyMessage="No customers found"
          />
        </TabsContent>

        <TabsContent value="active">
          <DataTable
            columns={columns}
            data={activeRenters}
            onRowClick={(row) => navigate(`/customers/${row.id}`)}
            emptyMessage="No active customers"
          />
        </TabsContent>

        <TabsContent value="blacklisted">
          <DataTable
            columns={columns}
            data={blacklistedRenters}
            onRowClick={(row) => navigate(`/customers/${row.id}`)}
            emptyMessage="No blacklisted customers"
          />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
