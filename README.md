# Investio

Modern investment dashboard with real-time market data, portfolio tracking, and AI-powered analysis.

## Features

- Real-time stock and cryptocurrency market data
- AI chat assistant for market analysis
- Interactive charts and technical indicators
- Portfolio tracking and watchlist management
- Secure authentication with NextAuth
- Responsive design for desktop and mobile
- Multi-asset search across stocks and crypto

## Technology Stack

### Core Framework
- Next.js 15 (App Router)
- React 19
- TypeScript

### Backend & Database
- PostgreSQL
- Prisma ORM
- NextAuth.js

### Styling & UI
- Tailwind CSS

### APIs & Integrations
- Finnhub API (Stock market data)
- CoinGecko API (Cryptocurrency data)
- OpenAI API (Chat assistant)

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
