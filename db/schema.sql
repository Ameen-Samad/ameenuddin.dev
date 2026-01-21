-- Leaderboard entries table
CREATE TABLE IF NOT EXISTS leaderboard (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  lines INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);

-- Leaderboard history table for tracking all scores over time
CREATE TABLE IF NOT EXISTS leaderboard_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  level INTEGER NOT NULL,
  lines INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create index for history queries
CREATE INDEX IF NOT EXISTS idx_history_player_name ON leaderboard_history(player_name);
CREATE INDEX IF NOT EXISTS idx_history_score ON leaderboard_history(score DESC);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON leaderboard_history(created_at DESC);