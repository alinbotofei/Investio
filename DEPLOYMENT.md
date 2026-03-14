# Deployment (Vercel)

## Requirements

- Vercel project connected to this repository
- PostgreSQL database (Neon, Supabase, or Vercel Postgres)
- OpenAI and Finnhub API keys

## Environment Variables

Set these in Vercel for Production and Preview:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.vercel.app
OPENAI_API_KEY=...
FINNHUB_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
```

Notes:
- `OPENAI_MODEL` is optional; defaults to `gpt-4o-mini`.
- Keep `NEXTAUTH_URL` aligned with the final Vercel domain.

## Deploy Flow

1. Push to the branch connected in Vercel.
2. Vercel runs install and build (`next build`) automatically.
3. After a successful deploy, run database migrations:

```bash
npx prisma migrate deploy
```

## Post-Deploy Checks

- Login/signup works.
- `/api/health/db` responds successfully.
- `/api/chat` streams responses.
- Live quotes (stock/crypto) are returned when requested.
