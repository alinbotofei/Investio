# Vercel Environment Variables

Add these environment variables in your Vercel project settings (Settings → Environment Variables):

## Required Variables

### NEXTAUTH_SECRET
Generate a secure random string:
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

### NEXTAUTH_URL
```
https://investio-platform.vercel.app
```

### DATABASE_URL
Your PostgreSQL connection string from your database provider (Vercel Postgres, Supabase, etc.):
```
postgresql://user:password@host:5432/database?sslmode=require
```

### FINNHUB_API_KEY
Get your API key from: https://finnhub.io/register

### OPENAI_API_KEY
Get your API key from: https://platform.openai.com/api-keys

## Setup Instructions

1. Go to your Vercel project: https://vercel.com/your-username/investio-platform
2. Click on **Settings** → **Environment Variables**
3. Add each variable above with its value
4. For each variable, select all environments: **Production**, **Preview**, and **Development**
5. Click **Save**
6. Go to **Deployments** tab
7. Click on the latest deployment → **⋯** (three dots) → **Redeploy**

## Database Setup (if not already done)

1. Create a Vercel Postgres database in your project
2. Copy the `DATABASE_URL` from the database settings
3. Run migrations:
```bash
npx prisma migrate deploy
```

## Verification

After adding all variables and redeploying:
- Visit: https://investio-platform.vercel.app
- Try to sign in/sign up
- Check that market data loads correctly
