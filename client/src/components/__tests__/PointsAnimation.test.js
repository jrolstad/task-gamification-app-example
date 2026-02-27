import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PointsAnimation from '../PointsAnimation';

describe('PointsAnimation', () => {
  it('renders the points value', () => {
    render(<PointsAnimation points={10} />);
    expect(screen.getByText(/\+10 pts!/)).toBeInTheDocument();
  });

  it('renders with different point values', () => {
    render(<PointsAnimation points={25} />);
    expect(screen.getByText(/\+25 pts!/)).toBeInTheDocument();
  });

  it('includes the celebration emoji', () => {
    render(<PointsAnimation points={10} />);
    expect(screen.getByText(/🎉/)).toBeInTheDocument();
  });

  it('has the points-animation class', () => {
    const { container } = render(<PointsAnimation points={10} />);
    expect(container.querySelector('.points-animation')).toBeInTheDocument();
  });
});
