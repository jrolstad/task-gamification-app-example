import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaskList from '../TaskList';

describe('TaskList', () => {
  const mockOnComplete = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnSearchChange = jest.fn();

  const sampleTasks = [
    { id: '1', title: 'Buy groceries', description: 'Milk and eggs', completed: 0 },
    { id: '2', title: 'Clean house', description: '', completed: 0 },
    { id: '3', title: 'Read book', description: 'Chapter 5', completed: 1 },
  ];

  beforeEach(() => {
    mockOnComplete.mockClear();
    mockOnDelete.mockClear();
    mockOnSearchChange.mockClear();
  });

  it('renders a list of tasks', () => {
    render(
      <TaskList
        tasks={sampleTasks}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    expect(screen.getByText('Clean house')).toBeInTheDocument();
    expect(screen.getByText('Read book')).toBeInTheDocument();
  });

  it('renders task descriptions when present', () => {
    render(
      <TaskList
        tasks={sampleTasks}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Milk and eggs')).toBeInTheDocument();
    expect(screen.getByText('Chapter 5')).toBeInTheDocument();
  });

  it('shows empty state when there are no tasks', () => {
    render(
      <TaskList
        tasks={[]}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('No tasks yet. Create one above!')).toBeInTheDocument();
  });

  it('shows search-specific empty state when search has no results', () => {
    render(
      <TaskList
        tasks={[]}
        searchQuery="nonexistent"
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('No tasks match your search.')).toBeInTheDocument();
  });

  it('shows Complete button for incomplete tasks', () => {
    render(
      <TaskList
        tasks={[sampleTasks[0]]}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Complete (+10 pts)')).toBeInTheDocument();
  });

  it('shows Done badge for completed tasks', () => {
    render(
      <TaskList
        tasks={[sampleTasks[2]]}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/Done/)).toBeInTheDocument();
    expect(screen.queryByText('Complete (+10 pts)')).not.toBeInTheDocument();
  });

  it('calls onComplete with task id when Complete button is clicked', () => {
    render(
      <TaskList
        tasks={[sampleTasks[0]]}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Complete (+10 pts)'));
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
    expect(mockOnComplete).toHaveBeenCalledWith('1');
  });

  it('calls onDelete with task id when delete button is clicked', () => {
    render(
      <TaskList
        tasks={[sampleTasks[0]]}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByTitle('Delete task'));
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('renders the search input', () => {
    render(
      <TaskList
        tasks={sampleTasks}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
  });

  it('calls onSearchChange when search input changes', () => {
    render(
      <TaskList
        tasks={sampleTasks}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Search tasks...'), {
      target: { value: 'groceries' },
    });
    expect(mockOnSearchChange).toHaveBeenCalledWith('groceries');
  });

  it('displays the current search query in the input', () => {
    render(
      <TaskList
        tasks={sampleTasks}
        searchQuery="my search"
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByPlaceholderText('Search tasks...')).toHaveValue('my search');
  });

  it('adds completed class to completed tasks', () => {
    const { container } = render(
      <TaskList
        tasks={[sampleTasks[2]]}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onComplete={mockOnComplete}
        onDelete={mockOnDelete}
      />
    );

    const taskItem = container.querySelector('.task-item.completed');
    expect(taskItem).toBeInTheDocument();
  });
});
