# Deployment Guide for Vercel

## Prerequisites
1. Vercel account
2. PostgreSQL database (recommended: Neon, Supabase, or Vercel Postgres)
3. API keys ready

## Environment Variables Required

### Essential (Required for Production)
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=generate-using-openssl-rand-base64-32
NEXTAUTH_URL=https://your-domain.vercel.app
```

### API Keys (Optional but recommended)
```
FINNHUB_API_KEY=your_finnhub_key
OPENAI_API_KEY=your_openai_key
```

## Deployment Steps

### 1. Setup Database

**Option A: Neon (Recommended)**
1. Go to https://neon.tech
2. Create new project
3. Copy connection string:
   - `DATABASE_URL` - Pooled connection (default)

**Option B: Vercel Postgres**
1. In Vercel dashboard, go to Storage
2. Create Postgres database
3. Copy environment variables automatically

### 2. Generate NextAuth Secret
```bash
openssl rand -base64 32
```

### 3. Deploy to Vercel

**Option A: Via Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
```

**Option B: Via GitHub**
1. Push code to GitHub
2. Import repository in Vercel
3. Configure environment variables in Vercel dashboard

### 4. Setup Database Schema
After first deploy:
```bash
npx prisma generate
npx prisma migrate deploy
```

Or in Vercel, add build command:
```
npm run build && npx prisma generate
```

## Post-Deployment Checklist

- ✅ All environment variables set in Vercel
- ✅ Database connected and migrations run
- ✅ Auth working (test login/signup)
- ✅ API keys configured
- ✅ Terms page accessible at /terms-condition
- ✅ No console errors

## Development Mode Features

The app works WITHOUT database in development mode:
- Register/login will work in-memory
- Session management via JWT
- Perfect for local testing

## Troubleshooting

### Database Connection Errors
- Ensure DATABASE_URL is set correctly
- Check if database allows connections from Vercel IPs
- Verify SSL mode is compatible

### Auth Not Working
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure it starts with https:// in production

### Build Failures
- Run `npm run build` locally first
- Check all TypeScript errors are resolved
- Ensure all dependencies are in package.json

## Environment Variables Summary

```env
# Required
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=https://your-production-url.vercel.app

# Optional
FINNHUB_API_KEY=your_finnhub_api_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_API_URL=https://your-production-url.vercel.app
```

## Performance Tips

1. **Edge Functions**: Consider using Edge Runtime for API routes
2. **Image Optimization**: Use Next.js Image component
3. **Database**: Use connection pooling (already configured)
4. **Caching**: Implement Redis for session caching if needed

## Security Notes

- ✅ Passwords are hashed with bcrypt (12 rounds)
- ✅ Email validation and normalization
- ✅ SQL injection protection via Prisma
- ✅ CSRF protection via NextAuth
- ✅ Environment variables are server-side only

## Support

For issues during deployment:
1. Check Vercel deployment logs
2. Review runtime logs in Vercel dashboard
3. Test locally with `npm run build && npm start`
