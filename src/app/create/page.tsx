'use client';

import React, { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { VideoGenerator } from '@/components/VideoGenerator';
import { ProgressTracker } from '@/components/ProgressTracker';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreatePage() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleVideoGenerated = (id: string) => {
    setVideoId(id);
  };

  const handleReset = () => {
    setImageUrl('');
    setVideoId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Create Video</h1>
          </div>
          {videoId && (
            <Button variant="outline" onClick={handleReset}>
              Start New
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {!videoId ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Image Upload */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">1. Upload Artwork</h2>
                  <p className="text-muted-foreground mb-4">
                    Upload an image or artwork that you want to animate
                  </p>
                  <ImageUploader
                    onImageUploaded={setImageUrl}
                    currentImage={imageUrl}
                  />
                </div>
              </div>

              {/* Right Column - Video Settings */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">2. Configure Video</h2>
                  <p className="text-muted-foreground mb-4">
                    Set your video parameters and generation prompt
                  </p>
                  <VideoGenerator
                    sourceImageUrl={imageUrl}
                    onVideoGenerated={handleVideoGenerated}
                  />
                </div>

                {/* Tips */}
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <h3 className="font-semibold text-sm">Tips for best results:</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Use high-quality images with clear subjects</li>
                    <li>Describe natural movements (wind, water, light)</li>
                    <li>Keep prompts simple and descriptive</li>
                    <li>Higher resolutions take longer to generate</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            // Progress Tracking
            <div className="max-w-2xl mx-auto">
              <ProgressTracker
                videoId={videoId}
                onComplete={() => {
                  // Could redirect to gallery or show success message
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
