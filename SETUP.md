# Vivart Setup Guide

This guide will help you set up Vivart on your local machine step by step.

## Prerequisites

Before you begin, make sure you have:

- Node.js 20+ and npm 10+
- A PostgreSQL database (local or cloud)
- Git installed on your machine

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/vivart.git
cd vivart

# Install dependencies
npm install
```

## Step 2: Set Up External Services

### 2.1 Clerk Authentication

1. Go to [clerk.com](https://clerk.com/) and sign up
2. Create a new application
3. Copy your publishable and secret keys
4. In Clerk dashboard:
   - Enable email/password authentication
   - Set up your sign-in/sign-up URLs

### 2.2 Database (Neon - Recommended)

1. Go to [neon.tech](https://neon.tech/) and sign up
2. Create a new project
3. Copy the connection string
4. The connection string format: `postgresql://user:password@host/database?sslmode=require`

### 2.3 Cloudflare R2 Storage

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to R2
3. Create a new bucket (e.g., "vivart")
4. Generate API tokens:
   - Go to R2 > Manage R2 API Tokens
   - Create API token with "Object Read & Write" permissions
5. Note your Account ID from the R2 overview page
6. Make bucket public:
   - Go to bucket settings
   - Enable public access
   - Note the public URL (format: `https://pub-xxxxx.r2.dev`)

### 2.4 Rita API (Seedance 2.0)

1. Contact Rita or visit their website to get API access
2. Once approved, you'll receive an API key
3. Save this key for the environment variables

### 2.5 Replicate API

1. Go to [replicate.com](https://replicate.com/) and sign up
2. Navigate to your account settings
3. Copy your API token

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all the values:

```env
# Database (from Neon)
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/vivart?sslmode=require"

# Redis (optional - skip for MVP)
# REDIS_URL="redis://localhost:6379"

# AI Services
RITA_API_KEY="your_rita_api_key_here"
REPLICATE_API_TOKEN="r8_your_replicate_token_here"

# Storage (from Cloudflare)
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET_NAME="vivart"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"

# Authentication (from Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_SECRET_KEY="sk_test_xxxxx"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Step 4: Set Up Database

Run these commands to set up your database:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view your database
npm run db:studio
```

## Step 5: Configure Clerk Webhooks

1. In your Clerk dashboard, go to Webhooks
2. Add a new endpoint:
   - URL: `http://localhost:3000/api/webhooks/clerk` (for local dev)
   - For production: `https://yourdomain.com/api/webhooks/clerk`
3. Select these events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the webhook secret (you can add this as `CLERK_WEBHOOK_SECRET` in `.env.local`)

## Step 6: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 7: Test the Application

1. **Sign Up**: Create a new account
2. **Upload Image**: Go to "Create Video" and upload an artwork
3. **Generate Video**:
   - Add a prompt like "gentle wind blowing through the scene"
   - Click "Generate Video"
   - Wait 1-2 minutes for the video to generate
4. **View Gallery**: Check your generated videos in "My Videos"

## Troubleshooting

### Database Connection Issues

- Make sure your DATABASE_URL is correct
- Check if your database is accessible (firewall rules)
- For Neon, ensure you have the `?sslmode=require` parameter

### Image Upload Fails

- Verify your R2 credentials are correct
- Make sure the bucket exists and is public
- Check R2 CORS settings if needed

### Video Generation Doesn't Start

- Verify your RITA_API_KEY is valid
- Check the console for error messages
- Make sure you have credits/quota with Rita

### Clerk Authentication Not Working

- Verify both publishable and secret keys are correct
- Make sure sign-in/sign-up URLs match your configuration
- Check Clerk dashboard for any error logs

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Try building again
npm run build
```

## Optional: Production Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com/) and import your repository
3. Add all environment variables (use production values)
4. Deploy!

### Update Webhooks for Production

Don't forget to update your Clerk webhook URL to your production domain!

## Need Help?

- Check the [main README](README.md) for more details
- Open an issue on GitHub
- Check the [Next.js documentation](https://nextjs.org/docs)

## Next Steps

- Customize the landing page
- Add more artistic styles
- Implement the element overlay feature
- Add video sharing functionality
- Set up monitoring and analytics

Happy creating! 🎨✨
