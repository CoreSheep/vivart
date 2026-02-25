# Setup Guide

Detailed instructions for setting up Vivart locally.

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Git

## Installation

```bash
git clone https://github.com/CoreSheep/vivart.git
cd vivart
npm install
```

## Service Configuration

### 1. Clerk Authentication

1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Copy API keys from dashboard
4. Enable email/password authentication

### 2. Database (Neon)

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string
3. Format: `postgresql://user:password@host/database?sslmode=require`

### 3. Cloudflare R2 Storage

1. Navigate to R2 in [Cloudflare dashboard](https://dash.cloudflare.com)
2. Create new bucket
3. Generate API tokens with "Object Read & Write" permissions
4. Enable public access for the bucket
5. Note the public URL and Account ID

### 4. Rita API (Seedance 2.0)

Contact Rita to obtain API access for Seedance 2.0 video generation.

### 5. Replicate

1. Sign up at [replicate.com](https://replicate.com)
2. Copy API token from account settings

## Environment Setup

Create `.env.local` file:

```env
DATABASE_URL="postgresql://..."
RITA_API_KEY="your_key"
REPLICATE_API_TOKEN="r8_..."
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_key"
R2_SECRET_ACCESS_KEY="your_secret"
R2_BUCKET_NAME="vivart"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Database Setup

```bash
npm run db:generate
npm run db:push
```

Optional: Open Prisma Studio to view database
```bash
npm run db:studio
```

## Configure Webhooks

### Clerk Webhook

1. Go to Clerk dashboard > Webhooks
2. Add endpoint: `http://localhost:3000/api/webhooks/clerk` (local) or your production URL
3. Select events: `user.created`, `user.updated`, `user.deleted`
4. Copy webhook secret (optional: add as `CLERK_WEBHOOK_SECRET`)

## Run Application

```bash
npm run dev
```

Open http://localhost:3000

## Verify Setup

1. Create account
2. Upload image in "Create Video"
3. Generate video
4. Check gallery for results

## Troubleshooting

**Database connection fails:**
- Verify DATABASE_URL is correct
- Check firewall rules for Neon

**Image upload fails:**
- Verify R2 credentials
- Ensure bucket is public

**Video generation fails:**
- Verify RITA_API_KEY
- Check API quota/credits

**Build errors:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

## Production Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import repository in Vercel
3. Add all environment variables (use production values)
4. Deploy

### Update Webhooks

Update Clerk webhook URL to production domain after deployment.

## Next Steps

- Customize landing page
- Add more artistic styles
- Configure monitoring
- Setup analytics
