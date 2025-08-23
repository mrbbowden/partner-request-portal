# Partner Request Portal

A modern web application for managing partner requests, built with React, TypeScript, and Cloudflare Workers.

## Features

- **Partner Authentication**: Partners authenticate using their 4-digit Partner ID
- **Request Submission**: Submit various types of requests (technical support, billing, etc.)
- **Zapier Integration**: Automatic webhook integration for external service connections
- **Modern UI**: Built with React, Tailwind CSS, and shadcn/ui components
- **Cloudflare Workers**: Serverless deployment on Cloudflare's edge network

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Cloudflare Pages Functions with Hono framework
- **Database**: Cloudflare D1 (SQLite)
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod validation
- **Deployment**: Cloudflare Pages

## Setup Instructions

### Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Node.js**: Version 18 or higher
3. **Wrangler CLI**: Install with `npm install -g wrangler`

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd partner-request-portal
npm install
```

### 2. Set Up Cloudflare D1 Database

1. **Create D1 Database**:
   ```bash
   wrangler d1 create partner-portal-db
   ```

2. **Update wrangler.toml**:
   Replace `your-database-id-here` in `wrangler.toml` with the database ID from the previous step.

3. **Apply Database Schema**:
   ```bash
   wrangler d1 execute partner-portal-db --file=./schema.sql
   ```

### 3. Configure Environment Variables

1. **Zapier Webhook URL** (Optional):
   - Set up a Zapier webhook following the instructions in `ZAPIER_INTEGRATION.md`
   - Update the `ZAPIER_WEBHOOK_URL` in `wrangler.toml`

2. **Environment Variables**:
   ```bash
   # For development
   wrangler secret put ZAPIER_WEBHOOK_URL
   
   # For production
   wrangler secret put ZAPIER_WEBHOOK_URL --env production
   ```

### 4. Development

```bash
# Start development server
npm run dev

# Build the application
npm run build
```

### 5. Deployment

```bash
# Deploy to Cloudflare Pages
npm run deploy
```

## Project Structure

```
├── functions/
│   └── [[path]].ts        # Cloudflare Pages Functions (API routes)
├── src/
│   └── storage.ts         # Database storage layer
├── public/                # Static files (React app)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── main.tsx       # React entry point
│   └── index.html
├── dist/                  # Built React app
├── shared/
│   └── schema.ts          # Shared TypeScript schemas
├── schema.sql             # D1 database schema
├── wrangler.toml          # Cloudflare Pages configuration
└── package.json
```

## API Endpoints

- `GET /api/partners/:id` - Look up partner by ID
- `POST /api/requests` - Submit a new request
- `POST /api/zapier/webhook` - Test Zapier webhook endpoint

## Database Schema

### Partners Table
- `id` (VARCHAR(4)) - Primary key, 4-digit partner ID
- `full_name` (TEXT) - Partner's full name
- `email` (TEXT) - Partner's email address
- `phone` (TEXT) - Partner's phone number

### Requests Table
- `id` (VARCHAR) - Primary key, auto-generated UUID
- `partner_id` (VARCHAR(4)) - Foreign key to partners table
- `full_name` (TEXT) - Requester's full name
- `email` (TEXT) - Requester's email
- `phone` (TEXT) - Requester's phone
- `preferred_contact` (TEXT) - Preferred contact method
- `request_type` (TEXT) - Type of request
- `urgency` (TEXT) - Urgency level
- `description` (TEXT) - Request description
- `created_at` (TIMESTAMP) - Request creation timestamp

## Zapier Integration

The application automatically sends form submissions to Zapier webhooks when configured. See `ZAPIER_INTEGRATION.md` for detailed setup instructions.

## Development Notes

- The application uses in-memory storage during development
- D1 database is used in production
- Static files are served directly from the Worker
- All API routes are prefixed with `/api`

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Ensure D1 database is created and configured correctly
   - Check that the database ID in `wrangler.toml` is correct

2. **Build Errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run check`

3. **Deployment Issues**:
   - Ensure you're logged into Wrangler: `wrangler login`
   - Check your Cloudflare account permissions

### Support

For issues or questions, please check the Cloudflare Workers documentation or create an issue in the repository.
