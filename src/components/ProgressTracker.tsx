'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { getVideoStatus } from '@/app/actions/getVideoStatus';
import { useToast } from '@/hooks/use-toast';
import type { Video } from '@/types';

interface ProgressTrackerProps {
  videoId: string;
  onComplete?: (video: Video) => void;
}

export function ProgressTracker({ videoId, onComplete }: ProgressTrackerProps) {
  const [video, setVideo] = useState<Video | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const result = await getVideoStatus(videoId);

        if (result.success && result.video) {
          setVideo(result.video);

          // Stop polling if completed or failed
          if (result.video.status === 'completed' || result.video.status === 'failed') {
            setIsPolling(false);

            if (result.video.status === 'completed' && onComplete) {
              onComplete(result.video);
              toast({
                title: 'Video Ready!',
                description: 'Your video has been generated successfully',
              });
            }

            if (result.video.status === 'failed') {
              toast({
                title: 'Generation Failed',
                description: result.video.errorMessage || 'Video generation failed',
                variant: 'destructive',
              });
            }
          }
        }
      } catch (error) {
        console.error('Error polling status:', error);
      }
    };

    // Initial poll
    pollStatus();

    // Set up interval polling (every 5 seconds)
    if (isPolling) {
      intervalId = setInterval(pollStatus, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [videoId, isPolling, onComplete, toast]);

  if (!video) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (video.status) {
      case 'completed':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
    }
  };

  const getStatusText = () => {
    switch (video.status) {
      case 'pending':
        return 'Queued';
      case 'processing':
        return 'Generating video...';
      case 'completed':
        return 'Complete';
      case 'failed':
        return 'Failed';
      default:
        return video.status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Progress</CardTitle>
        <CardDescription>Video ID: {videoId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="font-medium">{getStatusText()}</p>
            <p className="text-sm text-muted-foreground">
              {video.status === 'processing' && 'This may take 1-2 minutes'}
              {video.status === 'completed' && 'Your video is ready'}
              {video.status === 'failed' && video.errorMessage}
            </p>
          </div>
        </div>

        {video.status === 'completed' && video.videoUrl && (
          <div className="space-y-4">
            <video
              src={video.videoUrl}
              controls
              className="w-full rounded-lg"
              poster={video.thumbnailUrl || undefined}
            >
              Your browser does not support the video tag.
            </video>

            <Button className="w-full" asChild>
              <a href={video.videoUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </a>
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>Resolution: {video.resolution}</p>
          <p>Duration: {video.duration}s</p>
          <p>Prompt: {video.prompt}</p>
        </div>
      </CardContent>
    </Card>
  );
}
