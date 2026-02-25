import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Palette, Video, Sparkles, Upload, Zap } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Vivart</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/gallery">
                <Button variant="ghost">My Videos</Button>
              </Link>
              <Link href="/create">
                <Button>Create Video</Button>
              </Link>
              <UserButton />
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm mb-4">
              <Sparkles className="mr-2 h-4 w-4" />
              Powered by Seedance 2.0
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Transform Artwork into
              <span className="block text-primary mt-2">Animated Masterpieces</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Bring classic paintings and artwork to life with AI-powered video generation.
              Watch as Van Gogh&apos;s sunflowers sway in the breeze or Monet&apos;s water lilies ripple gently.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <SignedOut>
                <Link href="/sign-up">
                  <Button size="lg" className="text-lg px-8">
                    <Wand2 className="mr-2 h-5 w-5" />
                    Start Creating Free
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/create">
                  <Button size="lg" className="text-lg px-8">
                    <Wand2 className="mr-2 h-5 w-5" />
                    Create Your First Video
                  </Button>
                </Link>
              </SignedIn>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Create
            </h2>
            <p className="text-xl text-muted-foreground">
              Powerful features for bringing art to life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Upload className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Upload Any Artwork</CardTitle>
                <CardDescription>
                  Upload your own artwork or use famous paintings to create stunning animated videos
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Palette className="h-12 w-12 text-primary mb-2" />
                <CardTitle>AI-Generated Art</CardTitle>
                <CardDescription>
                  Generate original artwork in the style of Van Gogh, Monet, Picasso and more with AI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Video className="h-12 w-12 text-primary mb-2" />
                <CardTitle>High-Quality Videos</CardTitle>
                <CardDescription>
                  Generate videos up to 2K resolution with customizable duration and motion intensity
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Wand2 className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Custom Prompts</CardTitle>
                <CardDescription>
                  Describe the animation you want - gentle wind, flowing water, or dramatic lighting effects
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Fast Generation</CardTitle>
                <CardDescription>
                  Powered by Seedance 2.0, your videos are ready in just 1-2 minutes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-12 w-12 text-primary mb-2" />
                <CardTitle>Gallery Management</CardTitle>
                <CardDescription>
                  Organize and manage all your created videos in your personal gallery
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Three simple steps to create your animated masterpiece
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Artwork</h3>
              <p className="text-muted-foreground">
                Upload your favorite painting or generate one with AI in various artistic styles
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Describe Motion</h3>
              <p className="text-muted-foreground">
                Write a prompt describing how you want the artwork to animate and come alive
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Generate & Share</h3>
              <p className="text-muted-foreground">
                Watch your video generate in minutes and share your animated artwork with the world
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Bring Art to Life?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join creators transforming static artwork into mesmerizing animations
          </p>
          <SignedOut>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started for Free
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/create">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Create Your Video Now
              </Button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 Vivart. Powered by Seedance 2.0, Replicate, and Next.js 15.</p>
        </div>
      </footer>
    </div>
  );
}
