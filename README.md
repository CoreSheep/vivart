# Vivart

Transform artwork into animated videos using AI.

Vivart is a web application that brings static artwork to life using Seedance 2.0 for video generation and Replicate for AI image creation.

## Features

- Image-to-video generation with Seedance 2.0
- AI artwork generation in multiple artistic styles
- User authentication and video gallery
- Real-time generation progress tracking

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- API keys for Clerk, Rita (Seedance), Replicate, and Cloudflare R2

### Installation

```bash
# Clone and install
git clone https://github.com/CoreSheep/vivart.git
cd vivart
npm install

# Configure environment
cp .env.example .env.local
# Add your API keys to .env.local

# Setup database
npm run db:generate
npm run db:push

# Start development server
npm run dev
```

Visit http://localhost:3000

## Environment Variables

Required variables in `.env.local`:

```env
DATABASE_URL=              # PostgreSQL connection string
RITA_API_KEY=             # Seedance 2.0 API access
REPLICATE_API_TOKEN=      # Image generation
R2_ACCOUNT_ID=            # Cloudflare R2
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_APP_URL=
```

See [SETUP.md](SETUP.md) for detailed service setup instructions.

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Prisma + PostgreSQL
- Clerk authentication
- Tailwind CSS
- Cloudflare R2 storage

## Project Structure

```
src/
├── app/              # Pages and API routes
├── components/       # React components
├── lib/              # Core services (API clients, database)
└── types/            # TypeScript definitions
```

## Development

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run lint          # Run ESLint
npm run type-check    # TypeScript check
```

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

## License

MIT License - see LICENSE file for details.
