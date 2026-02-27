import React from 'react';

function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1>⚔️ Task Quest</h1>
      </div>
      <div className="header-right">
        <div className="user-info">
          <div className="user-name">{user.name}</div>
          <div className="user-points">⭐ {user.points} pts</div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Sign Out
        </button>
      </div>
    </header>
  );
}

export default Header;
