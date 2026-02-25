'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { uploadImage } from '@/app/actions/uploadImage';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
}

export function ImageUploader({ onImageUploaded, currentImage }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const { toast } = useToast();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadImage(formData);

        if (result.success && result.imageUrl) {
          onImageUploaded(result.imageUrl);
          toast({
            title: 'Success',
            description: 'Image uploaded successfully',
          });
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to upload image',
          variant: 'destructive',
        });
        setPreview(null);
      } finally {
        setIsUploading(false);
      }
    },
    [onImageUploaded, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const clearImage = () => {
    setPreview(null);
    onImageUploaded('');
  };

  return (
    <div className="w-full">
      {preview ? (
        <Card className="relative overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto max-h-[500px] object-contain"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={clearImage}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </Card>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          {isDragActive ? (
            <p className="text-lg font-medium">Drop the image here...</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">
                Drag & drop an image here, or click to select
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: PNG, JPG, JPEG, WebP (max 10MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
