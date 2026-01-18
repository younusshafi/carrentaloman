import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/shared/StatCard';
import { DataTable, Column } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useFinancialsData, CarExpense } from '@/hooks/useFinancialsData';
import { DollarSign, TrendingUp, TrendingDown, Plus, Car } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';

const monthlyFinancials = [
  { month: 'Jul', revenue: 8500, profit: 5700 },
  { month: 'Aug', revenue: 9200, profit: 6100 },
  { month: 'Sep', revenue: 10800, profit: 7900 },
  { month: 'Oct', revenue: 11200, profit: 7800 },
  { month: 'Nov', revenue: 12100, profit: 9100 },
  { month: 'Dec', revenue: 12450, profit: 9200 },
];

export default function Financials() {
  const [selectedCar, setSelectedCar] = useState<string>('all');
  const { expenses, cars, monthlyRevenue, monthlyExpenses, netProfit, carProfitability, expenseBreakdown, isLoading, isError } = useFinancialsData();

  const filteredExpenses = selectedCar === 'all' ? expenses : expenses.filter(e => e.car_id === selectedCar);

  const expenseColumns: Column<CarExpense>[] = [
    { key: 'date', header: 'Date', cell: (row) => <span className="text-sm">{new Date(row.expense_date).toLocaleDateString()}</span> },
    { key: 'car', header: 'Vehicle', cell: (row) => { const car = cars.find(c => c.id === row.car_id); return (<div className="flex items-center gap-2"><Car className="w-4 h-4 text-muted-foreground" /><span>{car?.plate_number || 'Unknown'}</span></div>); } },
    { key: 'type', header: 'Type', cell: (row) => <span className="capitalize text-sm bg-muted px-2 py-1 rounded">{row.expense_type.replace('_', ' ')}</span> },
    { key: 'amount', header: 'Amount', cell: (row) => <span className="font-medium text-destructive">-${row.amount}</span> },
    { key: 'notes', header: 'Notes', cell: (row) => <span className="text-sm text-muted-foreground">{row.description || '-'}</span> },
  ];

  if (isLoading) return <MainLayout title="Financial Management" subtitle="Loading..."><Skeleton className="h-64" /></MainLayout>;
  if (isError) return <MainLayout title="Financial Management" subtitle="Error"><Card><CardContent className="p-6"><p className="text-destructive">Failed to load data.</p></CardContent></Card></MainLayout>;

  return (
    <MainLayout title="Financial Management" subtitle="Track income, expenses, and profitability">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Monthly Revenue" value={`$${monthlyRevenue.toLocaleString()}`} icon={DollarSign} trend={{ value: 8.5, isPositive: true }} variant="success" />
        <StatCard title="Monthly Expenses" value={`$${monthlyExpenses.toLocaleString()}`} icon={TrendingDown} variant="destructive" />
        <StatCard title="Net Profit" value={`$${netProfit.toLocaleString()}`} icon={TrendingUp} variant="accent" />
        <StatCard title="Outstanding" value="$0" icon={DollarSign} subtitle="Payments due" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2"><CardHeader><CardTitle>Revenue & Profit Trend</CardTitle></CardHeader><CardContent><div className="h-[300px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthlyFinancials}><CartesianGrid strokeDasharray="3 3" className="stroke-muted" /><XAxis dataKey="month" /><YAxis /><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} /><Legend /><Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Revenue" /><Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Profit" /></LineChart></ResponsiveContainer></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Expense Breakdown</CardTitle></CardHeader><CardContent><div className="h-[200px]"><ResponsiveContainer width="100%" height="100%"><RePieChart><Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">{expenseBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} formatter={(value: number) => [`$${value}`, '']} /></RePieChart></ResponsiveContainer></div><div className="grid grid-cols-2 gap-2 mt-4">{expenseBreakdown.map((item) => (<div key={item.name} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-xs text-muted-foreground">{item.name}</span></div>))}</div></CardContent></Card>
      </div>
      <Tabs defaultValue="profitability" className="space-y-4">
        <TabsList><TabsTrigger value="profitability">Car Profitability</TabsTrigger><TabsTrigger value="expenses">Expenses</TabsTrigger></TabsList>
        <TabsContent value="profitability"><Card><CardHeader><CardTitle>Profitability by Vehicle</CardTitle></CardHeader><CardContent><div className="space-y-4">{carProfitability.length === 0 ? <p className="text-muted-foreground text-center py-8">No profitability data available</p> : carProfitability.map((car, index) => (<div key={car.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"><div className="flex items-center gap-4"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>{index + 1}</div><div><p className="font-medium">{car.name}</p><p className="text-sm text-muted-foreground font-mono">{car.plate}</p></div></div><div className="flex items-center gap-8"><div className="text-right"><p className="text-sm text-muted-foreground">Revenue</p><p className="font-medium text-success">${car.revenue.toLocaleString()}</p></div><div className="text-right"><p className="text-sm text-muted-foreground">Expenses</p><p className="font-medium text-destructive">${car.expenses.toLocaleString()}</p></div><div className="text-right"><p className="text-sm text-muted-foreground">Net Profit</p><p className={`font-bold ${car.profit >= 0 ? 'text-success' : 'text-destructive'}`}>${car.profit.toLocaleString()}</p></div><div className="text-right"><p className="text-sm text-muted-foreground">ROI</p><p className={`font-bold ${parseFloat(car.roi) >= 0 ? 'text-accent' : 'text-destructive'}`}>{car.roi}%</p></div></div></div>))}</div></CardContent></Card></TabsContent>
        <TabsContent value="expenses"><Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Expense History</CardTitle></div><div className="flex gap-2"><Select value={selectedCar} onValueChange={setSelectedCar}><SelectTrigger className="w-48"><SelectValue placeholder="Filter by car" /></SelectTrigger><SelectContent><SelectItem value="all">All Vehicles</SelectItem>{cars.map((car) => <SelectItem key={car.id} value={car.id}>{car.plate_number}</SelectItem>)}</SelectContent></Select><Button variant="accent"><Plus className="w-4 h-4 mr-2" /> Add Expense</Button></div></CardHeader><CardContent><DataTable columns={expenseColumns} data={filteredExpenses} emptyMessage="No expenses recorded" /></CardContent></Card></TabsContent>
      </Tabs>
    </MainLayout>
  );
}
