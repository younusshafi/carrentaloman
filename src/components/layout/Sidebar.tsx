import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Car,
  LayoutDashboard,
  CalendarRange,
  DollarSign,
  Shield,
  Wrench,
  AlertTriangle,
  Users,
  Settings,
  MessageSquare,
  FileUp,
  ChevronLeft,
  ChevronRight,
  Gem,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Car, label: 'Fleet', path: '/fleet' },
  { icon: CalendarRange, label: 'Rentals', path: '/rentals' },
  { icon: DollarSign, label: 'Financials', path: '/financials' },
  { icon: Shield, label: 'Insurance & Rego', path: '/insurance' },
  { icon: Wrench, label: 'Maintenance', path: '/maintenance' },
  { icon: AlertTriangle, label: 'Fines', path: '/fines' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: MessageSquare, label: 'WhatsApp', path: '/whatsapp' },
  { icon: FileUp, label: 'Data Import', path: '/import' },
];

const bottomNavItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

function SidebarContent({ collapsed, setCollapsed, onNavClick }: { collapsed: boolean; setCollapsed: (collapsed: boolean) => void; onNavClick?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-sidebar-border',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
              <Gem className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="font-bold text-lg">Car Gems</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">
            <Gem className="w-5 h-5 text-accent-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.path}
                      onClick={onNavClick}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                        'hover:bg-sidebar-accent',
                        isActive && 'bg-sidebar-primary text-sidebar-primary-foreground',
                        collapsed && 'justify-center'
                      )}
                    >
                      <item.icon className={cn('w-5 h-5 shrink-0', isActive && 'text-sidebar-primary-foreground')} />
                      {!collapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="bg-popover text-popover-foreground">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-sidebar-border py-4 px-2">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.path}
                      onClick={onNavClick}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                        'hover:bg-sidebar-accent',
                        isActive && 'bg-sidebar-primary text-sidebar-primary-foreground',
                        collapsed && 'justify-center'
                      )}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {!collapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="bg-popover text-popover-foreground">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </li>
            );
          })}
        </ul>

        {/* Collapse Button - Desktop Only */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full mt-2 text-sidebar-foreground hover:bg-sidebar-accent hidden md:flex',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out hidden md:flex flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-0">
          <SidebarContent 
            collapsed={false} 
            setCollapsed={setCollapsed} 
            onNavClick={() => setMobileOpen(false)} 
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
