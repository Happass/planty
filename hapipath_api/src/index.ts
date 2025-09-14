import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { 
  Memory, 
  CreateMemoryInput, 
  Flower, 
  CreateFlowerInput, 
  PaginatedMemory, 
  PaginatedFlower,
  ListMemoriesQuery,
  ListFlowersQuery,
  UpdateMemoryInput,
  ApiError
} from './types.js'
import { 
  generateId, 
  getCurrentISOTime, 
  parseBBox, 
  generateGeohash,
  convertDatabaseMemoryToMemory,
  convertDatabaseFlowerToFlower,
  validateMemoryInput,
  validateFlowerInput,
  createApiError
} from './utils.js'

// Cloudflare bindings
interface Env {
  DB: any; // D1Database
}

const app = new Hono<{ Bindings: Env }>()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))


// Helper function to get user ID (no authentication required)
function getUserId(): string {
  // Generate a consistent user ID for the session
  // In a real app, you might use a session ID or IP-based identifier
  return 'anonymous-user'
}

// Helper function to handle errors
function handleError(error: any) {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    return createApiError('INTERNAL_ERROR', error.message)
  }
  
  return createApiError('UNKNOWN_ERROR', 'An unknown error occurred')
}

// Memory routes
app.get('/locations/:locationId/memories', async (c) => {
  try {
    const locationId = c.req.param('locationId')
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 200)
    const cursor = c.req.query('cursor')
    
    if (locationId.length < 5) {
      return c.json(createApiError('INVALID_GEOHASH', 'Location ID must be at least 5 characters'), 400)
    }
    
    let query: string
    let params: any[]
    
    if (cursor) {
      query = `
        SELECT * FROM memories 
        WHERE location_id = ? AND created_at < ?
        ORDER BY created_at DESC 
        LIMIT ?
      `
      params = [locationId, cursor, limit]
    } else {
      query = `
        SELECT * FROM memories 
        WHERE location_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `
      params = [locationId, limit]
    }
    
    const result = await c.env.DB.prepare(query).bind(...params).all()
    const memories = result.results.map(convertDatabaseMemoryToMemory)
    
    const response: PaginatedMemory = {
      items: memories,
      nextCursor: memories.length === limit ? memories[memories.length - 1].createdAt : undefined
    }
    
    return c.json(response)
  } catch (error) {
    return c.json(handleError(error), 500)
  }
})

