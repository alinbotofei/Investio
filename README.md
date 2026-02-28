# Investio

## Project Overview

Investio is a modern investment platform designed to provide real-time market intelligence and portfolio management capabilities. The platform combines live market data from global exchanges with AI-powered analysis to help users make informed investment decisions.

The application addresses the need for a unified dashboard where investors can track stocks, cryptocurrencies, and receive intelligent insights through a conversational AI interface.

## Key Features

- Real-time market data integration for stocks and cryptocurrencies
- AI-powered chat assistant for market analysis and investment queries
- Interactive charting and technical indicators
- Portfolio tracking and watchlist management
- Secure user authentication and session management
- Responsive design optimized for desktop and mobile devices
- Advanced search functionality across multiple asset classes

## Technology Stack

### Core Framework
- Next.js 15 (App Router) - React framework with server-side rendering
- React 19 - UI component library
- TypeScript - Type-safe development

### Backend & Database
- PostgreSQL - Relational database
- Prisma ORM - Database toolkit and migrations
- NextAuth.js - Authentication and session management

### Styling & UI
- Tailwind CSS - Utility-first CSS framework
- Custom components with modern design patterns

### APIs & Integrations
- Finnhub API - Stock market data and financial information
- CoinGecko API - Cryptocurrency market data
- OpenAI API - AI chat assistant functionality

### Deployment
- Vercel - Serverless deployment platform
- Edge functions for optimal performance

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js 20.2 or higher
- npm or yarn package manager
- PostgreSQL database (optional for local development)

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd investio
npm install
```

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database (optional for development)
DATABASE_URL=postgresql://user:password@localhost:5432/investio

# API Keys
FINNHUB_API_KEY=your_finnhub_api_key
OPENAI_API_KEY=your_openai_api_key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret
```

Note: The application can run without a database in development mode for testing purposes.

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

Create an optimized production build:

```bash
npm run build
npm start
```

## Project Structure

```
investio/
├── app/                   # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── components/        # React components
│   ├── dashboard/         # Dashboard pages
│   ├── lib/               # Utility functions
│   └── ticker/            # Stock detail pages
├── lib/                   # Shared libraries
│   ├── api/               # API clients
│   ├── services/          # Business logic
│   └── types/             # TypeScript definitions
├── prisma/                # Database schema and migrations
└── public/                # Static assets
```

## Deployment

For detailed deployment instructions to Vercel, refer to `DEPLOYMENT.md`.

### Quick Deployment Steps

1. Set up a PostgreSQL database (Neon or Vercel Postgres recommended)
2. Configure environment variables in Vercel dashboard
3. Deploy using Vercel CLI or GitHub integration
4. Run database migrations: `npx prisma migrate deploy`

## Development Guidelines

- All components use TypeScript with strict type checking
- Follow the established atomic design pattern for components
- Use Prisma for all database operations
- Implement proper error handling and validation
- Maintain responsive design across all breakpoints

## Security

- Passwords are hashed using bcrypt with 12 salt rounds
- Authentication handled through NextAuth with JWT strategy
- Environment variables are server-side only
- SQL injection protection via Prisma ORM
- CSRF protection built into NextAuth

## License

This project is private and proprietary.

```
app/
├── components/
│   ├── ui/          # Reusable components
│   └── layout/      # Layout components
├── lib/             # Constants & types
├── api/chat/        # OpenAI API route
├── page.tsx         # Dashboard
└── chat/page.tsx    # Chat interface
```

## Deployment

1. Push to GitHub
2. Import to Vercel
3. Add `OPENAI_API_KEY` environment variable
4. Deploy

## License

Private
