# Vivart - Artistic Video Generation Platform

> Transform classic artwork into mesmerizing animated videos with AI

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Vivart is a cutting-edge web application that brings static artwork to life using AI-powered video generation. Upload famous paintings or generate original artwork, then watch as they animate with natural movements like gentle breezes, flowing water, and dynamic lighting.

## ✨ Features

- **🎬 Image-to-Video Generation**: Transform any image into an animated video using Seedance 2.0
- **🎨 AI Artwork Generation**: Create original artwork in the style of Van Gogh, Monet, Picasso, and more
- **📤 Easy Upload**: Drag-and-drop interface for uploading artwork
- **🎯 Custom Prompts**: Describe the animation style you want with natural language
- **⚙️ Flexible Settings**: Choose resolution (720p-2K) and duration (4-15 seconds)
- **📁 Video Gallery**: Organize and manage all your created videos
- **👤 User Authentication**: Secure sign-in with Clerk
- **⚡ Real-time Updates**: Live progress tracking during video generation

## 🏗️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

### Backend
- **API**: Next.js Server Actions + API Routes
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **File Storage**: [Cloudflare R2](https://www.cloudflare.com/products/r2/)

### AI Services
- **Video Generation**: [Seedance 2.0](https://www.seedance.ai/) via Rita API
- **Image Generation**: [Replicate](https://replicate.com/) (SDXL, DALL-E 3)
- **Image Processing**: [Sharp](https://sharp.pixelplumbing.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- PostgreSQL 16+ (or use [Neon](https://neon.tech/) for serverless)
- Redis (optional, for job queue)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/vivart.git
cd vivart
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy the example environment file and fill in your API keys:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/vivart"

# Redis (Upstash or local)
REDIS_URL="redis://localhost:6379"

# AI Services
RITA_API_KEY=""              # Rita API for Seedance 2.0
REPLICATE_API_TOKEN=""       # For AI image generation

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="vivart"
R2_PUBLIC_URL=""

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Getting API Keys

- **Clerk**: Sign up at [clerk.com](https://clerk.com/) and create a new application
- **Rita API**: Contact Rita for Seedance 2.0 API access
- **Replicate**: Sign up at [replicate.com](https://replicate.com/) and get your API token
- **Cloudflare R2**: Create an R2 bucket in your [Cloudflare dashboard](https://dash.cloudflare.com/)

4. **Set up the database**

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### Creating Your First Video

1. **Sign Up/Sign In**: Create an account or sign in with Clerk authentication
2. **Navigate to Create**: Click "Create Video" in the navigation
3. **Upload Artwork**: Drag and drop an image or click to select
4. **Configure Settings**:
   - Write a prompt describing the animation (e.g., "gentle wind blowing through the trees")
   - Choose duration (4-15 seconds)
   - Select resolution (720p, 1080p, or 2K)
5. **Generate**: Click "Generate Video" and wait 1-2 minutes
6. **View & Download**: Watch your video in the gallery or download it

### Example Prompts

- "Gentle breeze making the flowers sway softly"
- "Water rippling across the surface of a pond"
- "Sunlight slowly moving across the scene"
- "Stars twinkling in the night sky"
- "Leaves rustling in the wind"

## 🏗️ Project Structure

```
vivart/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── actions/           # Server Actions
│   │   │   ├── uploadImage.ts
│   │   │   ├── generateVideo.ts
│   │   │   ├── generateArtwork.ts
│   │   │   └── getVideoStatus.ts
│   │   ├── api/               # API Routes
│   │   │   └── webhooks/
│   │   │       ├── clerk/
│   │   │       └── seedance/
│   │   ├── create/            # Video creation page
│   │   ├── gallery/           # Video gallery page
│   │   ├── sign-in/           # Auth pages
│   │   ├── sign-up/
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── ImageUploader.tsx
│   │   ├── VideoGenerator.tsx
│   │   └── ProgressTracker.tsx
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   ├── rita.ts            # Seedance API client
│   │   ├── replicate.ts       # Image generation
│   │   ├── storage.ts         # R2 storage
│   │   └── utils.ts           # Utilities
│   └── types/
│       └── index.ts           # TypeScript types
├── .env.example
├── next.config.ts
├── package.json
└── README.md
```

## 🎨 Artistic Styles

When generating artwork with AI, choose from these famous artistic styles:

- **Van Gogh**: Post-impressionist with swirling brushstrokes
- **Monet**: Impressionist with soft colors and water lilies
- **Picasso**: Cubist with geometric shapes
- **Dali**: Surrealist with dreamlike, melting objects
- **Kandinsky**: Abstract with colorful geometric forms
- **Hokusai**: Japanese ukiyo-e, the great wave
- **Warhol**: Pop art with bold colors and repetition
- **Klimt**: Art nouveau with golden patterns
- **Munch**: Expressionist with emotional intensity
- **Pollock**: Abstract expressionist drip painting

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**: Push your code to a GitHub repository

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com/)
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**: Add all environment variables from `.env.example`

4. **Deploy**: Vercel will automatically build and deploy your app

### Database Setup (Neon)

1. Create a new project at [neon.tech](https://neon.tech/)
2. Copy the connection string to `DATABASE_URL`
3. Run `npm run db:push` to create tables

### Storage Setup (Cloudflare R2)

1. Create an R2 bucket in Cloudflare dashboard
2. Generate API tokens
3. Make the bucket public or use signed URLs

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

### Code Quality

The project uses:
- **ESLint**: For code linting
- **TypeScript**: For type safety
- **Prettier**: For code formatting (recommended)

## 📝 API Documentation

### Server Actions

#### `uploadImage(formData: FormData)`
Uploads an image file to R2 storage and returns the public URL.

#### `generateVideo(input: GenerateVideoInput)`
Submits a video generation job to Seedance 2.0 via Rita API.

#### `getVideoStatus(videoId: string)`
Polls the status of a video generation job and updates the database.

#### `generateArtwork(input: GenerateArtworkInput)`
Generates artwork using Replicate's SDXL or DALL-E 3 models.

### API Routes

#### `POST /api/webhooks/clerk`
Webhook for syncing Clerk users with the database.

#### `POST /api/webhooks/seedance`
Webhook for receiving video generation completion notifications.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ByteDance** for developing Seedance 2.0
- **Rita** for providing API access to Seedance 2.0
- **Replicate** for AI image generation infrastructure
- **Clerk** for authentication services
- **shadcn/ui** for beautiful UI components
- **Vercel** for hosting and deployment

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Next.js 15, React 19, and cutting-edge AI technology**
