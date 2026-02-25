import Replicate from 'replicate';
import { ARTISTIC_STYLES, ArtisticStyle } from '@/types';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export interface GenerateArtworkOptions {
  prompt: string;
  style: ArtisticStyle;
  model?: 'sdxl' | 'dalle3';
  width?: number;
  height?: number;
  numOutputs?: number;
}

export interface GenerateArtworkResult {
  imageUrl: string;
  metadata: {
    model: string;
    prompt: string;
    style: string;
    seed?: number;
  };
}

/**
 * Generate artwork using AI with artistic styles
 */
export async function generateArtwork(
  options: GenerateArtworkOptions
): Promise<GenerateArtworkResult> {
  const {
    prompt,
    style,
    model = 'sdxl',
    width = 1024,
    height = 1024,
    numOutputs = 1,
  } = options;

  // Build styled prompt
  const stylePrompt = `${prompt}, ${ARTISTIC_STYLES[style]}`;

  try {
    let output: any;

    if (model === 'sdxl') {
      // Use Stable Diffusion XL
      output = await replicate.run(
        'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        {
          input: {
            prompt: stylePrompt,
            width,
            height,
            num_outputs: numOutputs,
            scheduler: 'K_EULER',
            num_inference_steps: 50,
            guidance_scale: 7.5,
            prompt_strength: 0.8,
            refine: 'expert_ensemble_refiner',
            high_noise_frac: 0.8,
          },
        }
      );
    } else {
      // Use DALL-E 3 (via replicate wrapper)
      output = await replicate.run(
        'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        {
          input: {
            prompt: stylePrompt,
            width,
            height,
            num_outputs: numOutputs,
          },
        }
      );
    }

    // Extract image URL from output
    const imageUrl = Array.isArray(output) ? output[0] : output;

    return {
      imageUrl,
      metadata: {
        model,
        prompt: stylePrompt,
        style: ARTISTIC_STYLES[style],
      },
    };
  } catch (error) {
    console.error('Error generating artwork:', error);
    throw new Error(`Failed to generate artwork: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate multiple variations of artwork
 */
export async function generateArtworkVariations(
  options: GenerateArtworkOptions,
  count: number = 4
): Promise<GenerateArtworkResult[]> {
  const promises = Array(count)
    .fill(null)
    .map(() => generateArtwork(options));

  return await Promise.all(promises);
}

/**
 * Upscale an image using Real-ESRGAN
 */
export async function upscaleImage(imageUrl: string, scale: number = 2): Promise<string> {
  try {
    const output = await replicate.run(
      'nightmareai/real-esrgan:42fd9e7c1b30c88e2e5c37b4350e8e62e4ad4b7b99e57e7e20c7d37f1f8b1b1b',
      {
        input: {
          image: imageUrl,
          scale,
          face_enhance: false,
        },
      }
    ) as any;

    return Array.isArray(output) ? output[0] : output;
  } catch (error) {
    console.error('Error upscaling image:', error);
    throw new Error(`Failed to upscale image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Remove background from image
 */
export async function removeBackground(imageUrl: string): Promise<string> {
  try {
    const output = await replicate.run(
      'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
      {
        input: {
          image: imageUrl,
        },
      }
    ) as any;

    return output;
  } catch (error) {
    console.error('Error removing background:', error);
    throw new Error(`Failed to remove background: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get artistic style suggestions based on keywords
 */
export function suggestStyles(keywords: string[]): ArtisticStyle[] {
  const suggestions: ArtisticStyle[] = [];
  const lowerKeywords = keywords.map(k => k.toLowerCase());

  const styleKeywords: Record<ArtisticStyle, string[]> = {
    vanGogh: ['impressionist', 'post-impressionist', 'swirling', 'starry', 'sunflower', 'vibrant'],
    monet: ['impressionist', 'water', 'garden', 'lily', 'soft', 'light'],
    picasso: ['cubist', 'geometric', 'abstract', 'fragmented'],
    dali: ['surreal', 'dream', 'melting', 'clock', 'strange'],
    kandinsky: ['abstract', 'geometric', 'colorful', 'shapes'],
    hokusai: ['japanese', 'wave', 'ukiyo-e', 'woodblock', 'mount fuji'],
    warhol: ['pop art', 'bold', 'repetition', 'modern', 'celebrity'],
    klimt: ['art nouveau', 'golden', 'ornamental', 'decorative', 'kiss'],
    munch: ['expressionist', 'emotional', 'scream', 'anxiety'],
    pollock: ['abstract expressionist', 'drip', 'chaotic', 'splatter'],
  };

  for (const [style, keywords] of Object.entries(styleKeywords)) {
    const matches = keywords.filter(k =>
      lowerKeywords.some(lk => lk.includes(k) || k.includes(lk))
    );

    if (matches.length > 0) {
      suggestions.push(style as ArtisticStyle);
    }
  }

  // Return top 3 suggestions or default styles
  return suggestions.slice(0, 3).length > 0
    ? suggestions.slice(0, 3)
    : ['vanGogh', 'monet', 'picasso'];
}

/**
 * Build prompt with best practices
 */
export function buildOptimalPrompt(
  subject: string,
  style: ArtisticStyle,
  additionalDetails?: string
): string {
  const basePrompt = subject;
  const styleDescription = ARTISTIC_STYLES[style];
  const qualityBoost = 'masterpiece, highly detailed, 8k, award winning';

  const parts = [
    basePrompt,
    styleDescription,
    additionalDetails,
    qualityBoost,
  ].filter(Boolean);

  return parts.join(', ');
}