// Create memory with locationId in path
app.post('/locations/:locationId/memories', async (c) => {
  try {
    const locationId = c.req.param('locationId')
    const input: CreateMemoryInput = await c.req.json()
    const userId = getUserId()
    
    // Validate input
    const validationErrors = validateMemoryInput(input)
    if (validationErrors.length > 0) {
      return c.json(createApiError('VALIDATION_ERROR', 'Invalid input', validationErrors), 400)
    }
    
    if (locationId.length < 5) {
      return c.json(createApiError('INVALID_GEOHASH', 'Location ID must be at least 5 characters'), 400)
    }
    
    const id = generateId()
    const now = getCurrentISOTime()
    const memoryDate = input.memoryDate || now
    
    const memory: Memory = {
      id,
      title: input.title,
      description: input.description,
      memoryDate,
      createdAt: now,
      updatedAt: now,
      userId,
      locationId,
      lat: input.lat,
      lon: input.lon,
      locationName: input.locationName,
    }
    
    await c.env.DB.prepare(`
      INSERT INTO memories (
        id, title, description, memory_date, created_at, updated_at,
        user_id, location_id, lat, lon, location_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      memory.id, memory.title, memory.description,
      memory.memoryDate, memory.createdAt, memory.updatedAt,
      memory.userId, memory.locationId, memory.lat, memory.lon, memory.locationName
    ).run()
    
    return c.json(memory, 201)
  } catch (error) {
    return c.json(handleError(error), 500)
  }
})

// Create memory with locationId in request body
app.post('/memories', async (c) => {
  try {
    const input: CreateMemoryInput & { locationId: string } = await c.req.json()
    const userId = getUserId()
    
    // Validate input
    const validationErrors = validateMemoryInput(input)
    if (validationErrors.length > 0) {
      return c.json(createApiError('VALIDATION_ERROR', 'Invalid input', validationErrors), 400)
    }
    
    // Validate locationId
    if (!input.locationId || input.locationId.length < 5) {
      return c.json(createApiError('INVALID_GEOHASH', 'Location ID is required and must be at least 5 characters'), 400)
    }
    
    const id = generateId()
    const now = getCurrentISOTime()
    const memoryDate = input.memoryDate || now
    
    const memory: Memory = {
      id,
      title: input.title,
      description: input.description,
      memoryDate,
      createdAt: now,
      updatedAt: now,
      userId,
      locationId: input.locationId,
      lat: input.lat,
      lon: input.lon,
      locationName: input.locationName,
    }
    
    await c.env.DB.prepare(`
      INSERT INTO memories (
        id, title, description, memory_date, created_at, updated_at,
        user_id, location_id, lat, lon, location_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      memory.id, memory.title, memory.description,
      memory.memoryDate, memory.createdAt, memory.updatedAt,
      memory.userId, memory.locationId, memory.lat, memory.lon, memory.locationName
    ).run()
    
    return c.json(memory, 201)
  } catch (error) {
    return c.json(handleError(error), 500)
  }
})

app.patch('/memories/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const input: UpdateMemoryInput = await c.req.json()
    
    // Check if memory exists
    const existing = await c.env.DB.prepare('SELECT * FROM memories WHERE id = ?').bind(id).first()
    if (!existing) {
      return c.json(createApiError('NOT_FOUND', 'Memory not found'), 404)
    }
    
    const now = getCurrentISOTime()
    
    await c.env.DB.prepare(`
      UPDATE memories 
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          memory_date = COALESCE(?, memory_date),
          updated_at = ?
      WHERE id = ?
    `).bind(
      input.title || null, 
      input.description || null, 
      input.memoryDate || null, 
      now, 
      id
    ).run()
    
    // Fetch updated memory
    const updated = await c.env.DB.prepare('SELECT * FROM memories WHERE id = ?').bind(id).first()
    const memory = convertDatabaseMemoryToMemory(updated as any)
    
    return c.json(memory)
  } catch (error) {
    return c.json(handleError(error), 500)
  }
})

app.delete('/memories/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    // Check if memory exists
    const existing = await c.env.DB.prepare('SELECT * FROM memories WHERE id = ?').bind(id).first()
    if (!existing) {
      return c.json(createApiError('NOT_FOUND', 'Memory not found'), 404)
    }
    
    await c.env.DB.prepare('DELETE FROM memories WHERE id = ?').bind(id).run()
    
    return new Response(null, { status: 204 })
  } catch (error) {
    return c.json(handleError(error), 500)
  }
})

