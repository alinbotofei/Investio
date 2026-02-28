# Vercel Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Quality
- [x] No TypeScript errors
- [x] No ESLint warnings
- [x] All imports resolved
- [x] Professional code structure
- [x] Clean commit history

### ✅ Configuration Files
- [x] `package.json` - includes postinstall script
- [x] `tsconfig.json` - includes lib/** directory
- [x] `next.config.ts` - production-ready
- [x] `vercel.json` - build configuration
- [x] `.gitignore` - sensitive files excluded
- [x] `.vercelignore` - build artifacts excluded
- [x] `.env.example` - template provided

### ✅ Database & Prisma
- [x] `prisma/schema.prisma` - simplified (no directUrl)
- [x] Prisma generate in build script
- [x] Database models defined (User, Conversation, Message, etc.)
- [x] Migration-ready schema

### ✅ Authentication
- [x] NextAuth configured
- [x] JWT strategy enabled
- [x] Credentials provider setup
- [x] Session management working
- [x] Protected routes configured
- [x] Sign out functionality

### ✅ API Routes
- [x] `/api/auth/*` - authentication endpoints
- [x] `/api/health/db` - database health check
- [x] Error handling implemented
- [x] Development mode fallbacks

### ✅ UI & UX
- [x] Professional login page
- [x] Modern signup page
- [x] Terms & Conditions page
- [x] Responsive design
- [x] Loading states
- [x] Error states

## Deployment Steps

### 1. Local Verification
```bash
# Stop development server first
# Run production build test (optional - will fail due to trace lock)
npm run build

# Verify no errors in VS Code
# Check all imports resolve
```

### 2. GitHub Preparation
```bash
# Ensure feature branch is up to date
git status

# Switch to main and merge
git checkout main
git merge feature/auth-cleanup

# Push to GitHub
git push origin main
```

### 3. Vercel Dashboard Setup

**A. Create New Project**
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select repository: `Investio`

**B. Configure Build Settings**
- Framework Preset: **Next.js** (auto-detected)
- Root Directory: `./` (default)
- Build Command: `npm run build` (uses package.json script)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install` (auto-detected)

**C. Environment Variables** (CRITICAL)

Add these in Vercel dashboard under "Environment Variables":

**Required:**
```
DATABASE_URL=postgresql://[user]:[password]@[host]/[db]?sslmode=require
NEXTAUTH_SECRET=[generate-new-with-openssl]
NEXTAUTH_URL=https://your-project.vercel.app
```

**Optional (but recommended):**
```
FINNHUB_API_KEY=your_finnhub_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_API_URL=https://your-project.vercel.app
```

**Generate NEXTAUTH_SECRET:**
```bash
# On Windows PowerShell:
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))

# On Linux/Mac:
openssl rand -base64 32
```

**D. Database Setup (Neon)**
1. Go to https://console.neon.tech
2. Create new project: `investio-production`
3. Copy connection string (pooled)
4. Paste as `DATABASE_URL` in Vercel
5. Run migrations after first deploy (see below)

### 4. Deploy
1. Click "Deploy" button
2. Wait for build to complete (~2-3 minutes)
3. Vercel will provide deployment URL

### 5. Post-Deployment

**A. Run Database Migrations**

Option 1 - From local machine:
```bash
# Set DATABASE_URL temporarily
$env:DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Or if no migrations exist, push schema
npx prisma db push
```

Option 2 - Vercel CLI:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

**B. Test Application**
1. Visit deployment URL
2. Test registration flow:
   - Go to `/auth/signup`
   - Create test account
   - Verify redirect to dashboard
3. Test login flow:
   - Go to `/login`
   - Login with test account
   - Verify session works
4. Test sign out:
   - Click user menu
   - Click sign out
   - Verify redirect to login
5. Test database health:
   - Visit `/api/health/db`
   - Should show `"status": "connected"`

**C. Update Environment Variables**
- Update `NEXTAUTH_URL` to match actual Vercel URL
- Redeploy if needed for changes to take effect

## Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify all environment variables set
- Ensure `DATABASE_URL` is correct (use pooled connection)

### Database Connection Errors
- Verify DATABASE_URL format
- Check Neon database is active
- Ensure `?sslmode=require` in connection string
- Verify Neon allows connections from Vercel IPs

### Auth Not Working
- Verify `NEXTAUTH_SECRET` is set and matches format
- Check `NEXTAUTH_URL` matches deployment domain
- Must use `https://` in production
- Clear browser cookies and retry

### Page Not Found Errors
- Check file structure matches App Router conventions
- Verify all page.tsx files are properly named
- Check middleware.ts config

## Production Monitoring

### Health Checks
- `/api/health/db` - Database connectivity
- Vercel Analytics - Performance metrics
- Vercel Logs - Runtime errors

### Performance
- Enable Vercel Analytics in dashboard
- Monitor Core Web Vitals
- Check function execution times

## Rollback Plan

If deployment fails:
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel will auto-deploy previous version
```

## Success Criteria

- ✅ Build completes without errors
- ✅ Homepage loads and redirects to /login
- ✅ User can register new account
- ✅ User can login successfully
- ✅ User can sign out
- ✅ Database health check returns success
- ✅ All protected routes require authentication
- ✅ No console errors in browser
- ✅ Responsive design works on mobile

## Post-Launch

1. **Custom Domain** (optional)
   - Add custom domain in Vercel dashboard
   - Update DNS records
   - Update NEXTAUTH_URL environment variable

2. **Monitoring**
   - Enable Vercel Analytics
   - Set up error tracking
   - Monitor database performance in Neon

3. **Documentation**
   - Update README with live URL
   - Document any production-specific setup
   - Create user guide if needed

## Security Notes

- Never commit `.env.local` to git (already in .gitignore)
- Rotate NEXTAUTH_SECRET periodically
- Use strong database passwords
- Enable Vercel's security headers
- Keep dependencies updated

## Environment Variables Reference

### Required for Production
| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| NEXTAUTH_SECRET | Secret for JWT encryption | Generated 32+ char string |
| NEXTAUTH_URL | Your production URL | `https://investio.vercel.app` |

### Optional
| Variable | Description | Example |
|----------|-------------|---------|
| FINNHUB_API_KEY | Stock market data | `your_key` |
| OPENAI_API_KEY | AI chat functionality | `sk-proj-...` |
| NEXT_PUBLIC_API_URL | Public API endpoint | `https://investio.vercel.app` |

---

**Status:** Ready for deployment ✅
**Last Updated:** February 28, 2026
**Branch:** feature/auth-cleanup → main
