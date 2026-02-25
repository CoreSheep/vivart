// Video generation types
export type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type VideoResolution = '720p' | '1080p' | '2k';
export type SourceType = 'upload' | 'generated';

// Element overlay types
export interface OverlayElement {
  id: string;
  type: 'image' | 'text';
  url?: string;
  text?: string;
  position: {
    x: number; // Percentage (0-100)
    y: number; // Percentage (0-100)
  };
  size: {
    width: number; // Percentage
    height: number; // Percentage
  };
  rotation?: number; // Degrees
  opacity?: number; // 0-1
}

// Rita API types
export interface SeedanceJobRequest {
  model: 'seedance-2.0';
  input: {
    image_url: string;
    prompt: string;
    duration: number; // 4-15 seconds
    resolution: VideoResolution;
    motion_intensity?: number; // 0-1
  };
}

export interface SeedanceJobResponse {
  jobId: string;
  status: string;
  createdAt: string;
}

export interface SeedanceJobStatus {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

// Replicate types
export interface ArtworkGenerationRequest {
  prompt: string;
  style: string;
  model: 'sdxl' | 'dalle3';
}

export interface ArtworkGenerationResponse {
  imageUrl: string;
  metadata: {
    model: string;
    prompt: string;
    style: string;
  };
}

// Database types (matching Prisma schema)
export interface Video {
  id: string;
  userId: string;
  projectId: string | null;
  sourceImageUrl: string;
  sourceType: SourceType;
  prompt: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number;
  resolution: VideoResolution;
  status: VideoStatus;
  jobId: string | null;
  errorMessage: string | null;
  overlayElements: OverlayElement[] | null;
  metadata: Record<string, any> | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Artistic styles
export const ARTISTIC_STYLES = {
  vanGogh: 'in the style of Vincent van Gogh, post-impressionist, swirling brushstrokes, vibrant colors',
  monet: 'in the style of Claude Monet, impressionist, soft colors, water lilies, light reflections',
  picasso: 'in the style of Pablo Picasso, cubist, geometric shapes, fragmented forms',
  dali: 'in the style of Salvador Dali, surrealist, dreamlike, melting objects',
  kandinsky: 'in the style of Wassily Kandinsky, abstract, colorful shapes, geometric forms',
  hokusai: 'in the style of Hokusai, Japanese ukiyo-e, the great wave, woodblock print',
  warhol: 'in the style of Andy Warhol, pop art, bold colors, repetition',
  klimt: 'in the style of Gustav Klimt, art nouveau, golden patterns, ornamental',
  munch: 'in the style of Edvard Munch, expressionist, emotional, bold colors',
  pollock: 'in the style of Jackson Pollock, abstract expressionist, drip painting, chaotic',
} as const;

export type ArtisticStyle = keyof typeof ARTISTIC_STYLES;
