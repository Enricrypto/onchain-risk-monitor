import { useState, useRef, useEffect, type ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({
  children,
  content,
  position = 'top',
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-bg-elevated border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-bg-elevated border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-bg-elevated border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-bg-elevated border-y-transparent border-l-transparent',
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm text-text-primary
            bg-bg-elevated rounded-lg shadow-lg border border-border-subtle
            whitespace-nowrap pointer-events-none
            animate-in fade-in duration-150
            ${positionClasses[position]}
          `}
          role="tooltip"
        >
          {content}
          <span
            className={`
              absolute w-0 h-0 border-4
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
}

// Simple info tooltip with icon
interface InfoTooltipProps {
  content: ReactNode;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  return (
    <Tooltip content={content}>
      <span className="inline-flex items-center justify-center w-4 h-4 text-xs text-text-muted hover:text-text-secondary cursor-help">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </span>
    </Tooltip>
  );
}
