import React from 'react';

function TaskList({ tasks, searchQuery, onSearchChange, onComplete, onDelete }) {
  return (
    <div>
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🎯</div>
          <p>{searchQuery ? 'No tasks match your search.' : 'No tasks yet. Create one above!'}</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${task.completed ? 'completed' : ''}`}
            >
              <div className="task-info">
                <div className="task-title">{task.title}</div>
                {task.description && (
                  <div className="task-description">{task.description}</div>
                )}
              </div>
              <div className="task-actions">
                {task.completed ? (
                  <span className="completed-badge">✅ Done</span>
                ) : (
                  <button
                    className="complete-btn"
                    onClick={() => onComplete(task.id)}
                  >
                    Complete (+10 pts)
                  </button>
                )}
                <button
                  className="delete-btn"
                  onClick={() => onDelete(task.id)}
                  title="Delete task"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;
