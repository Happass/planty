// Utility functions

import { DatabaseMemory, DatabaseFlower, Memory, Flower, CreateMemoryInput, CreateFlowerInput } from './types.js';

export function generateId(): string {
  return crypto.randomUUID();
}

export function getCurrentISOTime(): string {
  return new Date().toISOString();
}

export function parseBBox(bbox: string): { west: number; south: number; east: number; north: number } | null {
  const parts = bbox.split(',');
  if (parts.length !== 4) return null;
  
  const [west, south, east, north] = parts.map(Number);
  if (isNaN(west) || isNaN(south) || isNaN(east) || isNaN(north)) return null;
  
  return { west, south, east, north };
}

export function generateGeohash(lat: number, lon: number, precision: number = 5): string {
  // Simple geohash implementation for demo purposes
  // In production, you might want to use a proper geohash library
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let bits = 0;
  let bit = 0;
  let ch = 0;
  let even = true;
  let geohash = '';
  
  const latRange = [-90, 90];
  const lonRange = [-180, 180];
  
  while (geohash.length < precision) {
    if (even) {
      const mid = (lonRange[0] + lonRange[1]) / 2;
      if (lon >= mid) {
        ch |= (1 << (4 - bit));
        lonRange[0] = mid;
      } else {
        lonRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat >= mid) {
        ch |= (1 << (4 - bit));
        latRange[0] = mid;
      } else {
        latRange[1] = mid;
      }
    }
    
    even = !even;
    bit++;
    
    if (bit === 5) {
      geohash += base32[ch];
      bit = 0;
      ch = 0;
    }
  }
  
  return geohash;
}

export function convertDatabaseMemoryToMemory(dbMemory: DatabaseMemory): Memory {
  return {
    id: dbMemory.id,
    title: dbMemory.title,
    description: dbMemory.description,
    memoryDate: dbMemory.memory_date,
    createdAt: dbMemory.created_at,
    updatedAt: dbMemory.updated_at,
    userId: dbMemory.user_id,
    locationId: dbMemory.location_id,
    lat: dbMemory.lat,
    lon: dbMemory.lon,
    locationName: dbMemory.location_name,
  };
}

export function convertDatabaseFlowerToFlower(dbFlower: DatabaseFlower): Flower {
  return {
    id: dbFlower.id,
    lat: dbFlower.lat,
    lon: dbFlower.lon,
    texture: dbFlower.texture as 'flower1' | 'flower2' | 'withered',
    name: dbFlower.name,
    createdAt: dbFlower.created_at,
    witherAt: dbFlower.wither_at,
    ownerId: dbFlower.owner_id,
    type: dbFlower.type as 'mine' | 'others',
  };
}

export function validateMemoryInput(input: CreateMemoryInput): string[] {
  const errors: string[] = [];
  
  if (!input.title || input.title.length < 1 || input.title.length > 200) {
    errors.push('Title must be between 1 and 200 characters');
  }
  
  if (!input.description || input.description.length < 1 || input.description.length > 5000) {
    errors.push('Description must be between 1 and 5000 characters');
  }
  
  if (input.lat < -90 || input.lat > 90) {
    errors.push('Latitude must be between -90 and 90');
  }
  
  if (input.lon < -180 || input.lon > 180) {
    errors.push('Longitude must be between -180 and 180');
  }
  
  
  if (input.memoryDate && !isValidISODate(input.memoryDate)) {
    errors.push('Memory date must be a valid ISO date string');
  }
  
  return errors;
}

export function validateFlowerInput(input: CreateFlowerInput): string[] {
  const errors: string[] = [];
  
  if (!input.name || input.name.length < 1 || input.name.length > 120) {
    errors.push('Name must be between 1 and 120 characters');
  }
  
  if (input.lat < -90 || input.lat > 90) {
    errors.push('Latitude must be between -90 and 90');
  }
  
  if (input.lon < -180 || input.lon > 180) {
    errors.push('Longitude must be between -180 and 180');
  }
  
  if (!['flower1', 'flower2'].includes(input.texture)) {
    errors.push('Texture must be either flower1 or flower2');
  }
  
  return errors;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && date.toISOString() === dateString;
}

export function createApiError(code: string, message: string, details?: any) {
  return {
    code,
    message,
    details,
  };
}
