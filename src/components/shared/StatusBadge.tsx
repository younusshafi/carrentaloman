import { cn } from '@/lib/utils';
import { CarStatus, RentalStatus, MaintenanceStatus } from '@/types';

type StatusType = CarStatus | RentalStatus | MaintenanceStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Car statuses
  available: { label: 'Available', className: 'status-available' },
  rented: { label: 'Rented', className: 'status-rented' },
  maintenance: { label: 'Maintenance', className: 'status-maintenance' },
  reserved: { label: 'Reserved', className: 'status-reserved' },
  sold: { label: 'Sold', className: 'status-sold' },
  
  // Rental statuses
  active: { label: 'Active', className: 'status-rented' },
  completed: { label: 'Completed', className: 'status-available' },
  extended: { label: 'Extended', className: 'status-reserved' },
  cancelled: { label: 'Cancelled', className: 'status-sold' },
  
  // Maintenance statuses
  open: { label: 'Open', className: 'status-maintenance' },
  in_progress: { label: 'In Progress', className: 'status-rented' },
  // completed already defined above
  
  // Payment/Fine statuses
  paid: { label: 'Paid', className: 'status-available' },
  unpaid: { label: 'Unpaid', className: 'status-maintenance' },
  overdue: { label: 'Overdue', className: 'bg-destructive/15 text-destructive' },
  
  // Priority
  low: { label: 'Low', className: 'status-available' },
  medium: { label: 'Medium', className: 'status-rented' },
  high: { label: 'High', className: 'status-maintenance' },
  urgent: { label: 'Urgent', className: 'bg-destructive/15 text-destructive' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
