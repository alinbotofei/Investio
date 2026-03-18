# Investio — Architecture Report

## Overview

Investio is a Next.js 15 (App Router) full-stack application. All server logic lives inside the same repository alongside the React frontend — no separate backend process.

---

## Routing & Pages

| Route | File | Auth Required |
|-------|------|---------------|
| `/` | `app/page.tsx` | Redirects → `/dashboard` or `/login` |
| `/login` | `app/login/page.tsx` | No |
| `/auth/signup` | `app/auth/signup/page.tsx` | No |
| `/dashboard` | `app/dashboard/page.tsx` | Yes |
| `/chat` | `app/chat/page.tsx` | Yes |
| `/ticker/[symbol]` | `app/ticker/[symbol]/page.tsx` | Yes |
| `/terms-condition` | `app/terms-condition/page.tsx` | No |

Route protection is enforced by `middleware.ts` using NextAuth's `getToken()` — unauthenticated requests to protected routes are redirected to `/login`.

---

## API Layer (`app/api/`)

All API routes are Next.js Route Handlers. They act as a thin proxy/aggregation layer between the client and external services, keeping API keys server-side.

```
/api/auth/[...nextauth]   NextAuth.js handlers (login, session, JWT)
/api/auth/register        POST — create user (bcrypt password hash)
/api/auth/check-user      GET  — email availability check

/api/chat                 POST — OpenAI streaming chat with tool-use (web search)
/api/conversations        GET/POST — list & create conversations
/api/conversations/[id]   GET/DELETE — load or delete a conversation

/api/stocks/quote         GET ?symbol= — Finnhub stock quote
/api/stocks/candles       GET ?symbol=&resolution=&from=&to= — OHLCV
/api/stocks/earnings      GET — upcoming earnings dates
/api/stocks/news          GET — company news
/api/stocks/metrics       GET — financial metrics
/api/stocks/recommendations GET — analyst ratings
/api/stocks/insider-sentiment GET — insider MSPR data

/api/crypto/quote         GET ?symbol= — crypto quote
/api/crypto/symbols       GET — supported crypto pairs

/api/market/overview      GET — aggregated quotes for dashboard
/api/ticker/[symbol]      GET — full aggregate for one asset (all above combined)

/api/news/general         GET — market-wide news
/api/calendar/earnings    GET — earnings calendar

/api/watchlist            GET/POST/DELETE — user watchlist CRUD
/api/search               GET ?q= — symbol/company search
/api/health/db            GET — database connectivity probe
```

---

## Data Flow Diagram

```
Browser
  │
  ├─── page load ──────────► Next.js App Router (RSC + Client Components)
  │                                │
  │                                ├─ getServerSideProps / Route Handlers
  │                                │       │
  │                                │       ├── lib/api/finnhub.ts ──► Finnhub REST API
  │                                │       ├── lib/services/*.ts  ──► PostgreSQL (Prisma)
  │                                │       └── OpenAI SDK          ──► OpenAI API
  │                                │
  │                                └─ React Client Components
  │
  ├─── fetch("/api/…") ─────► Route Handler ──► Finnhub / OpenAI / DB
  │
  ├─── streaming (chat) ────► /api/chat ──► OpenAI stream ──► ReadableStream ──► UI
  │
  └─── NextAuth session ────► middleware.ts ──► allow / redirect
```

---

## Component Architecture

### Design System (`app/components/ui/`)

Stateless, reusable primitives. No business logic or data fetching.

| Component | Purpose |
|-----------|---------|
| `Button` | Variant (primary/ghost/danger) + size system |
| `Input` | Accessible input with error state |
| `Badge` | Semantic status badge (stock/crypto/positive/negative) |
| `Card` | Surface container with base/elevated variants |
| `Icon` | Material Symbols icon wrapper |
| `Spinner` | Loading indicator with size variants |
| `Text` | Typography scale |
| `Tooltip` | Accessible tooltip (Radix-based or CSS) |
| `GlobalSearch` | Debounced search with keyboard navigation |
| `AnimatedPlaceholder` | Typewriter cycling placeholder |
| `InlineChart` | Sparkline for AI chat chart responses |

All primitives have Storybook stories covering loading, empty, error, and data states.

### Feature Components (`app/components/dashboard/`)

