import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={cn(
        'transition-all duration-300',
        // Desktop: adjust padding based on collapsed state
        'md:pl-64',
        sidebarCollapsed && 'md:pl-16'
      )}>
        <TopBar 
          title={title} 
          subtitle={subtitle} 
          onMenuClick={() => setMobileOpen(true)} 
        />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
