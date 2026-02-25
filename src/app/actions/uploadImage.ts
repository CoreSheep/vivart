'use server';

import { auth } from '@clerk/nextjs/server';
import { uploadFile } from '@/lib/storage';

export interface UploadImageResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

/**
 * Upload an image file to storage
 */
export async function uploadImage(formData: FormData): Promise<UploadImageResult> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get file from form data
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'File size must be less than 10MB' };
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to storage with optimization
    const imageUrl = await uploadFile(buffer, file.name, {
      folder: `users/${userId}/images`,
      contentType: file.type,
      optimize: true,
      maxWidth: 2048,
      quality: 90,
    });

    return { success: true, imageUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}

/**
 * Upload image from URL
 */
export async function uploadImageFromUrl(url: string): Promise<UploadImageResult> {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return { success: false, error: 'Invalid URL' };
    }

    // Fetch and upload image
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: 'Failed to fetch image from URL' };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Validate it's an image
    if (!contentType.startsWith('image/')) {
      return { success: false, error: 'URL does not point to an image' };
    }

    // Upload to storage
    const imageUrl = await uploadFile(buffer, 'image.jpg', {
      folder: `users/${userId}/images`,
      contentType,
      optimize: true,
      maxWidth: 2048,
      quality: 90,
    });

    return { success: true, imageUrl };
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}
