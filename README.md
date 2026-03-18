# Investio

A full-stack investment dashboard built as a portfolio project, demonstrating production-level React patterns, real-time data integration, and AI-driven UX.

## Features

- **AI Chat Assistant** — streaming responses via OpenAI with web search, inline chart rendering, and conversation history
- **Real-time Market Data** — live stock & crypto quotes, candlestick charts, analyst ratings, and insider sentiment via Finnhub
- **Watchlist** — persistent per-user watchlist with optimistic UI updates backed by PostgreSQL
- **Global Search** — symbol/company search with debounced input and keyboard navigation
- **Authentication** — email/password auth with NextAuth.js and JWT sessions
- **Ticker Detail** — dedicated asset pages with TradingView-style candlestick charts, news, recommendations, and metrics
- **Responsive Design** — mobile-first layout with collapsible sidebar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript (strict) |
| Auth | NextAuth.js v5 (JWT) |
| Database | PostgreSQL + Prisma ORM |
| AI | OpenAI GPT-4o-mini (streaming) |
| Market Data | Finnhub REST API |
| Charts | Lightweight Charts (TradingView) |
| Component Dev | Storybook 8 |
| E2E Testing | Playwright (Chromium + Firefox) |
| Unit Testing | Vitest |
| Deployment | Vercel + Supabase |

## Architecture

```
app/
├── api/                  # Next.js Route Handlers
│   ├── auth/             # NextAuth + user registration
│   ├── chat/             # OpenAI streaming endpoint
│   ├── conversations/    # CRUD for chat history
│   ├── stocks/           # Quote, candles, earnings, sentiment
│   ├── crypto/           # Quote and symbols
│   ├── market/           # Market overview aggregation
│   ├── ticker/           # Per-asset aggregate data
│   └── watchlist/        # Watchlist management
├── components/
│   ├── dashboard/        # Feature components (StockCard, TradingChart, …)
│   ├── layout/           # Sidebar, Header, DashboardLayout
│   └── ui/               # Design system primitives (Button, Input, Badge, …)
├── contexts/             # WatchlistContext, ConversationsContext
├── lib/
│   ├── constants/        # UI class strings, market symbols, chat prompts
│   ├── types.ts          # Shared TypeScript types
│   └── utils/            # scroll, markdown, event helpers
├── dashboard/            # /dashboard route + sub-components
├── chat/                 # /chat route (AI conversation page)
└── ticker/[symbol]/      # Dynamic asset detail page

lib/
├── auth.ts               # NextAuth configuration
├── prisma.ts             # Prisma singleton
├── api/finnhub.ts        # Typed Finnhub API client
└── services/             # Server-side business logic
    ├── conversationService.ts
    ├── marketService.ts
    ├── userService.ts
    └── watchlistService.ts

e2e/                      # Playwright end-to-end tests
prisma/schema.prisma      # Database schema (User, Conversation, Message, Watchlist)
```

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Create `.env.local`:

   ```env
   DATABASE_URL=postgresql://user:password@host:5432/investio
   NEXTAUTH_SECRET=<openssl rand -base64 32>
   NEXTAUTH_URL=http://localhost:3000
   FINNHUB_API_KEY=your_key
   OPENAI_API_KEY=your_key
   ```

3. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run storybook` | Launch Storybook on port 6006 |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Playwright with interactive UI |

## Testing

**E2E (Playwright):** Auth flows, dashboard layout, watchlist interactions, chat message sending — run across Chromium and Firefox with shared auth state.

**Component (Storybook):** All UI primitives and dashboard widgets have isolated stories covering loading, empty, error, and data states.

**Setup for E2E:**

```bash
# First run — configure test credentials
cp .env.local .env.test
# Set E2E_EMAIL and E2E_PASSWORD in .env.test, then:
npm run test:e2e
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel + Supabase deployment guide.

