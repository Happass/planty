// TypeScript types based on OpenAPI specification

export interface ISODate {
  type: 'string';
  format: 'date-time';
}

export interface Geohash {
  type: 'string';
  minLength: 5;
}

export interface Memory {
  id: string;
  title: string;
  description: string;
  memoryDate: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  userId: string;
  locationId: string; // Geohash
  lat: number;
  lon: number;
  locationName?: string;
}

export interface CreateMemoryInput {
  title: string;
  description: string;
  memoryDate?: string; // ISO date string
  lat: number;
  lon: number;
  locationName?: string;
}

export interface Flower {
  id: string;
  lat: number;
  lon: number;
  texture: 'flower1' | 'flower2' | 'withered';
  name: string;
  createdAt: string; // ISO date string
  witherAt?: string; // ISO date string
  ownerId: string;
  type: 'mine' | 'others';
}

export interface CreateFlowerInput {
  lat: number;
  lon: number;
  texture: 'flower1' | 'flower2';
  name: string;
}

export interface PaginatedMemory {
  items: Memory[];
  nextCursor?: string;
}

export interface PaginatedFlower {
  items: Flower[];
  nextCursor?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}


// Query parameters
export interface ListMemoriesQuery {
  limit?: number;
  cursor?: string;
}

export interface ListFlowersQuery {
  bbox?: string; // west,south,east,north
  limit?: number;
  cursor?: string;
  owner?: 'me' | 'all';
  type?: 'mine' | 'others' | 'withered';
}

export interface UpdateMemoryInput {
  title?: string;
  description?: string;
  memoryDate?: string;
}

// Database types
export interface DatabaseMemory {
  id: string;
  title: string;
  description: string;
  memory_date: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  location_id: string;
  lat: number;
  lon: number;
  location_name?: string;
}

export interface DatabaseFlower {
  id: string;
  lat: number;
  lon: number;
  texture: string;
  name: string;
  created_at: string;
  wither_at?: string;
  owner_id: string;
  type: string;
}
