# Deployment

## Prerequisites

- Vercel account
- PostgreSQL database (Neon, Supabase, or Vercel Postgres)
- API keys

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<generate with openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.vercel.app
FINNHUB_API_KEY=your_key
OPENAI_API_KEY=your_key
```

## Steps

1. **Database Setup**
   - Create PostgreSQL database
   - Copy connection string to `DATABASE_URL`

2. **Deploy**
   ```bash
   vercel
   ```

3. **Configure Environment Variables**
   - Add all variables in Vercel dashboard
   - Apply to Production, Preview, and Development

4. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

## Verification

- Test authentication
- Verify API integrations
- Check database connectivity
