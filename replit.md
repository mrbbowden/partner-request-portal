# Overview

This is a full-stack Partner Request Portal application built with a React frontend and Express.js backend. The application allows partners to submit service requests by first verifying their 4-digit partner ID, then filling out a detailed request form. When a partner enters their ID and the cursor leaves the field, the app automatically looks up their information and prefills the form with their name, email, and phone number. The system uses a clean, modern UI with shadcn/ui components and Tailwind CSS for styling.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for partner lookup and request submission
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Validation**: Zod schemas for runtime type checking and validation
- **Storage**: Currently using in-memory storage with sample data, configured for PostgreSQL migration

## Database Schema
- **Partners Table**: Stores partner information (ID, name, email, phone)
- **Requests Table**: Stores service requests with foreign key to partners
- **Database**: PostgreSQL with Neon serverless configuration

## Development Setup
- **Monorepo Structure**: Shared schema between client and server in `/shared` directory
- **Hot Reload**: Vite dev server with HMR for frontend development
- **Build Process**: Separate build processes for client (Vite) and server (esbuild)
- **TypeScript**: Strict configuration with path mapping for clean imports

## Key Features
1. **Partner Verification**: 4-digit partner ID lookup with real-time validation
2. **Request Form**: Multi-step form with contact preferences, request types, and urgency levels
3. **Form Validation**: Client and server-side validation using Zod schemas
4. **Responsive Design**: Mobile-first approach with Tailwind breakpoints
5. **Toast Notifications**: User feedback for form submissions and errors

# External Dependencies

## Database
- **PostgreSQL**: Primary database with Neon serverless hosting
- **Drizzle ORM**: Type-safe database operations with automatic migrations
- **Connection**: Environment-based DATABASE_URL configuration

## UI Components
- **Radix UI**: Accessible component primitives for complex UI elements
- **shadcn/ui**: Pre-built component library with consistent design system
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Replit Integration**: Vite plugin for Replit-specific development features
- **TypeScript**: Full type safety across frontend, backend, and shared code
- **ESLint/Prettier**: Code formatting and linting (implied by structure)

## Form and Validation
- **React Hook Form**: Performant form handling with minimal re-renders
- **Zod**: Runtime type validation and schema generation
- **Hookform Resolvers**: Integration between React Hook Form and Zod

## Styling and Fonts
- **Google Fonts**: Inter, DM Sans, Fira Code, and Geist Mono font families
- **Class Variance Authority**: Type-safe component variant handling
- **Tailwind Merge**: Utility for merging Tailwind classes safely