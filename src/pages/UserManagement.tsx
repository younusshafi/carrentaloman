import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ShieldCheck, User, Users, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleConfig: Record<AppRole, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'outline' }> = {
  admin: { label: 'Admin', icon: ShieldCheck, variant: 'default' },
  manager: { label: 'Manager', icon: Shield, variant: 'secondary' },
  user: { label: 'User', icon: User, variant: 'outline' },
};

export default function UserManagement() {
  const { users, isLoading, updateRole, isUpdating, approveUser, isApproving } = useAdminUsers();
  const { user: currentUser } = useAuth();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [approvingUserId, setApprovingUserId] = useState<string | null>(null);

  const pendingUsers = users.filter(u => !u.is_approved);
  const approvedUsers = users.filter(u => u.is_approved);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    const role = newRole === 'none' ? null : (newRole as AppRole);
    updateRole(
      { userId, role },
      { onSettled: () => setUpdatingUserId(null) }
    );
  };

  const handleApproval = (userId: string, approve: boolean) => {
    setApprovingUserId(userId);
    approveUser(
      { userId, approve },
      { onSettled: () => setApprovingUserId(null) }
    );
  };

  const getRoleBadge = (role: AppRole | null) => {
    if (!role) {
      return <Badge variant="outline" className="text-muted-foreground">No Role</Badge>;
    }
    const config = roleConfig[role];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const renderUserTable = (userList: typeof users, showApprovalColumn = false) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Current Role</TableHead>
          <TableHead>Created</TableHead>
          {showApprovalColumn ? (
            <TableHead className="text-right">Actions</TableHead>
          ) : (
            <>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Change Role</TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {userList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showApprovalColumn ? 4 : 5} className="text-center text-muted-foreground py-8">
              {showApprovalColumn ? 'No pending approvals' : 'No approved users'}
            </TableCell>
          </TableRow>
        ) : (
          userList.map((user) => {
            const isCurrentUser = user.id === currentUser?.id;
            const isProcessing = (isUpdating && updatingUserId === user.id) || (isApproving && approvingUserId === user.id);
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {user.display_name || 'Unnamed User'}
                      {isCurrentUser && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</span>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                {showApprovalColumn ? (
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleApproval(user.id, true)}
                        disabled={isProcessing}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproval(user.id, false)}
                        disabled={isProcessing}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                ) : (
                  <>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 text-green-600 border-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={user.role || 'none'}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                        disabled={isProcessing}
                      >
                        <SelectTrigger className="w-32 ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Role</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </>
                )}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <MainLayout title="User Management" subtitle="Manage user access and permissions">
      <div className="space-y-6">

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card className={pendingUsers.length > 0 ? 'border-warning' : ''}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pendingUsers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'manager').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              New user signups require approval before they can access the system. Assign roles to control access levels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <Tabs defaultValue={pendingUsers.length > 0 ? 'pending' : 'approved'}>
                <TabsList className="mb-4">
                  <TabsTrigger value="pending" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Approval
                    {pendingUsers.length > 0 && (
                      <Badge variant="destructive" className="ml-1">{pendingUsers.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Approved Users
                    <Badge variant="outline" className="ml-1">{approvedUsers.length}</Badge>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pending">
                  {renderUserTable(pendingUsers, true)}
                </TabsContent>
                <TabsContent value="approved">
                  {renderUserTable(approvedUsers, false)}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Role Permissions Info */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Admin</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Full system access</li>
                  <li>Approve new users</li>
                  <li>Manage users & roles</li>
                  <li>Delete records</li>
                  <li>Bulk import data</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-secondary-foreground" />
                  <span className="font-semibold">Manager</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Create & edit records</li>
                  <li>Manage rentals</li>
                  <li>Handle payments</li>
                  <li>Update vehicle status</li>
                  <li>View all data</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">User</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>View dashboard</li>
                  <li>View fleet & rentals</li>
                  <li>View customer info</li>
                  <li>Read-only access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
