PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS benchmark_goalkeepers (
  goalkeeper_id TEXT PRIMARY KEY,
  gender TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS benchmark_matches (
  goalkeeper_id TEXT NOT NULL,
  benchmark_match_id TEXT NOT NULL,
  season TEXT NOT NULL,
  goalkeeper_age_group TEXT NOT NULL,
  goalkeeper_gender TEXT NOT NULL,
  goalkeeper_team_level TEXT NOT NULL,
  goalkeeper_team_tier TEXT NOT NULL,
  opponent_age_group TEXT NOT NULL,
  opponent_team_level TEXT NOT NULL,
  opponent_team_tier TEXT NOT NULL,
  match_type TEXT NOT NULL,
  participation TEXT NOT NULL,
  minutes_played REAL,
  periods INTEGER NOT NULL,
  save_rate REAL,
  defence_rate REAL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (goalkeeper_id, benchmark_match_id),
  FOREIGN KEY (goalkeeper_id) REFERENCES benchmark_goalkeepers(goalkeeper_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS benchmark_shots (
  goalkeeper_id TEXT NOT NULL,
  benchmark_match_id TEXT NOT NULL,
  shot_index INTEGER NOT NULL,
  outcome TEXT NOT NULL,
  shot_type TEXT NOT NULL,
  situation TEXT NOT NULL,
  outnumbered TEXT NOT NULL,
  rebound TEXT NOT NULL,
  d_x REAL,
  d_y REAL,
  goal_x REAL,
  goal_y REAL,
  PRIMARY KEY (goalkeeper_id, benchmark_match_id, shot_index),
  FOREIGN KEY (goalkeeper_id, benchmark_match_id) REFERENCES benchmark_matches(goalkeeper_id, benchmark_match_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_benchmark_match_cohort ON benchmark_matches(goalkeeper_gender, goalkeeper_age_group, goalkeeper_team_level, goalkeeper_team_tier);
CREATE INDEX IF NOT EXISTS idx_benchmark_match_goalkeeper ON benchmark_matches(goalkeeper_id);
CREATE INDEX IF NOT EXISTS idx_benchmark_shot_match ON benchmark_shots(goalkeeper_id, benchmark_match_id);
