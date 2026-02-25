import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { nanoid } from 'nanoid';

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

// Create S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface UploadOptions {
  folder?: string;
  contentType?: string;
  optimize?: boolean;
  maxWidth?: number;
  quality?: number;
}

/**
 * Upload a file to R2 storage
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  options: UploadOptions = {}
): Promise<string> {
  const {
    folder = 'uploads',
    contentType = 'application/octet-stream',
    optimize = false,
    maxWidth = 2048,
    quality = 90,
  } = options;

  // Optimize image if requested
  let processedBuffer = buffer;
  if (optimize && contentType.startsWith('image/')) {
    processedBuffer = await optimizeImage(buffer, maxWidth, quality);
  }

  // Generate unique filename
  const ext = filename.split('.').pop();
  const key = `${folder}/${nanoid()}.${ext}`;

  // Upload to R2
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: processedBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return public URL
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Upload image from URL
 */
export async function uploadImageFromUrl(url: string, options: UploadOptions = {}): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.split('/')[1] || 'jpg';

    return await uploadFile(buffer, `image.${ext}`, {
      ...options,
      contentType,
    });
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw error;
  }
}

/**
 * Generate a signed URL for private files (valid for 1 hour by default)
 */
export async function getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from R2
 */
export async function deleteFile(url: string): Promise<void> {
  try {
    // Extract key from URL
    const key = url.replace(`${R2_PUBLIC_URL}/`, '');

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Optimize image with Sharp
 */
export async function optimizeImage(
  buffer: Buffer,
  maxWidth: number = 2048,
  quality: number = 90
): Promise<Buffer> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Resize if larger than maxWidth
    if (metadata.width && metadata.width > maxWidth) {
      image.resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      });
    }

    // Convert to optimized format
    if (metadata.format === 'png') {
      return await image.png({ quality, compressionLevel: 9 }).toBuffer();
    } else {
      return await image.jpeg({ quality, mozjpeg: true }).toBuffer();
    }
  } catch (error) {
    console.error('Error optimizing image:', error);
    // Return original buffer if optimization fails
    return buffer;
  }
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(
  buffer: Buffer,
  width: number = 400,
  height: number = 300
): Promise<Buffer> {
  return await sharp(buffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 80 })
    .toBuffer();
}

/**
 * Composite overlay elements onto base image
 */
export async function compositeElements(
  baseImageBuffer: Buffer,
  elements: Array<{
    buffer: Buffer;
    left: number;
    top: number;
    width?: number;
    height?: number;
  }>
): Promise<Buffer> {
  try {
    let image = sharp(baseImageBuffer);
    const metadata = await image.metadata();
    const baseWidth = metadata.width!;
    const baseHeight = metadata.height!;

    // Prepare composite operations
    const composites = await Promise.all(
      elements.map(async (element) => {
        // Resize element if dimensions provided
        let elementBuffer = element.buffer;
        if (element.width && element.height) {
          elementBuffer = await sharp(element.buffer)
            .resize(element.width, element.height, { fit: 'cover' })
            .toBuffer();
        }

        return {
          input: elementBuffer,
          left: Math.round((element.left / 100) * baseWidth),
          top: Math.round((element.top / 100) * baseHeight),
        };
      })
    );

    // Apply all composites
    if (composites.length > 0) {
      image = image.composite(composites);
    }

    return await image.toBuffer();
  } catch (error) {
    console.error('Error compositing elements:', error);
    throw error;
  }
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
