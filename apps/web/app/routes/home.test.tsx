import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import '../i18n.js';
import Home from './home.js';

describe('Home', () => {
  it('renders the entry experience and requests a name at player intent', () => {
    render(
      <MemoryRouter initialEntries={['/?intent=create']}>
        <Home />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Make your next move together.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create a game' })).toHaveAttribute(
      'href',
      '?intent=create',
    );

    expect(screen.getByRole('dialog', { name: 'Choose your visible name' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Visible name' })).toBeInTheDocument();
  });
});
