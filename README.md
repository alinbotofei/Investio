# Investio

Modern investment dashboard with real-time market data, AI-powered analysis, and portfolio management.

## Features

- Real-time stock and cryptocurrency data
- AI chat assistant for market insights
- Interactive charts and analytics
- Watchlist and portfolio tracking
- Secure authentication
- Responsive design

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: PostgreSQL, Prisma ORM, NextAuth.js
- **APIs**: Finnhub, OpenAI

## Getting Started

```bash
npm install
```

Create `.env.local`:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
FINNHUB_API_KEY=your_key
OPENAI_API_KEY=your_key
```

Run development server:

```bash
npm run dev
```

## Project Structure

```
app/
├── api/              # API routes
├── components/       # UI components
├── dashboard/        # Dashboard pages
├── ticker/           # Asset detail pages
└── hooks/            # Custom React hooks

lib/
├── services/         # Business logic
└── types/            # TypeScript definitions

prisma/
└── schema.prisma     # Database schema
```

## Deployment

See `DEPLOYMENT.md` for Vercel deployment instructions.

## License

Private
