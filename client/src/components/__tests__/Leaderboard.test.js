import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Leaderboard from '../Leaderboard';

describe('Leaderboard', () => {
  const sampleUsers = [
    { id: '1', name: 'Alice', points: 50 },
    { id: '2', name: 'Bob', points: 30 },
    { id: '3', name: 'Charlie', points: 20 },
    { id: '4', name: 'Dave', points: 10 },
  ];

  it('renders all users', () => {
    render(<Leaderboard users={sampleUsers} currentUserId="1" />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('Dave')).toBeInTheDocument();
  });

  it('shows gold medal for 1st place', () => {
    render(<Leaderboard users={sampleUsers} currentUserId="1" />);
    expect(screen.getByText('🥇')).toBeInTheDocument();
  });

  it('shows silver medal for 2nd place', () => {
    render(<Leaderboard users={sampleUsers} currentUserId="1" />);
    expect(screen.getByText('🥈')).toBeInTheDocument();
  });

  it('shows bronze medal for 3rd place', () => {
    render(<Leaderboard users={sampleUsers} currentUserId="1" />);
    expect(screen.getByText('🥉')).toBeInTheDocument();
  });

  it('shows numeric rank for 4th place and beyond', () => {
    render(<Leaderboard users={sampleUsers} currentUserId="1" />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('displays points for each user', () => {
    render(<Leaderboard users={sampleUsers} currentUserId="1" />);

    expect(screen.getByText(/50/)).toBeInTheDocument();
    expect(screen.getByText(/30/)).toBeInTheDocument();
    expect(screen.getByText(/20/)).toBeInTheDocument();
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it('highlights the current user', () => {
    const { container } = render(
      <Leaderboard users={sampleUsers} currentUserId="2" />
    );

    const currentUserItem = container.querySelector('.leaderboard-item.current-user');
    expect(currentUserItem).toBeInTheDocument();
    expect(currentUserItem).toHaveTextContent('Bob');
  });

  it('does not highlight other users', () => {
    const { container } = render(
      <Leaderboard users={sampleUsers} currentUserId="2" />
    );

    const allItems = container.querySelectorAll('.leaderboard-item');
    const currentUserItems = container.querySelectorAll('.leaderboard-item.current-user');
    expect(allItems).toHaveLength(4);
    expect(currentUserItems).toHaveLength(1);
  });

  it('shows empty state when no users exist', () => {
    render(<Leaderboard users={[]} currentUserId="1" />);
    expect(screen.getByText('No players yet!')).toBeInTheDocument();
  });

  it('applies correct rank CSS classes', () => {
    const { container } = render(
      <Leaderboard users={sampleUsers} currentUserId="1" />
    );

    expect(container.querySelector('.leaderboard-rank.gold')).toBeInTheDocument();
    expect(container.querySelector('.leaderboard-rank.silver')).toBeInTheDocument();
    expect(container.querySelector('.leaderboard-rank.bronze')).toBeInTheDocument();
  });
});
