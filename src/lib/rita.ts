import axios, { AxiosInstance } from 'axios';
import type { SeedanceJobRequest, SeedanceJobResponse, SeedanceJobStatus } from '@/types';

const RITA_BASE_URL = 'https://api.rita.ai/v1';
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

class RitaClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: RITA_BASE_URL,
      headers: {
        'Authorization': `Bearer ${process.env.RITA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });
  }

  /**
   * Submit a video generation job to Seedance 2.0
   */
  async submitJob(request: SeedanceJobRequest): Promise<SeedanceJobResponse> {
    try {
      const response = await this.client.post('/seedance/generate', request);

      return {
        jobId: response.data.job_id || response.data.jobId,
        status: response.data.status,
        createdAt: response.data.created_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error submitting Seedance job:', error);
      throw new Error(this.formatError(error));
    }
  }

  /**
   * Get the status of a video generation job
   */
  async getJobStatus(jobId: string): Promise<SeedanceJobStatus> {
    try {
      const response = await this.client.get(`/seedance/jobs/${jobId}`);
      const data = response.data;

      return {
        jobId,
        status: this.normalizeStatus(data.status),
        progress: data.progress || 0,
        videoUrl: data.video_url || data.videoUrl,
        thumbnailUrl: data.thumbnail_url || data.thumbnailUrl,
        error: data.error || data.error_message,
      };
    } catch (error) {
      console.error('Error getting job status:', error);
      throw new Error(this.formatError(error));
    }
  }

  /**
   * Poll job status until completion with exponential backoff
   * Returns the final job status when completed or failed
   */
  async pollUntilComplete(
    jobId: string,
    onProgress?: (status: SeedanceJobStatus) => void,
    maxWaitTime: number = 300000 // 5 minutes default
  ): Promise<SeedanceJobStatus> {
    const startTime = Date.now();
    let backoff = INITIAL_BACKOFF;
    const maxBackoff = 30000; // Max 30 seconds between polls

    while (true) {
      // Check if we've exceeded max wait time
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Job polling timeout - exceeded maximum wait time');
      }

      const status = await this.getJobStatus(jobId);

      // Call progress callback if provided
      if (onProgress) {
        onProgress(status);
      }

      // Check if job is complete
      if (status.status === 'completed') {
        if (!status.videoUrl) {
          throw new Error('Job completed but no video URL provided');
        }
        return status;
      }

      // Check if job failed
      if (status.status === 'failed') {
        throw new Error(status.error || 'Job failed without error message');
      }

      // Wait before next poll with exponential backoff
      await this.sleep(backoff);

      // Increase backoff for next iteration (exponential)
      backoff = Math.min(backoff * 2, maxBackoff);
    }
  }

  /**
   * Cancel a running job
   */
  async cancelJob(jobId: string): Promise<void> {
    try {
      await this.client.post(`/seedance/jobs/${jobId}/cancel`);
    } catch (error) {
      console.error('Error canceling job:', error);
      throw new Error(this.formatError(error));
    }
  }

  /**
   * Retry a failed request with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = MAX_RETRIES
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
          throw error;
        }

        // Wait before retrying
        if (i < retries - 1) {
          const delay = INITIAL_BACKOFF * Math.pow(2, i);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  /**
   * Normalize status from various API responses
   */
  private normalizeStatus(status: string): SeedanceJobStatus['status'] {
    const normalized = status.toLowerCase();

    if (normalized.includes('complete') || normalized === 'success') {
      return 'completed';
    }
    if (normalized.includes('process') || normalized === 'running') {
      return 'processing';
    }
    if (normalized.includes('fail') || normalized === 'error') {
      return 'failed';
    }
    return 'pending';
  }

  /**
   * Format error messages
   */
  private formatError(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return `API Error (${error.response.status}): ${
          error.response.data?.message ||
          error.response.data?.error ||
          error.message
        }`;
      }
      if (error.request) {
        return 'Network error: No response from API';
      }
    }
    return error.message || 'Unknown error occurred';
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const ritaClient = new RitaClient();

// Export class for testing
export default RitaClient;
