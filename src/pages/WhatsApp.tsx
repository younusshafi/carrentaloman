import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  Phone,
  Send,
  Bot,
  Users,
  Settings,
  Play,
  MessageCircle,
  Calendar,
  DollarSign,
  AlertTriangle,
  Check,
  X,
  Clock,
} from 'lucide-react';

// Mock WhatsApp data
const mockLeads = [
  { id: '1', phone: '+61 400 111 222', name: 'James Wilson', message: 'Hi, I saw your ad for car rentals. What cars do you have available?', status: 'new', created_at: '2024-12-05T10:30:00Z' },
  { id: '2', phone: '+61 400 333 444', name: 'Lisa Chen', message: 'Looking for a SUV for 2 weeks starting next Monday', status: 'contacted', created_at: '2024-12-04T15:45:00Z' },
  { id: '3', phone: '+61 400 555 666', name: null, message: 'How much for weekly rental?', status: 'new', created_at: '2024-12-05T09:15:00Z' },
];

const mockConversations = [
  {
    id: '1',
    renter: 'John Smith',
    phone: '+61 400 123 456',
    lastMessage: 'Thanks for the reminder, I\'ll make the payment today',
    timestamp: '2024-12-05T11:00:00Z',
    unread: 0,
  },
  {
    id: '2',
    renter: 'Sarah Johnson',
    phone: '+61 400 234 567',
    lastMessage: 'Can I extend my rental by another week?',
    timestamp: '2024-12-05T10:30:00Z',
    unread: 1,
  },
];

const mockSupportTickets = [
  { id: '1', renter: 'John Smith', issue: 'Rental Extension Request', message: 'Need to extend rental by 1 week', status: 'open', created_at: '2024-12-05T09:00:00Z' },
  { id: '2', renter: 'Sarah Johnson', issue: 'Payment Confirmation', message: 'I just made a bank transfer, can you confirm?', status: 'pending', created_at: '2024-12-04T16:00:00Z' },
];

export default function WhatsApp() {
  const [botEnabled, setBotEnabled] = useState(true);
  const [testNumber, setTestNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');

  const workflows = [
    { name: 'Onboarding Flow', description: 'Welcome new leads and collect information', icon: Users },
    { name: 'Rental Extension', description: 'Handle extension requests automatically', icon: Calendar },
    { name: 'Payment Reminder', description: 'Send payment due reminders', icon: DollarSign },
    { name: 'Fine Notification', description: 'Notify renters about traffic fines', icon: AlertTriangle },
  ];

  return (
    <MainLayout title="WhatsApp Integration" subtitle="Manage bot and communications">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <MessageSquare className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockLeads.filter(l => l.status === 'new').length}</p>
                <p className="text-sm text-muted-foreground">New Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <MessageCircle className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockConversations.reduce((sum, c) => sum + c.unread, 0)}</p>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
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
                <p className="text-2xl font-bold">{mockSupportTickets.filter(t => t.status === 'open').length}</p>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${botEnabled ? 'bg-success/10' : 'bg-muted'}`}>
                <Bot className={`w-5 h-5 ${botEnabled ? 'text-success' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{botEnabled ? 'Active' : 'Off'}</p>
                <p className="text-sm text-muted-foreground">Bot Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="control" className="space-y-4">
        <TabsList>
          <TabsTrigger value="control">Bot Control</TabsTrigger>
          <TabsTrigger value="leads">
            Lead Inbox
            {mockLeads.filter(l => l.status === 'new').length > 0 && (
              <Badge variant="destructive" className="ml-2">{mockLeads.filter(l => l.status === 'new').length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="support">
            Support Desk
            {mockSupportTickets.filter(t => t.status === 'open').length > 0 && (
              <Badge variant="warning" className="ml-2">{mockSupportTickets.filter(t => t.status === 'open').length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="logs">Conversation Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="control">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bot Control Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Bot Control Panel
                </CardTitle>
                <CardDescription>Configure WhatsApp automation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${botEnabled ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="font-medium">WhatsApp Bot</p>
                      <p className="text-sm text-muted-foreground">
                        {botEnabled ? 'Actively responding to messages' : 'Bot is disabled'}
                      </p>
                    </div>
                  </div>
                  <Switch checked={botEnabled} onCheckedChange={setBotEnabled} />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Test Message Sender</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        placeholder="+61 400 000 000"
                        value={testNumber}
                        onChange={(e) => setTestNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Type your test message..."
                        value={testMessage}
                        onChange={(e) => setTestMessage(e.target.value)}
                      />
                    </div>
                    <Button variant="accent" className="w-full">
                      <Send className="w-4 h-4 mr-2" /> Send Test Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Triggers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Workflow Triggers
                </CardTitle>
                <CardDescription>Test automation workflows via N8n</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflows.map((workflow) => (
                    <div key={workflow.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <workflow.icon className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">{workflow.name}</p>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Play className="w-4 h-4 mr-1" /> Test
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Lead Inbox</CardTitle>
              <CardDescription>New WhatsApp inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockLeads.map((lead) => (
                  <div key={lead.id} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        lead.status === 'new' ? 'bg-success/20' : 'bg-muted'
                      }`}>
                        <Phone className={`w-5 h-5 ${lead.status === 'new' ? 'text-success' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{lead.name || 'Unknown'}</p>
                          {lead.status === 'new' && (
                            <Badge className="bg-success text-success-foreground text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{lead.phone}</p>
                        <p className="text-sm mt-1 bg-card p-2 rounded border">"{lead.message}"</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(lead.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="accent">Create Reservation</Button>
                      <Button size="sm" variant="outline">Send Payment Link</Button>
                      <Button size="sm" variant="ghost">Mark Contacted</Button>
                    </div>
                  </div>
                ))}
                {mockLeads.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No leads yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support Desk</CardTitle>
              <CardDescription>Issues reported via WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSupportTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-start justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        ticket.status === 'open' ? 'bg-warning/20' : 'bg-muted'
                      }`}>
                        <MessageCircle className={`w-5 h-5 ${
                          ticket.status === 'open' ? 'text-warning' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{ticket.issue}</p>
                          <Badge variant={ticket.status === 'open' ? 'destructive' : 'secondary'} className="text-xs capitalize">
                            {ticket.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{ticket.renter}</p>
                        <p className="text-sm mt-1 bg-card p-2 rounded border">"{ticket.message}"</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(ticket.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant="success">
                        <Check className="w-4 h-4 mr-1" /> Resolve
                      </Button>
                      <Button size="sm" variant="outline">Reply</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Logs</CardTitle>
              <CardDescription>Recent WhatsApp conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockConversations.map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-accent" />
                        </div>
                        {conv.unread > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-xs text-destructive-foreground">
                            {conv.unread}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{conv.renter}</p>
                        <p className="text-sm text-muted-foreground">{conv.phone}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{conv.lastMessage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
