import { forwardRef, type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: 'none' | 'purple' | 'orange' | 'teal' | 'healthy' | 'warning' | 'critical';
  pattern?: 'none' | 'dots' | 'grid' | 'diagonal';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const glowClasses = {
  none: '',
  purple: 'shadow-glow-purple',
  orange: 'shadow-glow-orange',
  teal: 'shadow-glow-teal',
  healthy: 'shadow-glow-healthy',
  warning: 'shadow-glow-warning',
  critical: 'shadow-glow-critical',
};

const patternClasses = {
  none: '',
  dots: 'pattern-dots',
  grid: 'pattern-grid',
  diagonal: 'pattern-diagonal',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hover = false,
      glow = 'none',
      pattern = 'none',
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-2xl border overflow-hidden';

    const variantClasses = {
      default: 'bg-bg-card border-border-subtle',
      elevated: 'bg-bg-elevated border-border-default shadow-card',
      outlined: 'bg-transparent border-border-default',
      gradient:
        'bg-gradient-to-br from-accent-purple/10 to-accent-orange/10 border-border-subtle',
    };

    const hoverClasses = hover
      ? 'card-hover cursor-pointer hover:border-border-hover'
      : '';

    return (
      <div
        ref={ref}
        className={`
          ${baseClasses}
          ${variantClasses[variant]}
          ${paddingClasses[padding]}
          ${glowClasses[glow]}
          ${patternClasses[pattern]}
          ${hoverClasses}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header component
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardHeader({ children, className = '', ...props }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

// Card Title component
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

export function CardTitle({
  children,
  as: Tag = 'h3',
  className = '',
  ...props
}: CardTitleProps) {
  return (
    <Tag
      className={`text-lg font-semibold text-text-primary ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

// Card Content component
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ children, className = '', ...props }: CardContentProps) {
  return (
    <div className={`text-text-secondary ${className}`} {...props}>
      {children}
    </div>
  );
}
