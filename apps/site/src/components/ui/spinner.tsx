import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
} as const;

export type SpinnerProps = {
  size?: keyof typeof sizes;
  className?: string;
  text?: ReactNode;
  delay?: number;
};

export function Spinner({
  size = 'md',
  className = '',
  text,
  delay = 0,
}: SpinnerProps) {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    setShowSpinner(false);

    const timer = setTimeout(() => {
      setShowSpinner(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    showSpinner && (
      <div
        className={twMerge(
          'inline-flex',
          'items-center',
          'justify-center',
          'flex-col',
          'gap-2',
          className
        )}
      >
        <div
          className={`
          animate-spin
          rounded-full
          ${sizes[size]}
          border-2
          border-secondary
          border-r-blue-600
          shadow-sm
        `}
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
        {text}
      </div>
    )
  );
}