// Flower routes
app.get('/flowers', async (c) => {
  try {
    const bbox = c.req.query('bbox')
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 200)
    const cursor = c.req.query('cursor')
    const owner = c.req.query('owner') || 'all'
    const type = c.req.query('type')
    const userId = getUserId()
    
    let query: string
    let params: any[]
    
    if (bbox) {
      const bboxParsed = parseBBox(bbox)
      if (!bboxParsed) {
        return c.json(createApiError('INVALID_BBOX', 'Invalid bbox format. Expected: west,south,east,north'), 400)
      }
      
      const { west, south, east, north } = bboxParsed
      
      if (cursor) {
        query = `
          SELECT * FROM flowers 
          WHERE lat >= ? AND lat <= ? AND lon >= ? AND lon <= ? AND created_at < ?
          ORDER BY created_at DESC 
          LIMIT ?
        `
        params = [south, north, west, east, cursor, limit]
      } else {
        query = `
          SELECT * FROM flowers 
          WHERE lat >= ? AND lat <= ? AND lon >= ? AND lon <= ?
          ORDER BY created_at DESC 
          LIMIT ?
        `
        params = [south, north, west, east, limit]
      }
    } else if (owner === 'me') {
      if (cursor) {
        query = `
          SELECT * FROM flowers 
          WHERE owner_id = ? AND created_at < ?
          ORDER BY created_at DESC 
          LIMIT ?
        `
        params = [userId, cursor, limit]
      } else {
        query = `
          SELECT * FROM flowers 
          WHERE owner_id = ?
          ORDER BY created_at DESC 
          LIMIT ?
        `
        params = [userId, limit]
      }
    } else if (type) {
      if (cursor) {
        query = `
          SELECT * FROM flowers 
          WHERE type = ? AND created_at < ?
          ORDER BY created_at DESC 
          LIMIT ?
        `
        params = [type, cursor, limit]
      } else {
        query = `
          SELECT * FROM flowers 
          WHERE type = ?
          ORDER BY created_at DESC 
          LIMIT ?
        `
        params = [type, limit]
      }
    } else {
      if (cursor) {
        query = `
          SELECT * FROM flowers 
          WHERE created_at < ?
          ORDER BY created_at DESC 
          LIMIT ?
        `
        params = [cursor, limit]
      } else {
        query = `
          SELECT * FROM flowers 
          ORDER BY created_at DESC 
          LIMIT ?
        `
        params = [limit]
      }
    }
    
    const result = await c.env.DB.prepare(query).bind(...params).all()
    const flowers = result.results.map(convertDatabaseFlowerToFlower)
    
    const response: PaginatedFlower = {
      items: flowers,
      nextCursor: flowers.length === limit ? flowers[flowers.length - 1].createdAt : undefined
    }
    
    return c.json(response)
  } catch (error) {
    return c.json(handleError(error), 500)
  }
})

app.post('/flowers', async (c) => {
  try {
    const input: CreateFlowerInput = await c.req.json()
    const userId = getUserId()
    
    // Validate input
    const validationErrors = validateFlowerInput(input)
    if (validationErrors.length > 0) {
      return c.json(createApiError('VALIDATION_ERROR', 'Invalid input', validationErrors), 400)
    }
    
    const id = generateId()
    const now = getCurrentISOTime()
    
    const flower: Flower = {
      id,
      lat: input.lat,
      lon: input.lon,
      texture: input.texture,
      name: input.name,
      createdAt: now,
      ownerId: userId,
      type: 'mine',
    }
    
    await c.env.DB.prepare(`
      INSERT INTO flowers (
        id, lat, lon, texture, name, created_at, owner_id, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      flower.id, flower.lat, flower.lon, flower.texture,
      flower.name, flower.createdAt, flower.ownerId, flower.type
    ).run()
    
    return c.json(flower, 201)
  } catch (error) {
    return c.json(handleError(error), 500)
  }
})

app.get('/flowers/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const result = await c.env.DB.prepare('SELECT * FROM flowers WHERE id = ?').bind(id).first()
    if (!result) {
      return c.json(createApiError('NOT_FOUND', 'Flower not found'), 404)
    }
    
    const flower = convertDatabaseFlowerToFlower(result as any)
    return c.json(flower)
  } catch (error) {
    return c.json(handleError(error), 500)
  }
})

app.delete('/flowers/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    // Check if flower exists
    const existing = await c.env.DB.prepare('SELECT * FROM flowers WHERE id = ?').bind(id).first()
    if (!existing) {
      return c.json(createApiError('NOT_FOUND', 'Flower not found'), 404)
    }
    
    await c.env.DB.prepare('DELETE FROM flowers WHERE id = ?').bind(id).run()
    
    return new Response(null, { status: 204 })
  } catch (error) {
    return c.json(handleError(error), 500)
  }
})


// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Start Screen API', 
    version: '1.0.0',
    status: 'healthy'
  })
})

export default app
