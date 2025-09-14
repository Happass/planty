// Database queries and utilities

export const insertMemory = `
INSERT INTO memories (
  id, title, description, memory_date, created_at, updated_at,
  user_id, location_id, lat, lon, location_name
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const insertFlower = `
INSERT INTO flowers (
  id, lat, lon, texture, name, created_at, wither_at, owner_id, type
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

export const getMemoriesByLocation = `
SELECT * FROM memories 
WHERE location_id = ? 
ORDER BY created_at DESC 
LIMIT ? OFFSET ?
`;

export const getMemoriesByLocationWithCursor = `
SELECT * FROM memories 
WHERE location_id = ? AND created_at < ?
ORDER BY created_at DESC 
LIMIT ?
`;

export const getFlowersInBBox = `
SELECT * FROM flowers 
WHERE lat >= ? AND lat <= ? AND lon >= ? AND lon <= ?
ORDER BY created_at DESC 
LIMIT ? OFFSET ?
`;

export const getFlowersInBBoxWithCursor = `
SELECT * FROM flowers 
WHERE lat >= ? AND lat <= ? AND lon >= ? AND lon <= ? AND created_at < ?
ORDER BY created_at DESC 
LIMIT ?
`;

export const getFlowersByOwner = `
SELECT * FROM flowers 
WHERE owner_id = ?
ORDER BY created_at DESC 
LIMIT ? OFFSET ?
`;

export const getFlowersByOwnerWithCursor = `
SELECT * FROM flowers 
WHERE owner_id = ? AND created_at < ?
ORDER BY created_at DESC 
LIMIT ?
`;

export const getFlowersByType = `
SELECT * FROM flowers 
WHERE type = ?
ORDER BY created_at DESC 
LIMIT ? OFFSET ?
`;

export const getFlowersByTypeWithCursor = `
SELECT * FROM flowers 
WHERE type = ? AND created_at < ?
ORDER BY created_at DESC 
LIMIT ?
`;

export const getMemoryById = `
SELECT * FROM memories WHERE id = ?
`;

export const getFlowerById = `
SELECT * FROM flowers WHERE id = ?
`;

export const updateMemory = `
UPDATE memories 
SET title = COALESCE(?, title),
    description = COALESCE(?, description),
    memory_date = COALESCE(?, memory_date),
    updated_at = ?
WHERE id = ?
`;

export const deleteMemory = `
DELETE FROM memories WHERE id = ?
`;

export const deleteFlower = `
DELETE FROM flowers WHERE id = ?
`;
