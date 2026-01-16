import { useId, type InputHTMLAttributes } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  variant?: 'default' | 'danger';
  markers?: number[];
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  formatValue = (v) => `${v}%`,
  variant = 'default',
  markers,
  className = '',
  ...props
}: SliderProps) {
  const id = useId();
  const percentage = ((value - min) / (max - min)) * 100;

  const trackColor = variant === 'danger' ? 'bg-status-critical' : 'bg-accent-purple';
  const thumbColor = variant === 'danger' ? 'accent-[#ef4444]' : 'accent-[#8b5cf6]';

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <label htmlFor={id} className="text-sm text-text-secondary">
              {label}
            </label>
          )}
          {showValue && (
            <span className={`text-sm font-medium ${variant === 'danger' ? 'text-status-critical' : 'text-text-primary'}`}>
              {formatValue(value)}
            </span>
          )}
        </div>
      )}

      <div className="relative">
        {/* Track background */}
        <div className="absolute inset-0 h-2 rounded-full bg-bg-elevated top-1/2 -translate-y-1/2" />

        {/* Track fill */}
        <div
          className={`absolute h-2 rounded-full ${trackColor} top-1/2 -translate-y-1/2 transition-all duration-100`}
          style={{ width: `${percentage}%` }}
        />

        {/* Markers */}
        {markers && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2">
            {markers.map((marker) => {
              const markerPos = ((marker - min) / (max - min)) * 100;
              return (
                <div
                  key={marker}
                  className="absolute w-0.5 h-3 bg-border-default -translate-x-1/2"
                  style={{ left: `${markerPos}%` }}
                />
              );
            })}
          </div>
        )}

        {/* Input */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          className={`
            relative w-full h-6 appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:${thumbColor}
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-lg
            [&::-moz-range-thumb]:cursor-pointer
            focus:outline-none
          `}
          {...props}
        />
      </div>

      {/* Marker labels */}
      {markers && (
        <div className="relative mt-1">
          {markers.map((marker) => {
            const markerPos = ((marker - min) / (max - min)) * 100;
            return (
              <span
                key={marker}
                className="absolute text-xs text-text-muted -translate-x-1/2"
                style={{ left: `${markerPos}%` }}
              >
                {marker}%
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
