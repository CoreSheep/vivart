'use server';

import { auth } from '@clerk/nextjs/server';
import { ritaClient } from '@/lib/rita';
import prisma from '@/lib/db';
import type { Video } from '@/types';

export interface VideoStatusResult {
  success: boolean;
  video?: Video;
  error?: string;
}

/**
 * Get video status and update database
 */
export async function getVideoStatus(videoId: string): Promise<VideoStatusResult> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get video from database
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return { success: false, error: 'Video not found' };
    }

    if (video.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // If video is already completed or failed, return current status
    if (video.status === 'completed' || video.status === 'failed') {
      return {
        success: true,
        video: video as unknown as Video,
      };
    }

    // Check job status with Rita
    if (video.jobId) {
      try {
        const jobStatus = await ritaClient.getJobStatus(video.jobId);

        // Update video record based on job status
        const updatedVideo = await prisma.video.update({
          where: { id: videoId },
          data: {
            status: jobStatus.status,
            videoUrl: jobStatus.videoUrl || video.videoUrl,
            thumbnailUrl: jobStatus.thumbnailUrl || video.thumbnailUrl,
            errorMessage: jobStatus.error || video.errorMessage,
          },
        });

        return {
          success: true,
          video: updatedVideo as unknown as Video,
        };
      } catch (error) {
        console.error('Error checking job status:', error);

        // Update to failed if Rita API fails
        const updatedVideo = await prisma.video.update({
          where: { id: videoId },
          data: {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Failed to check job status',
          },
        });

        return {
          success: true,
          video: updatedVideo as unknown as Video,
        };
      }
    }

    return {
      success: true,
      video: video as unknown as Video,
    };
  } catch (error) {
    console.error('Error getting video status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get video status',
    };
  }
}

/**
 * Get all videos for current user
 */
export async function getUserVideos(): Promise<{ success: boolean; videos?: Video[]; error?: string }> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get all videos for user
    const videos = await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      videos: videos as unknown as Video[],
    };
  } catch (error) {
    console.error('Error getting user videos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get videos',
    };
  }
}

/**
 * Delete a video
 */
export async function deleteVideo(videoId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get video
    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return { success: false, error: 'Video not found' };
    }

    if (video.userId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Cancel job if still processing
    if (video.jobId && (video.status === 'pending' || video.status === 'processing')) {
      try {
        await ritaClient.cancelJob(video.jobId);
      } catch (error) {
        console.error('Error canceling job:', error);
        // Continue with deletion even if cancel fails
      }
    }

    // Delete video from database
    await prisma.video.delete({
      where: { id: videoId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete video',
    };
  }
}
