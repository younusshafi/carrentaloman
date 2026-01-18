import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  Car,
  DollarSign,
  Users,
  Wrench,
  AlertTriangle,
  TrendingUp,
  CalendarClock,
  Shield,
  FileText,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Placeholder revenue data - will be computed from real data later
const revenueData = [
  { month: 'Jul', revenue: 8500, expenses: 2800 },
  { month: 'Aug', revenue: 9200, expenses: 3100 },
  { month: 'Sep', revenue: 10800, expenses: 2900 },
  { month: 'Oct', revenue: 11200, expenses: 3400 },
  { month: 'Nov', revenue: 12100, expenses: 3000 },
  { month: 'Dec', revenue: 12450, expenses: 3250 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    stats,
    cars,
    activeRentals,
    maintenanceTickets,
    unpaidFines,
    expiringInsurance,
    expiringRego,
    isLoading,
    isError,
  } = useDashboardData();

  const today = new Date();

  const fleetStatusData = [
    { name: 'Available', value: stats.fleet.available, color: 'hsl(142, 76%, 36%)' },
    { name: 'Rented', value: stats.fleet.rented, color: 'hsl(199, 89%, 48%)' },
    { name: 'Maintenance', value: stats.fleet.maintenance, color: 'hsl(38, 92%, 50%)' },
    { name: 'Reserved', value: stats.fleet.reserved, color: 'hsl(262, 83%, 58%)' },
  ];

  const activeRentalsColumns: Column<typeof activeRentals[0]>[] = [
    {
      key: 'car',
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
        <div>
          <p className="font-medium">{row.renter?.first_name} {row.renter?.last_name}</p>
          <p className="text-sm text-muted-foreground">{row.renter?.phone}</p>
        </div>
      ),
    },
    {
      key: 'dates',
      header: 'Period',
      cell: (row) => (
        <div className="text-sm">
          <p>{new Date(row.start_date).toLocaleDateString()} - {row.end_date ? new Date(row.end_date).toLocaleDateString() : 'Ongoing'}</p>
        </div>
      ),
    },
    {
      key: 'rent',
      header: 'Weekly Rent',
      cell: (row) => <span className="font-medium">${row.weekly_rent}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
  ];

  if (isLoading) {
    return (
      <MainLayout title="Dashboard" subtitle="Loading your fleet overview...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout title="Dashboard" subtitle="Error loading data">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load dashboard data. Please try again.</p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard" subtitle="Welcome back! Here's your fleet overview.">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Fleet"
          value={stats.fleet.total}
          icon={Car}
          subtitle={`${stats.fleet.available} available`}
          variant="accent"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.financial.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatCard
          title="Active Rentals"
          value={stats.operations.activeRentals}
          icon={CalendarClock}
          subtitle={`${stats.operations.upcomingReturns} returns soon`}
        />
        <StatCard
          title="Net Profit"
          value={`$${stats.financial.netProfit.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 12.3, isPositive: true }}
          variant="success"
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Outstanding Payments"
          value={`$${stats.financial.outstandingPayments.toLocaleString()}`}
          icon={DollarSign}
          variant={stats.financial.outstandingPayments > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Open Tickets"
          value={maintenanceTickets.length}
          icon={Wrench}
          variant={maintenanceTickets.length > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Unpaid Fines"
          value={`$${unpaidFines.reduce((sum, f) => sum + Number(f.amount || 0), 0)}`}
          icon={AlertTriangle}
          variant={unpaidFines.length > 0 ? 'destructive' : 'default'}
        />
        <StatCard
          title="Expiring Soon"
          value={expiringInsurance.length + expiringRego.length}
          icon={Shield}
          subtitle="Insurance & Rego"
          variant={expiringInsurance.length + expiringRego.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Expenses</CardTitle>
            <CardDescription>Last 6 months performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Fleet Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>Current vehicle distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fleetStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {fleetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {fleetStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Rentals Table */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Rentals</CardTitle>
            <CardDescription>Currently rented vehicles</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/rentals')}>
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {activeRentals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No active rentals</p>
          ) : (
            <DataTable
              columns={activeRentalsColumns}
              data={activeRentals}
              onRowClick={(row) => navigate(`/rentals/${row.id}`)}
            />
          )}
        </CardContent>
      </Card>

      {/* Alerts & Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Open Maintenance</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/maintenance')}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {maintenanceTickets.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No open tickets</p>
            ) : (
              maintenanceTickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{ticket.title}</p>
                      <p className="text-xs text-muted-foreground">{ticket.car?.plate_number}</p>
                    </div>
                  </div>
                  <StatusBadge status={ticket.priority} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Unpaid Fines */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Unpaid Fines</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/fines')}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {unpaidFines.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No unpaid fines</p>
            ) : (
              unpaidFines.slice(0, 3).map((fine) => (
                <div key={fine.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">${fine.amount}</p>
                      <p className="text-xs text-muted-foreground">{fine.car?.plate_number}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(fine.offence_date).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Expiring Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Expiring Soon</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/insurance')}>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringInsurance.length === 0 && expiringRego.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">Nothing expiring soon</p>
            ) : (
              <>
                {expiringInsurance.map((ins) => {
                  const daysLeft = Math.ceil((new Date(ins.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={ins.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Insurance</p>
                          <p className="text-xs text-muted-foreground">{ins.car?.plate_number}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${daysLeft <= 15 ? 'text-destructive' : 'text-warning'}`}>
                        {daysLeft} days
                      </span>
                    </div>
                  );
                })}
                {expiringRego.map((rego) => {
                  const daysLeft = Math.ceil((new Date(rego.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={rego.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Registration</p>
                          <p className="text-xs text-muted-foreground">{rego.car?.plate_number}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${daysLeft <= 15 ? 'text-destructive' : 'text-warning'}`}>
                        {daysLeft} days
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
