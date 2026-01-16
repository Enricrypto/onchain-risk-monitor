import type { ReactNode, HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  pulse?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-text-secondary',
  success: 'bg-status-healthy/15 text-status-healthy',
  warning: 'bg-status-warning/15 text-status-warning',
  danger: 'bg-status-critical/15 text-status-critical',
  info: 'bg-accent-cyan/15 text-accent-cyan',
  purple: 'bg-accent-purple/15 text-accent-purple',
  outline: 'bg-transparent border border-border-default text-text-secondary',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-sm',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-text-secondary',
  success: 'bg-status-healthy',
  warning: 'bg-status-warning',
  danger: 'bg-status-critical',
  info: 'bg-accent-cyan',
  purple: 'bg-accent-purple',
  outline: 'bg-text-secondary',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dotColors[variant]}`}
            />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${dotColors[variant]}`}
          />
        </span>
      )}
      {children}
    </span>
  );
}

// Status badge specifically for health factor status
interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical';
  showDot?: boolean;
}

export function StatusBadge({ status, showDot = true }: StatusBadgeProps) {
  const labels = {
    healthy: 'Healthy',
    warning: 'At Risk',
    critical: 'Critical',
  };

  const variants: Record<string, BadgeVariant> = {
    healthy: 'success',
    warning: 'warning',
    critical: 'danger',
  };

  return (
    <Badge
      variant={variants[status]}
      dot={showDot}
      pulse={status === 'critical'}
    >
      {labels[status]}
    </Badge>
  );
}
