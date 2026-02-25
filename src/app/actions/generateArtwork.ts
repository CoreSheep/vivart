'use server';

import { auth } from '@clerk/nextjs/server';
import { generateArtwork as generateArtworkAPI } from '@/lib/replicate';
import { uploadImageFromUrl } from '@/lib/storage';
import type { ArtisticStyle } from '@/types';

export interface GenerateArtworkInput {
  prompt: string;
  style: ArtisticStyle;
  model?: 'sdxl' | 'dalle3';
}

export interface GenerateArtworkResult {
  success: boolean;
  imageUrl?: string;
  storedUrl?: string;
  error?: string;
}

/**
 * Generate artwork using AI
 */
export async function generateArtwork(input: GenerateArtworkInput): Promise<GenerateArtworkResult> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    if (!input.prompt || input.prompt.trim().length === 0) {
      return { success: false, error: 'Prompt is required' };
    }

    if (input.prompt.length > 1000) {
      return { success: false, error: 'Prompt is too long (max 1000 characters)' };
    }

    // Generate artwork
    const result = await generateArtworkAPI({
      prompt: input.prompt,
      style: input.style,
      model: input.model || 'sdxl',
      width: 1024,
      height: 1024,
    });

    // Upload generated image to our storage
    const storedUrl = await uploadImageFromUrl(result.imageUrl, {
      folder: `users/${userId}/generated`,
      optimize: true,
    });

    return {
      success: true,
      imageUrl: result.imageUrl,
      storedUrl,
    };
  } catch (error) {
    console.error('Error generating artwork:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate artwork',
    };
  }
}
