import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // Parse webhook payload
    const payload = await req.json();

    const { job_id, status, video_url, thumbnail_url, error } = payload;

    if (!job_id) {
      return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });
    }

    // Find video by jobId
    const video = await prisma.video.findUnique({
      where: { jobId: job_id },
    });

    if (!video) {
      console.error(`Video not found for job_id: ${job_id}`);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Normalize status
    const normalizedStatus = normalizeStatus(status);

    // Update video record
    await prisma.video.update({
      where: { id: video.id },
      data: {
        status: normalizedStatus,
        videoUrl: video_url || video.videoUrl,
        thumbnailUrl: thumbnail_url || video.thumbnailUrl,
        errorMessage: error || video.errorMessage,
      },
    });

    console.log(`Video ${video.id} updated: ${normalizedStatus}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Seedance webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function normalizeStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
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
