import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable, Column } from '@/components/shared/DataTable';
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
import { mockExpenses, mockCars, mockRentalSessions, dashboardStats } from '@/data/mockData';
import { CarExpense } from '@/types';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Car,
  Filter,
  Download,
  PieChart,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const monthlyFinancials = [
  { month: 'Jul', revenue: 8500, expenses: 2800, profit: 5700 },
  { month: 'Aug', revenue: 9200, expenses: 3100, profit: 6100 },
  { month: 'Sep', revenue: 10800, expenses: 2900, profit: 7900 },
  { month: 'Oct', revenue: 11200, expenses: 3400, profit: 7800 },
  { month: 'Nov', revenue: 12100, expenses: 3000, profit: 9100 },
  { month: 'Dec', revenue: 12450, expenses: 3250, profit: 9200 },
];

const expensesByType = [
  { name: 'Service', value: 2450, color: 'hsl(25, 95%, 53%)' },
  { name: 'Insurance', value: 3600, color: 'hsl(199, 89%, 48%)' },
  { name: 'Rego', value: 2500, color: 'hsl(142, 76%, 36%)' },
  { name: 'Tyres', value: 1600, color: 'hsl(262, 83%, 58%)' },
  { name: 'Repairs', value: 1850, color: 'hsl(0, 84%, 60%)' },
];

const carProfitability = mockCars.filter(c => c.status !== 'sold').map(car => {
  const rentals = mockRentalSessions.filter(r => r.car_id === car.id);
  const expenses = mockExpenses.filter(e => e.car_id === car.id);
  const revenue = rentals.reduce((sum, r) => sum + r.total_amount, 0);
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  return {
    id: car.id,
    name: `${car.make} ${car.model}`,
    plate: car.plate_number,
    revenue,
    expenses: expenseTotal,
    profit: revenue - expenseTotal,
    roi: car.purchase_price > 0 ? (((revenue - expenseTotal) / car.purchase_price) * 100).toFixed(1) : '0',
  };
}).sort((a, b) => b.profit - a.profit);

export default function Financials() {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<string>('all');

  const filteredExpenses = selectedCar === 'all'
    ? mockExpenses
    : mockExpenses.filter(e => e.car_id === selectedCar);

  const expenseColumns: Column<CarExpense>[] = [
    {
      key: 'date',
      header: 'Date',
      cell: (row) => (
        <span className="text-sm">{new Date(row.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'car',
      header: 'Vehicle',
      cell: (row) => {
        const car = mockCars.find(c => c.id === row.car_id);
        return (
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span>{car?.plate_number || 'Unknown'}</span>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      cell: (row) => (
        <span className="capitalize text-sm bg-muted px-2 py-1 rounded">
          {row.type.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      cell: (row) => (
        <span className="font-medium text-destructive">-${row.amount}</span>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.notes || '-'}</span>
      ),
    },
  ];

  return (
    <MainLayout title="Financial Management" subtitle="Track income, expenses, and profitability">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Monthly Revenue"
          value={`$${dashboardStats.financial.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend={{ value: 8.5, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Monthly Expenses"
          value={`$${dashboardStats.financial.monthlyExpenses.toLocaleString()}`}
          icon={TrendingDown}
          trend={{ value: 2.1, isPositive: false }}
          variant="destructive"
        />
        <StatCard
          title="Net Profit"
          value={`$${dashboardStats.financial.netProfit.toLocaleString()}`}
          icon={TrendingUp}
          trend={{ value: 12.3, isPositive: true }}
          variant="accent"
        />
        <StatCard
          title="Outstanding"
          value={`$${dashboardStats.financial.outstandingPayments.toLocaleString()}`}
          icon={DollarSign}
          subtitle="Payments due"
          variant={dashboardStats.financial.outstandingPayments > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Profit Trend</CardTitle>
            <CardDescription>6-month financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyFinancials}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={expensesByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {expensesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value}`, '']}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {expensesByType.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profitability" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profitability">Car Profitability</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        <TabsContent value="profitability">
          <Card>
            <CardHeader>
              <CardTitle>Profitability by Vehicle</CardTitle>
              <CardDescription>Net profit and ROI per car</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {carProfitability.map((car, index) => (
                  <div key={car.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-accent text-accent-foreground' :
                        index === 1 ? 'bg-secondary text-secondary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{car.name}</p>
                        <p className="text-sm text-muted-foreground font-mono">{car.plate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="font-medium text-success">${car.revenue.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Expenses</p>
                        <p className="font-medium text-destructive">${car.expenses.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Net Profit</p>
                        <p className={`font-bold ${car.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ${car.profit.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className={`font-bold ${parseFloat(car.roi) >= 0 ? 'text-accent' : 'text-destructive'}`}>
                          {car.roi}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expense History</CardTitle>
                <CardDescription>All recorded expenses</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCar} onValueChange={setSelectedCar}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by car" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    {mockCars.map((car) => (
                      <SelectItem key={car.id} value={car.id}>
                        {car.plate_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                  <DialogTrigger asChild>
                    <Button variant="accent">
                      <Plus className="w-4 h-4 mr-2" /> Add Expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Expense</DialogTitle>
                      <DialogDescription>Record a new expense</DialogDescription>
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
                        <Label>Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="tyres">Tyres</SelectItem>
                            <SelectItem value="oil">Oil Change</SelectItem>
                            <SelectItem value="repairs">Repairs</SelectItem>
                            <SelectItem value="insurance">Insurance</SelectItem>
                            <SelectItem value="rego">Registration</SelectItem>
                            <SelectItem value="mechanical_issue">Mechanical Issue</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Amount ($)</Label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea placeholder="Add any notes..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="accent" onClick={() => setIsAddExpenseOpen(false)}>
                        Add Expense
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={expenseColumns}
                data={filteredExpenses}
                emptyMessage="No expenses recorded"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Rental payments received</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Payment tracking coming soon. Connect to Supabase to enable.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