| Component | Data Source | Connected Context |
|-----------|-------------|-------------------|
| `WatchlistManager` | `/api/watchlist` | `WatchlistContext` |
| `StockCard` | `/api/stocks/quote` | — |
| `TradingChart` | `/api/stocks/candles` | — |
| `NewsFeed` | `/api/news/general` or `/api/stocks/news` | — |
| `RecommendationsWidget` | prop: `RecommendationData[]` | — |
| `InsiderSentimentBadge` | prop: `InsiderSentimentData[]` | — |
| `AssetExplorer` | static + `POPULAR_CRYPTO` constant | `WatchlistContext` |
| `AssetSelector` | prop: asset list | — |
| `ChatWidget` | `/api/chat` (streaming) | — |

### Layout (`app/components/layout/`)

| Component | Role |
|-----------|------|
| `DashboardLayout` | Wraps all authenticated pages — composes Sidebar + Header + main content |
| `Sidebar` | Desktop conversation list + navigation; collapses on mobile |
| `Header` | Search bar, user menu, mobile navigation toggle |
| `ConversationsSidebar` | Conversation list with delete confirmation |

---

## State Management

No global state library. State is co-located or lifted to React Context where sharing across the tree is needed.

| Context | Location | Consumers |
|---------|----------|-----------|
| `WatchlistContext` | `app/contexts/WatchlistContext.tsx` | `WatchlistManager`, `AssetExplorer`, `StockCard`, ticker page |
| `ConversationsContext` | `app/contexts/ConversationsContext.tsx` | `Sidebar`, `ConversationsSidebar`, `Header`, chat page |
| `SessionProvider` (NextAuth) | `app/providers.tsx` | Any component using `useSession()` |

---

## Database Schema

```
User
 ├── id, name, email, passwordHash, createdAt
 ├── Account[]         (OAuth provider links — NextAuth)
 ├── Session[]         (NextAuth sessions)
 ├── WatchlistItem[]   (symbol + category per user)
 └── Conversation[]
       └── Message[]   (role: user|assistant, text, createdAt)
```

Prisma handles migrations. The singleton client is exported from `lib/prisma.ts` to avoid connection pool exhaustion in Next.js hot-reload.

---

## Authentication

NextAuth.js v5 with `CredentialsProvider`:

1. User submits email + password to `/api/auth/[...nextauth]`
2. `lib/auth.ts` queries `userService.findByEmail()` and verifies bcrypt hash
3. On success, a JWT is issued (stored in an HTTP-only cookie)
4. `middleware.ts` calls `getToken()` on every request — redirects to `/login` if absent
5. Client uses `useSession()` (NextAuth hook) to read session data

---

## AI Chat Architecture

```
User input
  │
  ▼
/api/chat (POST)
  ├── System prompt (market analyst persona + chart JSON instructions)
  ├── Message history (last N messages)
  ▼
OpenAI GPT-4o-mini (streaming)
  ├── Tool: web_search → fetches URLs → injects results back into context
  └── Streams text tokens → ReadableStream → SSE to client
  │
  ▼
chat/page.tsx (client)
  ├── Reads stream chunk by chunk
  ├── Buffers partial chart fences (```chart … ```) — hides until complete
  ├── Renders complete chunks via ReactMarkdown + custom markdownComponents
  └── InlineChart renders JSON chart blocks as sparklines
```

---

## Testing Strategy

### Playwright E2E

- `auth.setup.ts` — runs once, saves browser storage state so tests reuse the session
- `auth.spec.ts` — login form, validation, wrong credentials, signup flow, redirect when logged in
- `dashboard.spec.ts` — layout elements, watchlist panel, global search, ticker navigation
- `chat.spec.ts` — message input, send button states, message rendering, sidebar appearance

Runs on Chromium and Firefox. CI: `retries: 2`, `workers: 1`.

### Storybook Component Tests

Every UI primitive and dashboard widget has isolated stories covering:
- Loading skeleton state
- Empty / no-data state
- Data state (positive, negative, neutral variants)
- Error state where applicable

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Next.js App Router (RSC) | Colocation of server logic; streaming-first |
| No Redux / Zustand | App state is local or context-scoped; global store would be overkill |
| Prisma over raw SQL | Type-safe queries, auto-generated client, migration tooling |
| Finnhub as market data source | Free tier with sufficient rate limits for a portfolio project |
| Streaming chat | Better UX than waiting for full response; demonstrates SSE handling |
| Storybook for component isolation | Enables visual regression review and shareable component demos |
| Playwright over Cypress | Faster, native multi-browser support, better async handling |
