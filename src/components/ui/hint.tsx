import type { ReactElement } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/** Accessible tooltip for icon-only, disabled, or jargon controls. Disabled triggers need a span wrapper to receive hover/focus. */
export function Hint({ label, children, side = 'top', className }: { label: string; children: ReactElement; side?: 'top' | 'bottom' | 'left' | 'right'; className?: string }) {
  return (
    <TooltipProvider delayDuration={250}>
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex', className)} tabIndex={0} aria-label={label}>{children}</span>
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
    </TooltipProvider>
  );
}
