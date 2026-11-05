import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Hint } from './hint';

describe('Hint tooltip', () => {
  it('shows the tooltip for a disabled button (wrapper receives hover) and keeps it disabled', async () => {
    render(<TooltipProvider delayDuration={0}><Hint label="Network is off for your business"><button type="button" disabled>Shared Network</button></Hint></TooltipProvider>);
    const btn = screen.getByRole('button', { name: /Shared Network/i });
    expect(btn).toBeDisabled();
    fireEvent.pointerOver(btn); fireEvent.mouseOver(btn); fireEvent.focus(screen.getByLabelText('Network is off for your business'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Network is off for your business');
  });
});
