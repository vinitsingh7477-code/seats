import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import TravelAssistant from '../features/assistant/TravelAssistant';

describe('SEATS local travel assistant', () => {
  it('discloses demo mode before presenting local schedule examples', async () => {
    const user = userEvent.setup();
    render(<TravelAssistant />);

    expect(screen.getByText(/LOCAL DEMO · NO MODEL CONNECTED/i)).toBeInTheDocument();
    expect(screen.getByText(/does not call an AI service/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show a flexible date range from Indore to Delhi' }));

    expect(await screen.findByText(/DEMO RESPONSE · NO LIVE SERVICE/i)).toBeInTheDocument();
    expect(screen.getByText(/no AI model was queried/i)).toBeInTheDocument();
    expect(screen.getAllByText('DEMO').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Not connected').length).toBeGreaterThan(0);
    expect(screen.queryByText(/indicative count|fare|₹/i)).not.toBeInTheDocument();
  });

  it('explains that standby does not confirm travel when asked directly', async () => {
    const user = userEvent.setup();
    render(<TravelAssistant />);
    const promptGroup = screen.getByRole('group', { name: 'Example travel questions' });
    await user.click(within(promptGroup).getByRole('button', { name: 'Does a standby request confirm a seat?' }));
    expect(await screen.findByText(/not a confirmed seat, booking or ticket/i)).toBeInTheDocument();
  });
});
