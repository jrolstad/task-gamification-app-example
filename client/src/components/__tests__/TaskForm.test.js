import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskForm from '../TaskForm';

describe('TaskForm', () => {
  const mockCreateTask = jest.fn();

  beforeEach(() => {
    mockCreateTask.mockClear();
  });

  it('renders the form with title input, description textarea, and submit button', () => {
    render(<TaskForm onCreateTask={mockCreateTask} />);
    expect(screen.getByPlaceholderText('Task title *')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Description (optional)')).toBeInTheDocument();
    expect(screen.getByText('+ Add Task')).toBeInTheDocument();
  });

  it('calls onCreateTask with trimmed title and description on submit', () => {
    render(<TaskForm onCreateTask={mockCreateTask} />);

    fireEvent.change(screen.getByPlaceholderText('Task title *'), {
      target: { value: '  Buy groceries  ' },
    });
    fireEvent.change(screen.getByPlaceholderText('Description (optional)'), {
      target: { value: '  Milk and eggs  ' },
    });
    fireEvent.click(screen.getByText('+ Add Task'));

    expect(mockCreateTask).toHaveBeenCalledTimes(1);
    expect(mockCreateTask).toHaveBeenCalledWith('Buy groceries', 'Milk and eggs');
  });

  it('clears inputs after successful submit', () => {
    render(<TaskForm onCreateTask={mockCreateTask} />);

    const titleInput = screen.getByPlaceholderText('Task title *');
    const descInput = screen.getByPlaceholderText('Description (optional)');

    fireEvent.change(titleInput, { target: { value: 'My Task' } });
    fireEvent.change(descInput, { target: { value: 'Some details' } });
    fireEvent.click(screen.getByText('+ Add Task'));

    expect(titleInput.value).toBe('');
    expect(descInput.value).toBe('');
  });

  it('does not call onCreateTask when title is empty', () => {
    render(<TaskForm onCreateTask={mockCreateTask} />);
    fireEvent.click(screen.getByText('+ Add Task'));
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('does not call onCreateTask when title is only whitespace', () => {
    render(<TaskForm onCreateTask={mockCreateTask} />);
    fireEvent.change(screen.getByPlaceholderText('Task title *'), {
      target: { value: '   ' },
    });
    fireEvent.click(screen.getByText('+ Add Task'));
    expect(mockCreateTask).not.toHaveBeenCalled();
  });

  it('submits with empty description when only title is provided', () => {
    render(<TaskForm onCreateTask={mockCreateTask} />);

    fireEvent.change(screen.getByPlaceholderText('Task title *'), {
      target: { value: 'Quick task' },
    });
    fireEvent.click(screen.getByText('+ Add Task'));

    expect(mockCreateTask).toHaveBeenCalledWith('Quick task', '');
  });
});
