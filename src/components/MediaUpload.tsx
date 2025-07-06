import React, { useState, useCallback } from 'react';
import { Upload, X, FileImage, Video, AlertCircle, Sparkles } from 'lucide-react';
import { Photo, VideoClip } from '../types';

interface MediaUploadProps {
  onMediaUploaded: (photos: Photo[], videos: VideoClip[]) => void;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onMediaUploaded }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<VideoClip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeMedia = async (file: File): Promise<any> => {
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isVideo = file.type.startsWith('video/');
    
    // Mock analysis results
    const mockAnalysis = {
      mood: ['happy', 'peaceful', 'excited', 'nostalgic'][Math.floor(Math.random() * 4)],
      environment: ['outdoor', 'indoor', 'nature', 'urban'][Math.floor(Math.random() * 4)],
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      objects: isVideo ? ['people', 'movement', 'landscape'] : ['faces', 'nature', 'architecture'],
      faces: Math.floor(Math.random() * 5),
    };
    
    return mockAnalysis;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    setAnalyzing(true);
    setError(null);
    
    const newPhotos: Photo[] = [];
    const newVideos: VideoClip[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError(`${file.name} is not a valid image or video file`);
        continue;
      }
      
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError(`${file.name} is too large. Maximum size is 100MB`);
        continue;
      }
      
      const url = URL.createObjectURL(file);
      const analysis = await analyzeMedia(file);
      
      if (file.type.startsWith('image/')) {
        const photo: Photo = {
          id: crypto.randomUUID(),
          file,
          url,
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
          metadata: {
            mood: analysis.mood,
            environment: analysis.environment,
            colors: analysis.colors,
            objects: analysis.objects,
            faces: analysis.faces,
          },
        };
        newPhotos.push(photo);
      } else if (file.type.startsWith('video/')) {
        // Get video duration
        const video = document.createElement('video');
        video.src = url;
        
        const duration = await new Promise<number>((resolve) => {
          video.onloadedmetadata = () => resolve(video.duration);
        });
        
        // Generate thumbnail
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        video.currentTime = duration / 2; // Middle frame
        
        const thumbnail = await new Promise<string>((resolve) => {
          video.onseeked = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx?.drawImage(video, 0, 0);
            resolve(canvas.toDataURL());
          };
        });
        
        const videoClip: VideoClip = {
          id: crypto.randomUUID(),
          file,
          url,
          name: file.name,
          size: file.size,
          duration,
          uploadedAt: new Date(),
          thumbnail,
          metadata: {
            mood: analysis.mood,
            environment: analysis.environment,
            highlights: [
              { timestamp: duration * 0.2, description: 'Opening moment' },
              { timestamp: duration * 0.5, description: 'Key highlight' },
              { timestamp: duration * 0.8, description: 'Closing scene' },
            ],
          },
        };
        newVideos.push(videoClip);
      }
    }
    
    setUploadedPhotos(prev => [...prev, ...newPhotos]);
    setUploadedVideos(prev => [...prev, ...newVideos]);
    setUploading(false);
    setAnalyzing(false);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removePhoto = (photoId: string) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const removeVideo = (videoId: string) => {
    setUploadedVideos(prev => prev.filter(video => video.id !== videoId));
  };

  const handleContinue = () => {
    if (uploadedPhotos.length > 0 || uploadedVideos.length > 0) {
      onMediaUploaded(uploadedPhotos, uploadedVideos);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Upload Your Memories</h2>
        <p className="text-white/70">Upload photos and videos to create AI-powered memory stories</p>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 mb-8 transition-all duration-300 ${
          dragActive
            ? 'border-purple-400 bg-purple-500/20 scale-105'
            : 'border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {dragActive ? 'Drop your media here' : 'Choose photos and videos to upload'}
          </h3>
          <p className="text-white/70 mb-4">
            Support for JPG, PNG, WebP, GIF, MP4, MOV, and AVI formats. Maximum 100MB per file.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all">
            Select Files
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {(uploading || analyzing) && (
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
            <span className="text-white">
              {analyzing ? 'Analyzing media with AI...' : 'Processing files...'}
            </span>
          </div>
        </div>
      )}

      {/* Uploaded Media Grid */}
      {(uploadedPhotos.length > 0 || uploadedVideos.length > 0) && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Uploaded Media ({uploadedPhotos.length + uploadedVideos.length})
            </h3>
            <button
              onClick={handleContinue}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              Continue to Gallery
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Photos */}
            {uploadedPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="aspect-square bg-white/10 rounded-lg overflow-hidden">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                
                <div className="absolute top-2 left-2">
                  <FileImage className="w-4 h-4 text-white bg-black/50 rounded p-0.5" />
                </div>
                
                {photo.metadata && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/70 rounded px-2 py-1">
                      <p className="text-white text-xs capitalize">{photo.metadata.mood}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-2">
                  <p className="text-white/90 text-xs truncate">{photo.name}</p>
                  <p className="text-white/60 text-xs">{formatFileSize(photo.size)}</p>
                </div>
              </div>
            ))}
            
            {/* Videos */}
            {uploadedVideos.map((video) => (
              <div key={video.id} className="relative group">
                <div className="aspect-square bg-white/10 rounded-lg overflow-hidden">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Video className="w-8 h-8 text-white/50" />
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => removeVideo(video.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                
                <div className="absolute top-2 left-2">
                  <Video className="w-4 h-4 text-white bg-black/50 rounded p-0.5" />
                </div>
                
                <div className="absolute top-2 right-2">
                  <div className="bg-black/70 rounded px-1 py-0.5">
                    <p className="text-white text-xs">{formatDuration(video.duration)}</p>
                  </div>
                </div>
                
                {video.metadata && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/70 rounded px-2 py-1">
                      <p className="text-white text-xs capitalize">{video.metadata.mood}</p>
                    </div>
                  </div>
                )}
                
                <div className="mt-2">
                  <p className="text-white/90 text-xs truncate">{video.name}</p>
                  <p className="text-white/60 text-xs">{formatFileSize(video.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;