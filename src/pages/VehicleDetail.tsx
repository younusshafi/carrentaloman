import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockCars, mockRentalSessions, mockExpenses, mockMaintenanceTickets, mockTrafficFines, mockInsuranceRecords, mockRegoRecords } from '@/data/mockData';
import {
  ArrowLeft,
  Car,
  Calendar,
  DollarSign,
  Wrench,
  AlertTriangle,
  Shield,
  FileText,
  MapPin,
  Edit,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const car = mockCars.find(c => c.id === id);
  
  if (!car) {
    return (
      <MainLayout title="Vehicle Not Found">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/fleet')}>Back to Fleet</Button>
        </div>
      </MainLayout>
    );
  }

  const rentalHistory = mockRentalSessions.filter(r => r.car_id === id);
  const expenses = mockExpenses.filter(e => e.car_id === id);
  const maintenanceTickets = mockMaintenanceTickets.filter(m => m.car_id === id);
  const fines = mockTrafficFines.filter(f => f.car_id === id);
  const insurance = mockInsuranceRecords.find(i => i.car_id === id);
  const rego = mockRegoRecords.find(r => r.car_id === id);

  // Calculate financials
  const totalRevenue = rentalHistory.reduce((sum, r) => sum + r.total_amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
  const roi = car.purchase_price > 0 ? ((netIncome / car.purchase_price) * 100).toFixed(1) : '0';

  const monthlyData = [
    { month: 'Jul', revenue: 1800, expenses: 200 },
    { month: 'Aug', revenue: 1800, expenses: 450 },
    { month: 'Sep', revenue: 1800, expenses: 100 },
    { month: 'Oct', revenue: 1800, expenses: 1200 },
    { month: 'Nov', revenue: 1800, expenses: 180 },
    { month: 'Dec', revenue: 1800, expenses: 0 },
  ];

  return (
    <MainLayout
      title={`${car.make} ${car.model}`}
      subtitle={car.plate_number}
    >
      {/* Back Button and Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/fleet')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Fleet
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          {car.status !== 'sold' && (
            <Button variant="destructive">Mark as Sold</Button>
          )}
        </div>
      </div>

      {/* Vehicle Summary Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image */}
            <div className="w-full lg:w-64 h-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {car.images[0] ? (
                <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
              ) : (
                <Car className="w-16 h-16 text-muted-foreground" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={car.status} className="mt-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-medium">{car.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Body Type</p>
                <p className="font-medium">{car.body_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium">{car.color}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plate Number</p>
                <p className="font-mono font-medium">{car.plate_number}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purchase Price</p>
                <p className="font-medium">${car.purchase_price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purchase Date</p>
                <p className="font-medium">{new Date(car.purchase_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tracker IMEI</p>
                <p className="font-mono text-sm">{car.tracker_imei || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold">${totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${netIncome >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <TrendingUp className={`w-5 h-5 ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${netIncome.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-xl font-bold">{roi}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="rentals">Rental History</TabsTrigger>
          <TabsTrigger value="financials">Income & Expenses</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="fines">Fines</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insurance & Rego */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Insurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insurance ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="font-medium">{insurance.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Policy Number</span>
                      <span className="font-mono">{insurance.policy_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expiry Date</span>
                      <span className="font-medium">{new Date(insurance.expiry_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Premium</span>
                      <span className="font-medium">${insurance.premium_amount}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No insurance record found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rego ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rego Number</span>
                      <span className="font-mono">{rego.rego_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">State</span>
                      <span className="font-medium">{rego.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expiry Date</span>
                      <span className="font-medium">{new Date(rego.expiry_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renewal Amount</span>
                      <span className="font-medium">${rego.renewal_amount}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No registration record found</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rentals">
          <Card>
            <CardHeader>
              <CardTitle>Rental History</CardTitle>
              <CardDescription>{rentalHistory.length} rental sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {rentalHistory.length > 0 ? (
                <div className="space-y-4">
                  {rentalHistory.map((rental) => (
                    <div key={rental.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-info/20 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-info" />
                        </div>
                        <div>
                          <p className="font-medium">{rental.renter?.first_name} {rental.renter?.last_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${rental.total_amount.toLocaleString()}</p>
                        <StatusBadge status={rental.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No rental history for this vehicle</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financials">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
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
                      <Bar dataKey="revenue" fill="hsl(var(--chart-3))" name="Revenue" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="hsl(var(--chart-1))" name="Expenses" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length > 0 ? (
                  <div className="space-y-3">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium capitalize">{expense.type.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{expense.notes}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-destructive">-${expense.amount}</p>
                          <p className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No expenses recorded</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance History</CardTitle>
            </CardHeader>
            <CardContent>
              {maintenanceTickets.length > 0 ? (
                <div className="space-y-4">
                  {maintenanceTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                          <Wrench className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <p className="font-medium">{ticket.title}</p>
                          <p className="text-sm text-muted-foreground">{ticket.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={ticket.status} />
                        <p className="text-sm text-muted-foreground mt-1">
                          {ticket.actual_cost ? `$${ticket.actual_cost}` : ticket.estimated_cost ? `Est. $${ticket.estimated_cost}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No maintenance records</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fines">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Fines</CardTitle>
            </CardHeader>
            <CardContent>
              {fines.length > 0 ? (
                <div className="space-y-4">
                  {fines.map((fine) => (
                    <div key={fine.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <p className="font-medium">{fine.description}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {fine.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${fine.amount}</p>
                        <StatusBadge status={fine.is_paid ? 'paid' : 'unpaid'} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No fines recorded</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
