-- Initial database schema for Start Screen API
-- Run with: pnpm wrangler d1 execute hapipath-db --file=./migrations/001_initial_schema.sql

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) >= 1 AND length(title) <= 200),
  description TEXT NOT NULL CHECK (length(description) >= 1 AND length(description) <= 5000),
  memory_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  user_id TEXT NOT NULL,
  location_id TEXT NOT NULL CHECK (length(location_id) >= 5),
  lat REAL NOT NULL CHECK (lat >= -90 AND lat <= 90),
  lon REAL NOT NULL CHECK (lon >= -180 AND lon <= 180),
  location_name TEXT
);

-- Flowers table
CREATE TABLE IF NOT EXISTS flowers (
  id TEXT PRIMARY KEY,
  lat REAL NOT NULL CHECK (lat >= -90 AND lat <= 90),
  lon REAL NOT NULL CHECK (lon >= -180 AND lon <= 180),
  texture TEXT NOT NULL CHECK (texture IN ('flower1', 'flower2', 'withered')),
  name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 120),
  created_at TEXT NOT NULL,
  wither_at TEXT,
  owner_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('mine', 'others'))
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memories_location_id ON memories(location_id);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at);
CREATE INDEX IF NOT EXISTS idx_flowers_location ON flowers(lat, lon);
CREATE INDEX IF NOT EXISTS idx_flowers_owner_id ON flowers(owner_id);
CREATE INDEX IF NOT EXISTS idx_flowers_created_at ON flowers(created_at);
