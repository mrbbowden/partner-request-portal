# Cloudflare Workers Migration Guide

This document outlines the changes made to convert the Partner Request Portal from an Express.js application to a Cloudflare Workers application.

## Major Changes

### 1. Backend Framework Migration
- **Before**: Express.js with Node.js server
- **After**: Hono framework with Cloudflare Workers

### 2. Database Migration
- **Before**: In-memory storage (development) / PostgreSQL with Drizzle ORM
- **After**: Cloudflare D1 (SQLite) with direct SQL queries

### 3. File Structure Changes
```
Before:
├── client/           # React frontend
├── server/           # Express.js backend
└── shared/           # Shared schemas

After:
├── src/              # Cloudflare Worker code
├── public/           # React frontend (source)
├── dist/             # Built React app
└── shared/           # Shared schemas
```

## New Files Created

### Core Worker Files
- `src/worker.ts` - Main Cloudflare Worker entry point
- `src/api.ts` - API routes using Hono framework
- `src/storage.ts` - Database storage layer with D1 support

### Configuration Files
- `wrangler.toml` - Cloudflare Workers configuration
- `schema.sql` - D1 database schema
- `tsconfig.worker.json` - TypeScript config for worker
- `deploy.sh` - Automated deployment script

### Documentation
- `README.md` - Updated setup and deployment instructions
- `CLOUDFLARE_MIGRATION.md` - This migration guide

## Key Technical Changes

### 1. API Routes
**Before (Express.js)**:
```typescript
app.get("/api/partners/:id", async (req, res) => {
  const partnerId = req.params.id;
  // ... handler logic
  res.json(partner);
});
```

**After (Hono)**:
```typescript
apiRouter.get('/partners/:id', async (c) => {
  const partnerId = c.req.param('id');
  // ... handler logic
  return c.json(partner);
});
```

### 2. Database Operations
**Before (Drizzle ORM)**:
```typescript
const partner = await db.select().from(partners).where(eq(partners.id, id));
```

**After (D1 SQL)**:
```typescript
const result = await this.db.prepare('SELECT * FROM partners WHERE id = ?').bind(id).first();
```

### 3. Static File Serving
**Before**: Express static middleware
**After**: Hono static middleware with Cloudflare Workers

### 4. Environment Variables
**Before**: `process.env.VARIABLE_NAME`
**After**: `c.env.VARIABLE_NAME` (Cloudflare Workers bindings)

## Dependencies Added

### New Dependencies
- `hono` - Web framework for Cloudflare Workers
- `@hono/zod-validator` - Zod validation for Hono
- `@cloudflare/workers-types` - TypeScript types for Workers

### Removed Dependencies
- `express` - Replaced by Hono
- `express-session` - Not needed for stateless Workers
- `@neondatabase/serverless` - Replaced by D1
- `drizzle-orm` - Replaced by direct SQL queries
- `drizzle-kit` - Replaced by D1 schema management

## Deployment Process

### Before
1. Build React app
2. Start Express server
3. Deploy to traditional hosting

### After
1. Build React app (`npm run build`)
2. Deploy to Cloudflare Workers (`npm run deploy`)
3. Or use automated script (`npm run deploy:full`)

## Database Schema

The database schema remains the same, but the implementation changed:

### Tables
- `partners` - Partner information
- `requests` - Request submissions

### Sample Data
The same sample partner data is included in the schema:
- Partner ID: 1234, 5678, 9876

## Environment Variables

### Required
- `DB` - D1 database binding (configured in wrangler.toml)

### Optional
- `ZAPIER_WEBHOOK_URL` - Zapier webhook URL for integrations

## Benefits of Migration

### Performance
- **Edge Computing**: Requests handled at the edge, closer to users
- **Cold Start**: No cold starts like traditional serverless
- **Global Distribution**: Automatic global distribution

### Cost
- **Free Tier**: Generous free tier for Workers and D1
- **Pay-per-request**: Only pay for actual usage
- **No Server Costs**: No need to manage servers

### Developer Experience
- **Simplified Deployment**: Single command deployment
- **Built-in Database**: D1 database included
- **TypeScript Support**: Full TypeScript support out of the box

## Migration Checklist

- [x] Convert Express routes to Hono
- [x] Replace in-memory storage with D1
- [x] Update API client calls
- [x] Configure static file serving
- [x] Set up environment variables
- [x] Create deployment scripts
- [x] Update documentation
- [x] Test build process
- [x] Verify API functionality

## Next Steps

1. **Deploy to Cloudflare**:
   ```bash
   npm run deploy:full
   ```

2. **Configure D1 Database**:
   - Create database: `wrangler d1 create partner-portal-db`
   - Update `wrangler.toml` with database ID
   - Apply schema: `wrangler d1 execute partner-portal-db --file=./schema.sql`

3. **Set Environment Variables**:
   ```bash
   wrangler secret put ZAPIER_WEBHOOK_URL
   ```

4. **Test Application**:
   - Verify partner lookup works
   - Test request submission
   - Check Zapier integration

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure D1 database is created and configured
2. **Build Errors**: Check TypeScript configuration
3. **Deployment Issues**: Verify Wrangler authentication

### Support
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Framework Documentation](https://hono.dev/)
- [D1 Database Documentation](https://developers.cloudflare.com/d1/)

