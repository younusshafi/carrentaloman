import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings as SettingsIcon,
  Key,
  Webhook,
  CreditCard,
  MessageSquare,
  User,
  Building,
  Shield,
  Bell,
  Database,
  Save,
} from 'lucide-react';

export default function Settings() {
  return (
    <MainLayout title="Settings" subtitle="Configure your system preferences">
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Company Information
                </CardTitle>
                <CardDescription>Update your business details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input defaultValue="Car Gems Rentals" />
                  </div>
                  <div className="space-y-2">
                    <Label>ABN</Label>
                    <Input placeholder="XX XXX XXX XXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Business Address</Label>
                  <Input placeholder="123 Main St, Sydney NSW 2000" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input type="email" defaultValue="info@cargems.com.au" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input defaultValue="+61 2 1234 5678" />
                  </div>
                </div>
                <Button variant="accent">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Rental Settings
                </CardTitle>
                <CardDescription>Default rental configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Default Weekly Rate ($)</Label>
                    <Input type="number" defaultValue="450" />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Bond ($)</Label>
                    <Input type="number" defaultValue="1000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Rental (days)</Label>
                    <Input type="number" defaultValue="7" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Late Fee (per day)</Label>
                    <Input type="number" defaultValue="50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select defaultValue="AUD">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="accent">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>Manage your API keys and secrets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Supabase URL</Label>
                  <Input placeholder="https://xxxxx.supabase.co" type="url" />
                </div>
                <div className="space-y-2">
                  <Label>Supabase Anon Key</Label>
                  <Input placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." type="password" />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Third-Party Services</h4>
                <div className="space-y-2">
                  <Label>Google Maps API Key</Label>
                  <Input placeholder="AIza..." type="password" />
                </div>
                <div className="space-y-2">
                  <Label>SMS Gateway API Key</Label>
                  <Input placeholder="Your SMS API key" type="password" />
                </div>
              </div>

              <Button variant="accent">
                <Save className="w-4 h-4 mr-2" /> Save API Keys
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5" />
                  N8n Webhooks
                </CardTitle>
                <CardDescription>Configure automation endpoints</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>N8n Base URL</Label>
                  <Input placeholder="https://your-n8n-instance.com" type="url" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Webhook URL</Label>
                  <Input placeholder="https://your-n8n-instance.com/webhook/whatsapp" type="url" />
                </div>
                <div className="space-y-2">
                  <Label>Payment Webhook URL</Label>
                  <Input placeholder="https://your-n8n-instance.com/webhook/payment" type="url" />
                </div>
                <div className="space-y-2">
                  <Label>OCR Processing Webhook</Label>
                  <Input placeholder="https://your-n8n-instance.com/webhook/ocr" type="url" />
                </div>
                <Button variant="accent">
                  <Save className="w-4 h-4 mr-2" /> Save Webhooks
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Gateway
                </CardTitle>
                <CardDescription>Configure payment processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Provider</Label>
                  <Select defaultValue="stripe">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input placeholder="sk_live_..." type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Webhook Secret</Label>
                  <Input placeholder="whsec_..." type="password" />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Test Mode</p>
                    <p className="text-sm text-muted-foreground">Use test credentials for development</p>
                  </div>
                  <Switch />
                </div>
                <Button variant="accent">
                  <Save className="w-4 h-4 mr-2" /> Save Payment Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  WhatsApp Business
                </CardTitle>
                <CardDescription>Configure WhatsApp integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>WhatsApp Business Phone Number</Label>
                  <Input placeholder="+61 400 000 000" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp API Token</Label>
                  <Input placeholder="Your WhatsApp API token" type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Webhook Verify Token</Label>
                  <Input placeholder="Your webhook verify token" type="password" />
                </div>
                <Button variant="accent">
                  <Save className="w-4 h-4 mr-2" /> Save WhatsApp Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                {[
                  { label: 'New Rental Created', description: 'When a new rental is booked' },
                  { label: 'Payment Received', description: 'When a payment is processed' },
                  { label: 'Insurance Expiring', description: 'When insurance is expiring soon' },
                  { label: 'Rego Expiring', description: 'When registration is expiring soon' },
                  { label: 'New Fine Detected', description: 'When a traffic fine is matched' },
                  { label: 'Maintenance Required', description: 'When service is due' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Alert Thresholds</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Insurance Warning (days before expiry)</Label>
                    <Input type="number" defaultValue="45" />
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance Critical (days before expiry)</Label>
                    <Input type="number" defaultValue="15" />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Overdue (days)</Label>
                    <Input type="number" defaultValue="7" />
                  </div>
                  <div className="space-y-2">
                    <Label>Service Due (km interval)</Label>
                    <Input type="number" defaultValue="10000" />
                  </div>
                </div>
              </div>

              <Button variant="accent">
                <Save className="w-4 h-4 mr-2" /> Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Users & Roles
              </CardTitle>
              <CardDescription>Manage team access and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium">Admin User</p>
                      <p className="text-sm text-muted-foreground">admin@cargems.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select defaultValue="admin">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>

                <div className="p-8 border-2 border-dashed rounded-lg text-center">
                  <Database className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">
                    Connect to Supabase to enable user management
                  </p>
                  <Button variant="outline">Connect Supabase</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
