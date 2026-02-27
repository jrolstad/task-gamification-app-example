import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import Leaderboard from './components/Leaderboard';
import PointsAnimation from './components/PointsAnimation';

function App() {
  const [user, setUser] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [tasks, setTasks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showPoints, setShowPoints] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Restore user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('taskquest_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('taskquest_user');
      }
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      const url = searchQuery.trim()
        ? `/api/tasks/search?user_id=${user.id}&q=${encodeURIComponent(searchQuery)}`
        : `/api/tasks?user_id=${user.id}`;
      const res = await axios.get(url);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, [user, searchQuery]);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await axios.get('/api/leaderboard');
      setLeaderboard(res.data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  }, []);

  // Fetch tasks and leaderboard when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchLeaderboard();
    }
  }, [user, fetchTasks, fetchLeaderboard]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    try {
      const res = await axios.post('/api/users', { name: nameInput.trim() });
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('taskquest_user', JSON.stringify(userData));
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setTasks([]);
    setSearchQuery('');
    localStorage.removeItem('taskquest_user');
  };

  const handleCreateTask = async (title, description) => {
    try {
      await axios.post('/api/tasks', {
        user_id: user.id,
        title,
        description,
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const res = await axios.patch(`/api/tasks/${taskId}/complete`);
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem('taskquest_user', JSON.stringify(updatedUser));
      fetchTasks();
      fetchLeaderboard();

      // Show points animation
      setShowPoints(true);
      setTimeout(() => setShowPoints(false), 1200);
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Login screen
  if (!user) {
    return (
      <div className="login-screen">
        <h1>⚔️ Task Quest</h1>
        <p>Complete tasks. Earn points. Top the leaderboard.</p>
        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enter your name to begin..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            autoFocus
          />
          <button type="submit">Start</button>
        </form>
      </div>
    );
  }

  // Main app
  return (
    <div className="app-container">
      <Header user={user} onLogout={handleLogout} />

      <div className="main-content">
        <div className="tasks-section">
          <div className="card">
            <h2>📝 New Task</h2>
            <TaskForm onCreateTask={handleCreateTask} />
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <h2>📋 My Tasks</h2>
            <TaskList
              tasks={tasks}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onComplete={handleCompleteTask}
              onDelete={handleDeleteTask}
            />
          </div>
        </div>

        <div className="leaderboard-section">
          <div className="card">
            <h2>🏆 Leaderboard</h2>
            <Leaderboard users={leaderboard} currentUserId={user.id} />
          </div>
        </div>
      </div>

      {showPoints && <PointsAnimation points={10} />}
    </div>
  );
}

export default App;
