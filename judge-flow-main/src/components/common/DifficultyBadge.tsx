import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard';
  className?: string;
}

export default function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const variants = {
    easy: 'bg-success-light text-success border-success/20',
    medium: 'bg-warning-light text-warning border-warning/20',
    hard: 'bg-destructive-light text-destructive border-destructive/20'
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        'capitalize font-medium border',
        variants[difficulty],
        className
      )}
    >
      {difficulty}
    </Badge>
  );
}