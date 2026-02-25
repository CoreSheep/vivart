'use server';

import { auth } from '@clerk/nextjs/server';
import { ritaClient } from '@/lib/rita';
import prisma from '@/lib/db';
import type { VideoResolution, SourceType, OverlayElement } from '@/types';
import { compositeElements, uploadFile } from '@/lib/storage';

export interface GenerateVideoInput {
  sourceImageUrl: string;
  sourceType: SourceType;
  prompt: string;
  duration?: number;
  resolution?: VideoResolution;
  motionIntensity?: number;
  projectId?: string;
  overlayElements?: OverlayElement[];
  metadata?: Record<string, any>;
}

export interface GenerateVideoResult {
  success: boolean;
  videoId?: string;
  jobId?: string;
  error?: string;
}

/**
 * Generate video from image using Seedance 2.0
 */
export async function generateVideo(input: GenerateVideoInput): Promise<GenerateVideoResult> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    if (!input.sourceImageUrl) {
      return { success: false, error: 'Source image URL is required' };
    }

    if (!input.prompt || input.prompt.trim().length === 0) {
      return { success: false, error: 'Prompt is required' };
    }

    const duration = input.duration || 5;
    if (duration < 4 || duration > 15) {
      return { success: false, error: 'Duration must be between 4 and 15 seconds' };
    }

    // Process overlay elements if provided
    let processedImageUrl = input.sourceImageUrl;
    if (input.overlayElements && input.overlayElements.length > 0) {
      try {
        // Fetch base image
        const baseImageResponse = await fetch(input.sourceImageUrl);
        const baseImageBuffer = Buffer.from(await baseImageResponse.arrayBuffer());

        // Prepare overlay elements
        const overlays = await Promise.all(
          input.overlayElements.map(async (element) => {
            if (element.type === 'image' && element.url) {
              const response = await fetch(element.url);
              const buffer = Buffer.from(await response.arrayBuffer());

              return {
                buffer,
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
              };
            }
            return null;
          })
        );

        const validOverlays = overlays.filter(Boolean) as any[];

        // Composite elements onto base image
        if (validOverlays.length > 0) {
          const compositedBuffer = await compositeElements(baseImageBuffer, validOverlays);

          // Upload composited image
          processedImageUrl = await uploadFile(compositedBuffer, 'composited.jpg', {
            folder: `users/${userId}/composited`,
            contentType: 'image/jpeg',
            optimize: true,
          });
        }
      } catch (error) {
        console.error('Error processing overlay elements:', error);
        // Continue with original image if overlay fails
      }
    }

    // Submit job to Seedance via Rita
    const jobResponse = await ritaClient.submitJob({
      model: 'seedance-2.0',
      input: {
        image_url: processedImageUrl,
        prompt: input.prompt,
        duration,
        resolution: input.resolution || '1080p',
        motion_intensity: input.motionIntensity,
      },
    });

    // Create video record in database
    const video = await prisma.video.create({
      data: {
        userId,
        projectId: input.projectId || null,
        sourceImageUrl: input.sourceImageUrl,
        sourceType: input.sourceType,
        prompt: input.prompt,
        duration,
        resolution: input.resolution || '1080p',
        status: 'pending',
        jobId: jobResponse.jobId,
        overlayElements: input.overlayElements || null,
        metadata: input.metadata || null,
      },
    });

    return {
      success: true,
      videoId: video.id,
      jobId: jobResponse.jobId,
    };
  } catch (error) {
    console.error('Error generating video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate video',
    };
  }
}

/**
 * Cancel a video generation job
 */
export async function cancelVideoGeneration(videoId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get video record
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return { success: false, error: 'Video not found' };
    }

    if (video.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    if (video.status !== 'pending' && video.status !== 'processing') {
      return { success: false, error: 'Video cannot be canceled' };
    }

    // Cancel job if jobId exists
    if (video.jobId) {
      await ritaClient.cancelJob(video.jobId);
    }

    // Update video status
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: 'failed',
        errorMessage: 'Canceled by user',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error canceling video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel video',
    };
  }
}
