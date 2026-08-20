import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../i18n.js';
import Home from './home.js';

describe('Home', () => {
  it('renders the translated bootstrap message', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'Chess AI' })).toBeInTheDocument();
    expect(screen.getByText('The platform foundation is running.')).toBeInTheDocument();
  });
});
