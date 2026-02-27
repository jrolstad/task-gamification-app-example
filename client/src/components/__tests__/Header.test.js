import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../Header';

describe('Header', () => {
  const mockUser = { name: 'Alice', points: 42 };
  const mockLogout = jest.fn();

  beforeEach(() => {
    mockLogout.mockClear();
  });

  it('renders the app title', () => {
    render(<Header user={mockUser} onLogout={mockLogout} />);
    expect(screen.getByText(/Task Quest/)).toBeInTheDocument();
  });

  it('renders the user name', () => {
    render(<Header user={mockUser} onLogout={mockLogout} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders the user points', () => {
    render(<Header user={mockUser} onLogout={mockLogout} />);
    expect(screen.getByText(/42 pts/)).toBeInTheDocument();
  });

  it('renders zero points correctly', () => {
    render(<Header user={{ name: 'Bob', points: 0 }} onLogout={mockLogout} />);
    expect(screen.getByText(/0 pts/)).toBeInTheDocument();
  });

  it('calls onLogout when Sign Out is clicked', () => {
    render(<Header user={mockUser} onLogout={mockLogout} />);
    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
