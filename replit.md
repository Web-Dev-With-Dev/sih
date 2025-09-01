# Overview

This is a team management dashboard application built for Smart India Hackathon 2025. The application provides a comprehensive interface for managing team members, tasks, and file uploads in a hackathon environment. It features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **File Upload**: Multer middleware for handling multipart form data
- **Development**: TSX for TypeScript execution in development
- **Build**: ESBuild for production bundling

## Data Storage
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Shared TypeScript schema definitions between client and server
- **Migrations**: Drizzle Kit for database schema management
- **Validation**: Zod schemas for runtime type validation

## Authentication & Authorization
- Currently using in-memory storage for development
- No authentication system implemented yet
- Session management prepared with connect-pg-simple for future PostgreSQL session store

## File Management
- Local file storage in uploads directory
- File type validation for PDF, DOC, and DOCX formats
- 10MB file size limit enforced
- File metadata stored in database with original filenames preserved

## Project Structure
- **Monorepo**: Client and server code in separate directories
- **Shared**: Common schema and type definitions
- **Client**: React application with component-based architecture
- **Server**: Express API with modular route handlers
- **Database**: PostgreSQL schema defined in shared directory

## Development Workflow
- **Hot Reload**: Vite HMR for frontend, TSX watch mode for backend
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared code
- **Database**: Push schema changes directly to database with Drizzle Kit
- **Build**: Separate build processes for client (Vite) and server (ESBuild)

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: @neondatabase/serverless driver for database connectivity

## UI Framework
- **Radix UI**: Comprehensive set of accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## State Management
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation for forms and API data

## File Handling
- **Multer**: Express middleware for multipart/form-data handling
- **File System**: Node.js fs module for file operations

## Development Tools
- **Vite**: Frontend build tool and development server
- **TSX**: TypeScript execution for Node.js
- **ESBuild**: Fast JavaScript bundler for production builds
- **Drizzle Kit**: Database schema management and migrations

## Hosting & Deployment
- **Replit**: Development environment with integrated hosting
- **Replit Plugins**: Cartographer for development tooling and runtime error overlay