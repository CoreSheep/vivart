'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2 } from 'lucide-react';
import { generateVideo } from '@/app/actions/generateVideo';
import { useToast } from '@/hooks/use-toast';
import type { VideoResolution } from '@/types';

interface VideoGeneratorProps {
  sourceImageUrl: string;
  onVideoGenerated: (videoId: string) => void;
}

export function VideoGenerator({ sourceImageUrl, onVideoGenerated }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState<VideoResolution>('1080p');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!sourceImageUrl) {
      toast({
        title: 'Error',
        description: 'Please upload an image first',
        variant: 'destructive',
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateVideo({
        sourceImageUrl,
        sourceType: 'upload',
        prompt,
        duration,
        resolution,
      });

      if (result.success && result.videoId) {
        toast({
          title: 'Success',
          description: 'Video generation started! This may take a few minutes.',
        });
        onVideoGenerated(result.videoId);
      } else {
        throw new Error(result.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate video',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Settings</CardTitle>
        <CardDescription>
          Configure your video generation parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Input
            id="prompt"
            placeholder="Describe the animation you want (e.g., gentle wind blowing through the scene)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
          <p className="text-xs text-muted-foreground">
            Describe the motion and animation style you want to see
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Select
              value={duration.toString()}
              onValueChange={(value) => setDuration(parseInt(value))}
              disabled={isGenerating}
            >
              <SelectTrigger id="duration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 seconds</SelectItem>
                <SelectItem value="5">5 seconds</SelectItem>
                <SelectItem value="7">7 seconds</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="15">15 seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Select
              value={resolution}
              onValueChange={(value) => setResolution(value as VideoResolution)}
              disabled={isGenerating}
            >
              <SelectTrigger id="resolution">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">720p (HD)</SelectItem>
                <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                <SelectItem value="2k">2K (2560x1440)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={isGenerating || !sourceImageUrl || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Video
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
