import { forwardRef, type ReactNode, type ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-accent-purple to-accent-violet text-white hover:opacity-90 shadow-lg shadow-accent-purple/25',
  secondary:
    'bg-bg-elevated text-text-primary border border-border-default hover:bg-bg-card hover:border-border-hover',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
  danger:
    'bg-status-critical/15 text-status-critical hover:bg-status-critical/25 border border-status-critical/30',
  outline:
    'bg-transparent text-text-primary border border-border-default hover:bg-white/5 hover:border-border-hover',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center rounded-xl font-medium
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-accent-purple/50 focus:ring-offset-2 focus:ring-offset-bg-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
            {children}
            {icon && iconPosition === 'right' && (
              <span className="flex-shrink-0">{icon}</span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Loading spinner component
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Icon button variant
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: ButtonVariant;
  label: string; // For accessibility
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', variant = 'ghost', label, className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3',
    };

    return (
      <button
        ref={ref}
        aria-label={label}
        className={`
          inline-flex items-center justify-center rounded-lg
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-accent-purple/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
