'use client';

import React, { useEffect, useState } from 'react';
import { getUserVideos, deleteVideo } from '@/app/actions/getVideoStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Play, Trash2, Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { Video } from '@/types';
import { formatDuration } from '@/lib/utils';
import { format } from 'date-fns';

export default function GalleryPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const result = await getUserVideos();
      if (result.success && result.videos) {
        setVideos(result.videos);
      } else {
        throw new Error(result.error || 'Failed to load videos');
      }
    } catch (error) {
      console.error('Error loading videos:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load videos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    setDeletingId(id);
    try {
      const result = await deleteVideo(id);
      if (result.success) {
        setVideos(videos.filter((v) => v.id !== id));
        toast({
          title: 'Success',
          description: 'Video deleted successfully',
        });
      } else {
        throw new Error(result.error || 'Failed to delete video');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete video',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      processing: 'bg-blue-500/10 text-blue-500',
      completed: 'bg-green-500/10 text-green-500',
      failed: 'bg-red-500/10 text-red-500',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          badges[status as keyof typeof badges] || 'bg-gray-500/10 text-gray-500'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Videos</h1>
            <p className="text-sm text-muted-foreground">
              {videos.length} {videos.length === 1 ? 'video' : 'videos'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={loadVideos}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Link href="/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No videos yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first animated video from artwork
            </p>
            <Link href="/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Video
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {video.status === 'completed' && video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      poster={video.thumbnailUrl || video.sourceImageUrl}
                      className="w-full aspect-video object-cover"
                      controls
                    />
                  ) : (
                    <div className="relative w-full aspect-video bg-muted">
                      <img
                        src={video.sourceImageUrl}
                        alt="Source"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        {video.status === 'processing' || video.status === 'pending' ? (
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        ) : (
                          <p className="text-white font-medium">Failed</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-3 p-4">
                  <div className="flex items-center justify-between w-full">
                    {getStatusBadge(video.status)}
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(video.duration)}
                    </span>
                  </div>

                  <p className="text-sm line-clamp-2 w-full">{video.prompt}</p>

                  <div className="text-xs text-muted-foreground">
                    {format(new Date(video.createdAt), 'MMM d, yyyy')}
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDelete(video.id)}
                    disabled={deletingId === video.id}
                  >
                    {deletingId === video.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
