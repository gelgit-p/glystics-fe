import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LandingPage from './LandingPage';

describe('Landing page advertises Dispatchly AI agent', () => {
  it('leads with AI hero, chat workflow and approval control', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Your AI delivery agent on WhatsApp/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Dispatchly AI/i).length).toBeGreaterThan(1);
    expect(screen.getByText(/From WhatsApp chat to booked delivery/i)).toBeInTheDocument();
    expect(screen.getByText(/Reply with the/i)).toBeInTheDocument();
    expect(screen.getByText(/You stay in control/i)).toBeInTheDocument();
    expect(screen.getByText(/Illustrative conversation/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Start with AI/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /\+234 802 852 0094/i })).toHaveAttribute('href', 'tel:+2348028520094');
    expect(screen.getByText(/2A Beach Road, Ojo, Lagos, Nigeria/i)).toBeInTheDocument();
  });
});
