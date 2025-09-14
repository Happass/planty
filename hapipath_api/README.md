# Start Screen API

A Cloudflare Workers API implementation for managing memories and flowers with geolocation features.

## Features

- **Memory Management**: Create, read, update, and delete memories with geolocation
- **Flower System**: Plant and manage virtual flowers with different textures
- **Geolocation Support**: Bounding box queries and geohash-based location grouping
- **Pagination**: Cursor-based pagination for efficient data retrieval
- **No Authentication**: Public API with no authentication required

## API Endpoints

### Memories
- `GET /locations/{locationId}/memories` - List memories by location
- `POST /locations/{locationId}/memories` - Create a memory at location
- `PATCH /memories/{id}` - Update memory
- `DELETE /memories/{id}` - Delete memory

### Flowers
- `GET /flowers` - List flowers (with bbox, owner, type filters)
- `POST /flowers` - Create flower
- `GET /flowers/{id}` - Get flower
- `DELETE /flowers/{id}` - Delete flower


## Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure Cloudflare bindings**:
   - Update `wrangler.jsonc` with your D1 database ID

3. **Create D1 database**:
   ```bash
   pnpm wrangler d1 create hapipath-db
   ```

4. **Run database migrations**:
   ```bash
   pnpm wrangler d1 execute hapipath-db --file=./migrations/001_initial_schema.sql
   ```

5. **Deploy**:
   ```bash
   pnpm deploy
   ```

## Development

```bash
# Start development server
pnpm dev

# Type generation
pnpm cf-typegen

# Run database migrations (if schema changes)
pnpm wrangler d1 execute hapipath-db --file=./migrations/001_initial_schema.sql
```

## Database Schema

### Memories Table
- `id` (TEXT PRIMARY KEY)
- `title` (TEXT, 1-200 chars)
- `description` (TEXT, 1-5000 chars)
- `memory_date` (TEXT, ISO date)
- `created_at` (TEXT, ISO date)
- `updated_at` (TEXT, ISO date)
- `user_id` (TEXT)
- `location_id` (TEXT, geohash)
- `lat` (REAL, -90 to 90)
- `lon` (REAL, -180 to 180)
- `location_name` (TEXT, optional)

### Flowers Table
- `id` (TEXT PRIMARY KEY)
- `lat` (REAL, -90 to 90)
- `lon` (REAL, -180 to 180)
- `texture` (TEXT, enum: flower1, flower2, withered)
- `name` (TEXT, 1-120 chars)
- `created_at` (TEXT, ISO date)
- `wither_at` (TEXT, ISO date, optional)
- `owner_id` (TEXT)
- `type` (TEXT, enum: mine, others)

## Environment Variables

- `DB`: D1 database binding

## Authentication

No authentication is required. The API is publicly accessible.

## Error Handling

All errors follow the `ApiError` schema:
```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message",
  "details": {}
}
```

## License

MIT