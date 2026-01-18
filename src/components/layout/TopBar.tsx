import { Bell, Search, User, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export function TopBar({ title, subtitle, onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6">
      {/* Left Side - Menu + Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Page Title */}
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Search - Desktop only */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-9 bg-secondary border-0"
          />
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs gradient-accent border-0">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Insurance Expiring</span>
              <span className="text-sm text-muted-foreground">Toyota Camry (ABC-123) expires in 7 days</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">Payment Overdue</span>
              <span className="text-sm text-muted-foreground">John Smith - $450 outstanding</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium">New Fine Detected</span>
              <span className="text-sm text-muted-foreground">Speeding fine matched to renter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-accent text-accent-foreground">AD</AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start">
                <span className="text-sm font-medium">Admin User</span>
                <span className="text-xs text-muted-foreground">admin@cargems.com</span>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
