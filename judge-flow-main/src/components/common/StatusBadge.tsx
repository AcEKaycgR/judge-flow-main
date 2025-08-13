import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Check, X, Clock, AlertTriangle, Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error' | 'pending';
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    accepted: {
      variant: 'bg-success-light text-success border-success/20',
      icon: Check,
      label: 'Accepted'
    },
    wrong_answer: {
      variant: 'bg-destructive-light text-destructive border-destructive/20',
      icon: X,
      label: 'Wrong Answer'
    },
    time_limit: {
      variant: 'bg-warning-light text-warning border-warning/20',
      icon: Clock,
      label: 'Time Limit'
    },
    runtime_error: {
      variant: 'bg-destructive-light text-destructive border-destructive/20',
      icon: AlertTriangle,
      label: 'Runtime Error'
    },
    pending: {
      variant: 'bg-secondary text-secondary-foreground border-border',
      icon: Loader2,
      label: 'Pending'
    }
  };

  const { variant, icon: Icon, label } = config[status];

  return (
    <Badge 
      variant="outline"
      className={cn(
        'font-medium border flex items-center gap-1',
        variant,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', status === 'pending' && 'animate-spin')} />
      {label}
    </Badge>
  );
}