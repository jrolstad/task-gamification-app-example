import React from 'react';

function Leaderboard({ users, currentUserId }) {
  const getMedal = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const getRankClass = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <div className="emoji">🏆</div>
        <p>No players yet!</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-list">
      {users.map((u, index) => {
        const rank = index + 1;
        return (
          <div
            key={u.id}
            className={`leaderboard-item ${u.id === currentUserId ? 'current-user' : ''}`}
          >
            <span className={`leaderboard-rank ${getRankClass(rank)}`}>
              {getMedal(rank)}
            </span>
            <span className="leaderboard-name">{u.name}</span>
            <span className="leaderboard-points">⭐ {u.points}</span>
          </div>
        );
      })}
    </div>
  );
}

export default Leaderboard;
